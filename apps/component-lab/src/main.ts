import '@a-design-system/components';

// Browser tests and future visual fixtures wait for this marker before
// interacting with custom elements. It guarantees module evaluation and
// canonical ADS registrations have completed.
document.documentElement.dataset.adsReady = 'true';
