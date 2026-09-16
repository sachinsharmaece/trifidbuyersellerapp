'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';
import { useLocale } from '../../providers/LocaleProvider';
import { useSession } from '../../providers/SessionProvider';
import { requestOtp, verifyOtp } from '../../lib/identityApi';
import { getDeviceFingerprint } from '../../lib/deviceFingerprint';
import { ApiError } from '../../lib/apiErrors';
import { env } from '../../lib/env';
import { routeForMe } from '../../lib/routeForMe';
import { LocaleToggle } from '../../components/LocaleToggle';
import { DevNote } from '../../components/dev/DevNote';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Note } from '../../components/Note';

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
        router.push(`/register?mobile=${encodeURIComponent(mobile)}`);
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
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-sm">
          <div className="mb-4 flex justify-center">
            <LocaleToggle />
          </div>
          <Note tone="urgent">{t('locked_out')}</Note>
          <Button variant="secondary" fullWidth className="mt-4" onClick={() => setStep('phone')}>
            {t('back')}
          </Button>
        </Card>
      </main>
    );
  }

  if (step === 'otp') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-sm">
          <div className="mb-4 flex justify-center">
            <LocaleToggle />
          </div>
          <h1 className="mb-4 text-lg font-semibold text-slate-900">{t('enter_code')}</h1>
          <form onSubmit={submitOtp} className="flex flex-col gap-3">
            {otpNote === 'new_device' && <Note tone="wait">{t('new_device')}</Note>}
            <input
              inputMode="numeric"
              maxLength={6}
              autoFocus
              value={code}
              onChange={(event) => setCode(event.target.value)}
              aria-label={t('enter_code')}
              className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-center text-lg tracking-widest focus:border-brand-500 focus:outline focus:outline-2 focus:outline-brand-500/30"
            />
            {otpNote === 'otp_wrong' && <Note tone="urgent">{t('code_wrong')}</Note>}
            {otpNote === 'otp_expired' && <Note tone="urgent">{t('code_expired')}</Note>}
            {genericError && <Note tone="urgent">{genericError}</Note>}
            {env.isDevelopment && devCode && (
              <p className="font-mono text-xs text-slate-400">Dev code: {devCode}</p>
            )}
            <Button type="submit" fullWidth loading={submitting} disabled={code.length !== 6}>
              {t('verify')}
            </Button>
            <Button
              type="button"
              variant="secondary"
              fullWidth
              disabled={submitting}
              onClick={() => void resendCode()}
            >
              {t('resend')}
            </Button>
            <Button
              type="button"
              variant="ghost"
              icon={<FiArrowLeft />}
              onClick={() => setStep('phone')}
            >
              {t('back')}
            </Button>
          </form>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-sm">
        <div className="mb-4 flex justify-center">
          <LocaleToggle />
        </div>
        <h1 className="mb-4 text-lg font-semibold text-slate-900">{t('enter_mobile')}</h1>
        <DevNote screen="login" />
        <form onSubmit={submitPhone} className="flex flex-col gap-3">
          <input
            type="tel"
            inputMode="numeric"
            maxLength={10}
            placeholder={t('mobile_placeholder')}
            value={mobile}
            onChange={(event) => setMobile(event.target.value)}
            aria-label={t('enter_mobile')}
            className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-base focus:border-brand-500 focus:outline focus:outline-2 focus:outline-brand-500/30"
          />
          {genericError && <Note tone="urgent">{genericError}</Note>}
          <Button type="submit" fullWidth loading={submitting} disabled={mobile.length !== 10}>
            {t('send_code')}
          </Button>
        </form>
      </Card>
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
