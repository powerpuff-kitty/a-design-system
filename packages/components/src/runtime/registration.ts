export interface AdsElementConstructor extends CustomElementConstructor {
  new (...args: never[]): HTMLElement;
}

export interface RegisterAdsElementOptions {
  prefix?: string;
  registry?: CustomElementRegistry;
}

function getDefaultRegistry(): CustomElementRegistry | undefined {
  return typeof globalThis.customElements === 'undefined' ? undefined : globalThis.customElements;
}

/**
 * Registers an ADS element without touching `customElements` during SSR.
 *
 * Custom prefixes are supported by registering a generated subclass, because
 * the Custom Elements specification does not allow one constructor to be
 * registered under multiple tag names.
 */
export function registerAdsElement<T extends AdsElementConstructor>(
  localName: string,
  constructor: T,
  options: RegisterAdsElementOptions = {},
): string {
  const prefix = options.prefix ?? 'ads';
  const tagName = `${prefix}-${localName}`;
  const registry = options.registry ?? getDefaultRegistry();

  if (!registry) return tagName;

  const existing = registry.get(tagName);
  if (existing) {
    if (existing === constructor || constructor.prototype instanceof existing) return tagName;
    throw new DOMException(`Custom element ${tagName} is already defined`, 'NotSupportedError');
  }

  const canonicalName = registry.getName?.(constructor);
  if (canonicalName && canonicalName !== tagName) {
    const AliasElement = class extends constructor {};
    registry.define(tagName, AliasElement);
  } else {
    registry.define(tagName, constructor);
  }

  return tagName;
}
