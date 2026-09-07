'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '../../providers/LocaleProvider';
import { useSession } from '../../providers/SessionProvider';
import { requestOtp, verifyOtp } from '../../lib/identityApi';
import { getDeviceFingerprint } from '../../lib/deviceFingerprint';
import { ApiError } from '../../lib/apiErrors';
import { env } from '../../lib/env';
import { routeForMe } from '../../lib/routeForMe';
import { LocaleToggle } from '../../components/LocaleToggle';

// The six OTP states from the buyer/seller prototypes (MASTER_PLAN.md §M2
// frontend scope): phone, otp, otp_wrong, otp_expired, locked, new_device.
type Step = 'phone' | 'otp' | 'locked';
type OtpNote = null | 'otp_wrong' | 'otp_expired' | 'new_device';

export default function LoginPage() {
  const { t } = useLocale();
  const { applySession } = useSession();
  const router = useRouter();

  const [step, setStep] = useState<Step>('phone');
  const [mobile, setMobile] = useState('');
  const [requestId, setRequestId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [otpNote, setOtpNote] = useState<OtpNote>(null);
  const [genericError, setGenericError] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submitPhone(event: FormEvent): Promise<void> {
    event.preventDefault();
    setGenericError(null);
    setSubmitting(true);
    try {
      const result = await requestOtp(mobile);
      if (!result.accountExists) {
        router.push('/register');
        return;
      }
      setRequestId(result.requestId ?? null);
      setDevCode(result.devCode ?? null);
      setOtpNote(null);
      setCode('');
      setStep('otp');
    } catch (error) {
      if (error instanceof ApiError && error.code === 'LOCKED_OUT') {
        setStep('locked');
      } else {
        setGenericError(messageFor(error, t));
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function submitOtp(event: FormEvent): Promise<void> {
    event.preventDefault();
    if (!requestId) return;
    setGenericError(null);
    setSubmitting(true);
    try {
      const result = await verifyOtp(requestId, code, getDeviceFingerprint());
      applySession(result.accessToken, result.me);
      router.push(routeForMe(result.me));
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.code === 'OTP_INVALID') {
          setOtpNote('otp_wrong');
          return;
        }
        if (error.code === 'OTP_EXPIRED') {
          setOtpNote('otp_expired');
          return;
        }
        if (error.code === 'NEW_DEVICE') {
          setOtpNote('new_device');
          setCode('');
          return;
        }
        if (error.code === 'LOCKED_OUT') {
          setStep('locked');
          return;
        }
      }
      setGenericError(messageFor(error, t));
    } finally {
      setSubmitting(false);
    }
  }

  async function resendCode(): Promise<void> {
    setGenericError(null);
    setSubmitting(true);
    try {
      const result = await requestOtp(mobile);
      setRequestId(result.requestId ?? null);
      setDevCode(result.devCode ?? null);
      setOtpNote(null);
      setCode('');
    } catch (error) {
      if (error instanceof ApiError && error.code === 'LOCKED_OUT') {
        setStep('locked');
      } else {
        setGenericError(messageFor(error, t));
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (step === 'locked') {
    return (
      <main className="auth-page">
        <LocaleToggle />
        <p className="note note-urgent">{t('locked_out')}</p>
        <button type="button" onClick={() => setStep('phone')}>
          {t('back')}
        </button>
      </main>
    );
  }

  if (step === 'otp') {
    return (
      <main className="auth-page">
        <LocaleToggle />
        <h1>{t('enter_code')}</h1>
        <form onSubmit={submitOtp}>
          {otpNote === 'new_device' && <p className="note note-wait">{t('new_device')}</p>}
          <input
            inputMode="numeric"
            maxLength={6}
            autoFocus
            value={code}
            onChange={(event) => setCode(event.target.value)}
            aria-label={t('enter_code')}
          />
          {otpNote === 'otp_wrong' && (
            <p className="note note-urgent" role="alert">
              {t('code_wrong')}
            </p>
          )}
          {otpNote === 'otp_expired' && (
            <p className="note note-urgent" role="alert">
              {t('code_expired')}
            </p>
          )}
          {genericError && (
            <p className="note note-urgent" role="alert">
              {genericError}
            </p>
          )}
          {env.isDevelopment && devCode && <p className="dev-hint">Dev code: {devCode}</p>}
          <button type="submit" disabled={submitting || code.length !== 6}>
            {t('verify')}
          </button>
          <button type="button" disabled={submitting} onClick={() => void resendCode()}>
            {t('resend')}
          </button>
          <button type="button" onClick={() => setStep('phone')}>
            {t('back')}
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <LocaleToggle />
      <h1>{t('enter_mobile')}</h1>
      <form onSubmit={submitPhone}>
        <input
          type="tel"
          inputMode="numeric"
          maxLength={10}
          placeholder={t('mobile_placeholder')}
          value={mobile}
          onChange={(event) => setMobile(event.target.value)}
          aria-label={t('enter_mobile')}
        />
        {genericError && (
          <p className="note note-urgent" role="alert">
            {genericError}
          </p>
        )}
        <button type="submit" disabled={submitting || mobile.length !== 10}>
          {t('send_code')}
        </button>
      </form>
    </main>
  );
}

function messageFor(error: unknown, t: (key: 'network_error') => string): string {
  if (error instanceof ApiError && error.code === 'NETWORK_ERROR') {
    return t('network_error');
  }
  if (error instanceof ApiError) {
    return error.message;
  }
  return t('network_error');
}
