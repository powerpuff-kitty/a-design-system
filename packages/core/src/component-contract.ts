export type AdsComponentStatus = 'experimental' | 'stable' | 'deprecated';

export interface AdsAttributeContract {
  name: string;
  type: string;
  description?: string;
  default?: string;
  required?: boolean;
}

export interface AdsPropertyContract {
  name: string;
  type: string;
  description?: string;
  readonly?: boolean;
}

export interface AdsEventContract {
  name: string;
  detail?: string;
  description?: string;
  bubbles: boolean;
  composed: boolean;
  cancelable?: boolean;
}

export interface AdsSlotContract {
  name: string;
  description?: string;
}

export interface AdsCssPartContract {
  name: string;
  description?: string;
}

export interface AdsCssCustomPropertyContract {
  name: `--ads-${string}`;
  description?: string;
  default?: string;
}

export interface AdsStateContract {
  name: string;
  description?: string;
}

export interface AdsComponentContract {
  name: string;
  tagName: `ads-${string}` | `a-design-system-${string}`;
  description: string;
  status: AdsComponentStatus;
  since?: string;
  attributes?: readonly AdsAttributeContract[];
  properties?: readonly AdsPropertyContract[];
  events?: readonly AdsEventContract[];
  slots?: readonly AdsSlotContract[];
  parts?: readonly AdsCssPartContract[];
  cssCustomProperties?: readonly AdsCssCustomPropertyContract[];
  states?: readonly AdsStateContract[];
}

/**
 * Defines and validates the machine-readable contract used to generate docs,
 * manifests, framework adapters, registry metadata, and compatibility checks.
 */
export function defineComponentContract<const T extends AdsComponentContract>(contract: T): Readonly<T> {
  if (!contract.tagName.includes('-')) {
    throw new TypeError(`Custom element tag must contain a hyphen: ${contract.tagName}`);
  }

  if (!contract.tagName.startsWith('ads-') && !contract.tagName.startsWith('a-design-system-')) {
    throw new TypeError(`Unsupported A Design System element namespace: ${contract.tagName}`);
  }

  for (const token of contract.cssCustomProperties ?? []) {
    if (!token.name.startsWith('--ads-')) {
      throw new TypeError(`ADS CSS custom properties must use the --ads-* namespace: ${token.name}`);
    }
  }

  return Object.freeze(contract);
}
