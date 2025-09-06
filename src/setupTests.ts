import '@testing-library/jest-dom';

// Polyfill missing APIs in jsdom used by Chakra floating-ui tooltips
class ResizeObserverPolyfill {
  observe() {}
  unobserve() {}
  disconnect() {}
}
// @ts-ignore
if (typeof (globalThis as any).ResizeObserver === 'undefined') {
  // @ts-ignore
  (globalThis as any).ResizeObserver = ResizeObserverPolyfill;
}
