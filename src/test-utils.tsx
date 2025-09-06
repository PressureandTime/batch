import React from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { AppProviders } from './providers/AppProviders';

export const renderWithProviders = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) =>
  render(ui, {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <AppProviders>{children}</AppProviders>
    ),
    ...options,
  });
