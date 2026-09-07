import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BuyerRegistrationForm } from '../src/components/BuyerRegistrationForm';
import { registerBuyer } from '../src/lib/onboardingApi';
import { useLocale } from '../src/providers/LocaleProvider';

vi.mock('../src/lib/onboardingApi', () => ({
  registerBuyer: vi.fn(),
}));
vi.mock('../src/providers/LocaleProvider', () => ({
  useLocale: vi.fn(),
}));

function setUpLocale() {
  vi.mocked(useLocale).mockReturnValue({
    locale: 'en',
    setLocale: vi.fn(),
    t: (key: string) => {
      const strings: Record<string, string> = {
        reg_buyer_title: 'Buyer registration',
        next: 'Next',
        back: 'Back',
        submit: 'Submit',
      };
      return strings[key] ?? key;
    },
  });
}

describe('BuyerRegistrationForm (GSTIN checksum gate)', () => {
  it('refuses to advance past step 1 on a checksum-invalid GSTIN', () => {
    setUpLocale();
    render(<BuyerRegistrationForm initialMobile="9876543210" onDone={vi.fn()} />);

    fireEvent.change(screen.getByLabelText(/firm name/i), { target: { value: 'Test Firm' } });
    fireEvent.change(screen.getByLabelText(/gstin/i), { target: { value: '23AAAAA0000A1Z5' } }); // wrong checksum
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    expect(screen.getByText(/does not check out/i)).toBeInTheDocument();
    // Still on step 1 — the owner-name field from step 2 has not appeared.
    expect(screen.queryByLabelText(/owner name/i)).not.toBeInTheDocument();
  });

  it('submits the full form once every step is valid', async () => {
    setUpLocale();
    vi.mocked(registerBuyer).mockResolvedValue({ registrationId: 'abc123' });
    const onDone = vi.fn();
    render(<BuyerRegistrationForm initialMobile="9876543210" onDone={onDone} />);

    fireEvent.change(screen.getByLabelText(/firm name/i), { target: { value: 'Test Firm' } });
    fireEvent.change(screen.getByLabelText(/gstin/i), { target: { value: '27AAPFU0939F1ZV' } }); // checksum-valid
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    fireEvent.change(await screen.findByLabelText(/owner name/i), { target: { value: 'Owner' } });
    fireEvent.change(screen.getByLabelText(/principal place/i), {
      target: { value: 'Some address' },
    });
    fireEvent.change(screen.getByLabelText(/licence number/i), { target: { value: 'LIC-1' } });
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    fireEvent.change(await screen.findByLabelText(/account number/i), {
      target: { value: '123456789012' },
    });
    fireEvent.change(screen.getByLabelText(/ifsc/i), { target: { value: 'HDFC0001234' } });
    fireEvent.change(screen.getByLabelText(/account holder/i), { target: { value: 'Owner' } });
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    fireEvent.click(await screen.findByLabelText(/accept the terms/i));
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => expect(onDone).toHaveBeenCalled());
    expect(registerBuyer).toHaveBeenCalledWith(
      expect.objectContaining({ firm: 'Test Firm', gstin: '27AAPFU0939F1ZV' }),
    );
  });
});
