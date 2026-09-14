'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { FiArrowLeft, FiArrowRight, FiCheck } from 'react-icons/fi';
import { registerBuyer } from '../lib/onboardingApi';
import { isValidGstin, isValidIfsc } from '../lib/validators';
import { ApiError } from '../lib/apiErrors';
import { useLocale } from '../providers/LocaleProvider';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Note } from './Note';
import { Stepper } from './Stepper';

// There is no endpoint to fetch "the current consent notice version" — it is
// a fixed constant here, the same way ARCHITECTURE.md §10 treats other
// not-yet-config-driven values. Bump this by hand if the terms of trade text
// changes; the real config-master-driven version is a later milestone.
const NOTICE_VERSION = 'v1';
const TOTAL_STEPS = 4;

interface BuyerRegistrationFormProps {
  initialMobile: string;
  onDone: () => void;
}

export function BuyerRegistrationForm({ initialMobile, onDone }: BuyerRegistrationFormProps) {
  const { t } = useLocale();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [mobile, setMobile] = useState(initialMobile);
  const [firm, setFirm] = useState('');
  const [gstin, setGstin] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [gstPpobAddress, setGstPpobAddress] = useState('');
  const [licenceNo, setLicenceNo] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [accountName, setAccountName] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);

  function goNext(event: FormEvent): void {
    event.preventDefault();
    setError(null);
    if (step === 1 && !isValidGstin(gstin)) {
      setError('That GSTIN does not check out. Double check it and try again.');
      return;
    }
    if (step === 3 && !isValidIfsc(ifsc)) {
      setError('That IFSC code is not valid.');
      return;
    }
    setStep((current) => Math.min(current + 1, TOTAL_STEPS));
  }

  function goBack(): void {
    setError(null);
    setStep((current) => Math.max(current - 1, 1));
  }

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await registerBuyer({
        mobile,
        firm,
        gstin,
        ownerName,
        licenceNo,
        gstPpobAddress,
        bankDetail: { accountNumber, ifsc, accountName },
        consent: { noticeVersion: NOTICE_VERSION, marketingOptIn },
      });
      onDone();
    } catch (submitError) {
      setError(
        submitError instanceof ApiError
          ? submitError.message
          : 'Something went wrong. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-sm">
        <h1 className="mb-1 text-lg font-semibold text-slate-900">{t('reg_buyer_title')}</h1>
        <Stepper current={step} total={TOTAL_STEPS} />

        {step === 1 && (
          <form onSubmit={goNext} className="flex flex-col gap-4">
            <Input
              id="b-mobile"
              label="Mobile number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              maxLength={10}
              required
            />
            <Input
              id="b-firm"
              label="Firm name"
              value={firm}
              onChange={(e) => setFirm(e.target.value)}
              required
            />
            <Input
              id="b-gstin"
              label="GSTIN"
              value={gstin}
              onChange={(e) => setGstin(e.target.value.toUpperCase())}
              maxLength={15}
              required
            />
            {error && <Note tone="urgent">{error}</Note>}
            <Button type="submit" fullWidth icon={<FiArrowRight />}>
              {t('next')}
            </Button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={goNext} className="flex flex-col gap-4">
            <Input
              id="b-owner"
              label="Owner name"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              required
            />
            <Input
              id="b-ppob"
              label="Principal place of business (from your GST certificate)"
              value={gstPpobAddress}
              onChange={(e) => setGstPpobAddress(e.target.value)}
              required
            />
            <Input
              id="b-licence"
              label="Insecticide licence number"
              value={licenceNo}
              onChange={(e) => setLicenceNo(e.target.value)}
              required
            />
            {error && <Note tone="urgent">{error}</Note>}
            <div className="flex gap-3">
              <Button type="button" variant="secondary" icon={<FiArrowLeft />} onClick={goBack}>
                {t('back')}
              </Button>
              <Button type="submit" fullWidth icon={<FiArrowRight />}>
                {t('next')}
              </Button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={goNext} className="flex flex-col gap-4">
            <Input
              id="b-account"
              label="Bank account number"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              required
            />
            <Input
              id="b-ifsc"
              label="IFSC code"
              value={ifsc}
              onChange={(e) => setIfsc(e.target.value.toUpperCase())}
              maxLength={11}
              required
            />
            <Input
              id="b-acname"
              label="Account holder name"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              required
            />
            {error && <Note tone="urgent">{error}</Note>}
            <div className="flex gap-3">
              <Button type="button" variant="secondary" icon={<FiArrowLeft />} onClick={goBack}>
                {t('back')}
              </Button>
              <Button type="submit" fullWidth icon={<FiArrowRight />}>
                {t('next')}
              </Button>
            </div>
          </form>
        )}

        {step === 4 && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <h2 className="text-sm font-semibold text-slate-900">Review</h2>
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
              <dt className="font-medium text-slate-500">Firm</dt>
              <dd className="text-slate-900">{firm}</dd>
              <dt className="font-medium text-slate-500">GSTIN</dt>
              <dd className="text-slate-900">{gstin}</dd>
              <dt className="font-medium text-slate-500">Mobile</dt>
              <dd className="text-slate-900">{mobile}</dd>
            </dl>
            <label className="flex items-start gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-slate-300"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
              />
              I accept the terms of trade and the consent notice.
            </label>
            <label className="flex items-start gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-slate-300"
                checked={marketingOptIn}
                onChange={(e) => setMarketingOptIn(e.target.checked)}
              />
              Send me offers and updates (optional).
            </label>
            {error && <Note tone="urgent">{error}</Note>}
            <div className="flex gap-3">
              <Button type="button" variant="secondary" icon={<FiArrowLeft />} onClick={goBack}>
                {t('back')}
              </Button>
              <Button
                type="submit"
                fullWidth
                loading={submitting}
                disabled={!termsAccepted}
                icon={<FiCheck />}
              >
                {t('submit')}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </main>
  );
}
