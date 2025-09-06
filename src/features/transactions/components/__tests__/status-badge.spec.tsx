import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StatusBadge } from '../StatusBadge';
import { renderWithProviders } from '../../../../test-utils';

// Chakra Badge does not render visible text as a simple text node in jsdom; use role/name.

describe('StatusBadge', () => {
  it('renders badge without tooltip for non-failed statuses', async () => {
    renderWithProviders(<StatusBadge status="Settled" />);
    const badge = screen.getByLabelText(/transaction status: settled/i);
    expect(badge).toBeInTheDocument();
    expect(screen.queryByText(/insufficient/i)).not.toBeInTheDocument();
  });

  it('shows tooltip with error message for Failed status on hover', async () => {
    const user = userEvent.setup();
    const error = 'Insufficient funds in account';
    renderWithProviders(<StatusBadge status="Failed" errorMessage={error} />);

    const badge = screen.getByLabelText(/transaction status: failed/i);
    await user.hover(badge);

    expect(await screen.findByText(error)).toBeInTheDocument();
  });
});
