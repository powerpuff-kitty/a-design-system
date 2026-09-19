import '@a-design-system/components';
import '@a-design-system/css/minimal-workspace.css';
import { compileTokens } from '@a-design-system/tokens';
import minimalLight from '@a-design-system/tokens/themes/minimal-light.json';
import minimalDark from '@a-design-system/tokens/themes/minimal-dark.json';
import minimalHighContrast from '@a-design-system/tokens/themes/minimal-high-contrast.json';

type LabTheme = 'minimal-light' | 'minimal-dark' | 'minimal-high-contrast';

const THEMES = {
  'minimal-light': minimalLight,
  'minimal-dark': minimalDark,
  'minimal-high-contrast': minimalHighContrast,
} as const;

function selectedTheme(): LabTheme {
  const requested = new URLSearchParams(window.location.search).get('theme');
  return requested && Object.hasOwn(THEMES, requested) ? requested as LabTheme : 'minimal-light';
}

function installTheme(theme: LabTheme): void {
  const compiled = compileTokens(THEMES[theme]);
  const style = document.createElement('style');
  style.id = 'ads-component-lab-theme';
  style.textContent = `${compiled.css}
    :root {
      color-scheme: ${theme === 'minimal-dark' ? 'dark' : 'light'};
      font-family: var(--ads-font-family-ui);
      font-size: var(--ads-font-size-md);
      color: var(--ads-color-text-default);
      background: var(--ads-color-surface-page);
      --ads-focus-color: var(--ads-color-focus-ring);
      --ads-disabled-opacity: var(--ads-opacity-disabled);
      --ads-control-size: var(--ads-size-control-default);
    }

    * { box-sizing: border-box; }

    html, body {
      min-block-size: 100%;
      margin: 0;
      background: var(--ads-color-surface-page);
      color: var(--ads-color-text-default);
    }

    body {
      min-block-size: 100dvh;
      font: var(--ads-font-weight-regular) var(--ads-font-size-md) / var(--ads-font-lineHeight-body) var(--ads-font-family-ui);
    }

    #sandbox {
      min-block-size: 100dvh;
      padding: var(--ads-space-6);
    }

    #sandbox:empty::before {
      display: block;
      max-inline-size: 48rem;
      padding-block: var(--ads-space-4);
      border-block: var(--ads-border-width-hairline) solid var(--ads-color-line-default);
      color: var(--ads-color-text-muted);
      font: var(--ads-font-weight-medium) var(--ads-font-size-xs) / var(--ads-font-lineHeight-ui) var(--ads-font-family-mono);
      letter-spacing: var(--ads-font-tracking-eyebrow);
      text-transform: uppercase;
      content: 'A Design System · Minimal component lab';
    }
  `;
  document.head.append(style);
  document.documentElement.dataset.adsTheme = theme;
}

installTheme(selectedTheme());

// Browser tests and future visual fixtures wait for this marker before
// interacting with custom elements. It guarantees module evaluation,
// canonical ADS registrations, and the selected reference theme are ready.
document.documentElement.dataset.adsReady = 'true';
