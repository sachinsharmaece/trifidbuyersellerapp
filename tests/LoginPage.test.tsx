import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from '../src/app/login/page';
import { requestOtp, verifyOtp } from '../src/lib/identityApi';
import { useSession } from '../src/providers/SessionProvider';
import { useLocale } from '../src/providers/LocaleProvider';

const push = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace: vi.fn() }),
}));
vi.mock('../src/lib/identityApi', () => ({
  requestOtp: vi.fn(),
  verifyOtp: vi.fn(),
}));
vi.mock('../src/providers/SessionProvider', () => ({
  useSession: vi.fn(),
}));
vi.mock('../src/providers/LocaleProvider', () => ({
  useLocale: vi.fn(),
}));

function setUpLocale() {
  vi.mocked(useLocale).mockReturnValue({
    locale: 'en',
    setLocale: vi.fn(),
    t: (key: string) => {
      const englishOnly: Record<string, string> = {
        enter_mobile: 'Enter your mobile number',
        mobile_placeholder: '10-digit mobile number',
        send_code: 'Send code',
        enter_code: 'Enter the code sent to your phone',
        verify: 'Verify',
        resend: 'Resend code',
        back: 'Back',
        code_wrong: 'That code is not right. Check the message and enter it again.',
        code_expired: 'This code has expired. Ask for a new one.',
        new_device: 'New device. We sent a fresh code to your registered mobile.',
        locked_out: 'Too many attempts. Try again after 30 minutes, or call the sales desk.',
        network_error: 'Could not reach the server. Check your connection and try again.',
      };
      return englishOnly[key] ?? key;
    },
  });
}

describe('LoginPage (counterparty OTP flow)', () => {
  it('routes an unknown mobile to the registration placeholder', async () => {
    setUpLocale();
    vi.mocked(useSession).mockReturnValue({
      status: 'anonymous',
      me: null,
      applySession: vi.fn(),
      logout: vi.fn(),
      callApi: vi.fn(),
    });
    vi.mocked(requestOtp).mockResolvedValue({
      expiresIn: 300,
      maskedMobile: '98******10',
      accountExists: false,
    });

    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/enter your mobile number/i), {
      target: { value: '9876543210' },
    });
    fireEvent.click(screen.getByRole('button', { name: /send code/i }));

    await waitFor(() => expect(push).toHaveBeenCalledWith('/register?mobile=9876543210'));
  });

  it('shows the otp_wrong note on an invalid code', async () => {
    setUpLocale();
    vi.mocked(useSession).mockReturnValue({
      status: 'anonymous',
      me: null,
      applySession: vi.fn(),
      logout: vi.fn(),
      callApi: vi.fn(),
    });
    vi.mocked(requestOtp).mockResolvedValue({
      requestId: 'otp-1',
      expiresIn: 300,
      maskedMobile: '98******10',
      accountExists: true,
      devCode: '123456',
    });
    const { ApiError } = await import('../src/lib/apiErrors');
    vi.mocked(verifyOtp).mockRejectedValue(new ApiError({ code: 'OTP_INVALID', message: 'wrong' }));

    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/enter your mobile number/i), {
      target: { value: '9876543210' },
    });
    fireEvent.click(screen.getByRole('button', { name: /send code/i }));

    await waitFor(() => expect(screen.getByLabelText(/enter the code sent/i)).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText(/enter the code sent/i), {
      target: { value: '000000' },
    });
    fireEvent.click(screen.getByRole('button', { name: /verify/i }));

    expect(await screen.findByText(/that code is not right/i)).toBeInTheDocument();
  });
});
