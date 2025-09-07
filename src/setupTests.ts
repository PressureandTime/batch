import '@testing-library/jest-dom';

// Polyfill missing APIs in jsdom used by Chakra floating-ui tooltips
class ResizeObserverPolyfill {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}
if (typeof (globalThis as unknown as { ResizeObserver?: unknown }).ResizeObserver === 'undefined') {
  (globalThis as unknown as { ResizeObserver?: unknown }).ResizeObserver =
    ResizeObserverPolyfill as unknown;
}
