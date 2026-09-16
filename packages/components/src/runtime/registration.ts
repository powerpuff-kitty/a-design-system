export interface AdsElementConstructor extends CustomElementConstructor {
  new (...args: any[]): HTMLElement;
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
 * Custom prefixes are supported by registering a generated subclass when the
 * original constructor has already been used for another custom-element name.
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
    if (existing === constructor || existing.prototype instanceof constructor) return tagName;
    throw new DOMException(`Custom element ${tagName} is already defined`, 'NotSupportedError');
  }

  try {
    registry.define(tagName, constructor);
  } catch (error) {
    if (!(error instanceof DOMException) || error.name !== 'NotSupportedError') throw error;

    // A constructor can only be defined once. A subclass preserves behavior
    // while allowing enterprise/custom prefixes without relying on getName().
    const AliasElement = class extends constructor {
      constructor(...args: any[]) {
        super(...args);
      }
    };
    registry.define(tagName, AliasElement);
  }

  return tagName;
}
