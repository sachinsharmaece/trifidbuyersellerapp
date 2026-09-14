'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { FiArrowLeft, FiArrowRight, FiCheck, FiPlus } from 'react-icons/fi';
import { registerSeller, type SellerReferenceInput } from '../lib/onboardingApi';
import { isValidGstin, isValidIfsc } from '../lib/validators';
import { ApiError } from '../lib/apiErrors';
import { useLocale } from '../providers/LocaleProvider';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Note } from './Note';
import { Stepper } from './Stepper';

const NOTICE_VERSION = 'v1';
const TOTAL_STEPS = 4;
const MIN_REFERENCES = 2;

function emptyReference(): SellerReferenceInput {
  return { firm: '', phone: '', relationship: '', whatTheySaid: '' };
}

interface SellerRegistrationFormProps {
  initialMobile: string;
  onDone: () => void;
}

export function SellerRegistrationForm({ initialMobile, onDone }: SellerRegistrationFormProps) {
  const { t } = useLocale();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [mobile, setMobile] = useState(initialMobile);
  const [firm, setFirm] = useState('');
  const [gstin, setGstin] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [licenceNo, setLicenceNo] = useState('');
  const [references, setReferences] = useState<SellerReferenceInput[]>([
    emptyReference(),
    emptyReference(),
  ]);
  const [accountNumber, setAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [accountName, setAccountName] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);

  function updateReference(index: number, field: keyof SellerReferenceInput, value: string): void {
    setReferences((current) =>
      current.map((reference, i) => (i === index ? { ...reference, [field]: value } : reference)),
    );
  }

  function goNext(event: FormEvent): void {
    event.preventDefault();
    setError(null);
    if (step === 1 && !isValidGstin(gstin)) {
      setError('That GSTIN does not check out. Double check it and try again.');
      return;
    }
    if (
      step === 2 &&
      references.some((r) => !r.firm || !r.phone || !r.relationship || !r.whatTheySaid)
    ) {
      setError(`BR-250 — at least ${MIN_REFERENCES} complete references are required.`);
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
      await registerSeller({
        mobile,
        firm,
        gstin,
        ownerName,
        licenceNo,
        references,
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
        <h1 className="mb-1 text-lg font-semibold text-slate-900">{t('reg_seller_title')}</h1>
        <Stepper current={step} total={TOTAL_STEPS} />

        {step === 1 && (
          <form onSubmit={goNext} className="flex flex-col gap-4">
            <Input
              id="s-mobile"
              label="Mobile number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              maxLength={10}
              required
            />
            <Input
              id="s-firm"
              label="Firm name"
              value={firm}
              onChange={(e) => setFirm(e.target.value)}
              required
            />
            <Input
              id="s-gstin"
              label="GSTIN"
              value={gstin}
              onChange={(e) => setGstin(e.target.value.toUpperCase())}
              maxLength={15}
              required
            />
            <Input
              id="s-owner"
              label="Owner name"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              required
            />
            <Input
              id="s-licence"
              label="Insecticide licence number"
              value={licenceNo}
              onChange={(e) => setLicenceNo(e.target.value)}
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
            <p className="text-sm text-slate-500">
              BR-250 — two or more named referees. No godown video calls.
            </p>
            {references.map((reference, index) => (
              <fieldset key={index} className="rounded-md border border-slate-300 p-3">
                <legend className="px-1 text-sm font-medium text-slate-700">
                  Reference {index + 1}
                </legend>
                <div className="flex flex-col gap-3">
                  <Input
                    id={`ref-firm-${index}`}
                    label="Their firm"
                    value={reference.firm}
                    onChange={(e) => updateReference(index, 'firm', e.target.value)}
                    required
                  />
                  <Input
                    id={`ref-phone-${index}`}
                    label="Their phone"
                    value={reference.phone}
                    onChange={(e) => updateReference(index, 'phone', e.target.value)}
                    required
                  />
                  <Input
                    id={`ref-rel-${index}`}
                    label="Relationship to you"
                    value={reference.relationship}
                    onChange={(e) => updateReference(index, 'relationship', e.target.value)}
                    required
                  />
                  <Input
                    id={`ref-said-${index}`}
                    label="What should they tell us about you?"
                    value={reference.whatTheySaid}
                    onChange={(e) => updateReference(index, 'whatTheySaid', e.target.value)}
                    required
                  />
                </div>
              </fieldset>
            ))}
            <Button
              type="button"
              variant="secondary"
              icon={<FiPlus />}
              onClick={() => setReferences((current) => [...current, emptyReference()])}
            >
              Add another reference
            </Button>
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
              id="s-account"
              label="Bank account number"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              required
            />
            <Input
              id="s-ifsc"
              label="IFSC code"
              value={ifsc}
              onChange={(e) => setIfsc(e.target.value.toUpperCase())}
              maxLength={11}
              required
            />
            <Input
              id="s-acname"
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
              <dt className="font-medium text-slate-500">References</dt>
              <dd className="text-slate-900">{references.length}</dd>
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
