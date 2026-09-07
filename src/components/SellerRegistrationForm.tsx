'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { registerSeller, type SellerReferenceInput } from '../lib/onboardingApi';
import { isValidGstin, isValidIfsc } from '../lib/validators';
import { ApiError } from '../lib/apiErrors';
import { useLocale } from '../providers/LocaleProvider';

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
    <div className="auth-page">
      <h1>{t('reg_seller_title')}</h1>
      <p className="hint">
        Step {step} of {TOTAL_STEPS}
      </p>

      {step === 1 && (
        <form onSubmit={goNext}>
          <label htmlFor="s-mobile">Mobile number</label>
          <input
            id="s-mobile"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            maxLength={10}
            required
          />
          <label htmlFor="s-firm">Firm name</label>
          <input id="s-firm" value={firm} onChange={(e) => setFirm(e.target.value)} required />
          <label htmlFor="s-gstin">GSTIN</label>
          <input
            id="s-gstin"
            value={gstin}
            onChange={(e) => setGstin(e.target.value.toUpperCase())}
            maxLength={15}
            required
          />
          <label htmlFor="s-owner">Owner name</label>
          <input
            id="s-owner"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            required
          />
          <label htmlFor="s-licence">Insecticide licence number</label>
          <input
            id="s-licence"
            value={licenceNo}
            onChange={(e) => setLicenceNo(e.target.value)}
            required
          />
          {error && (
            <p className="note-urgent" role="alert">
              {error}
            </p>
          )}
          <button type="submit">{t('next')}</button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={goNext}>
          <p className="hint">{'BR-250 — two or more named referees. No godown video calls.'}</p>
          {references.map((reference, index) => (
            <fieldset key={index}>
              <legend>Reference {index + 1}</legend>
              <label htmlFor={`ref-firm-${index}`}>Their firm</label>
              <input
                id={`ref-firm-${index}`}
                value={reference.firm}
                onChange={(e) => updateReference(index, 'firm', e.target.value)}
                required
              />
              <label htmlFor={`ref-phone-${index}`}>Their phone</label>
              <input
                id={`ref-phone-${index}`}
                value={reference.phone}
                onChange={(e) => updateReference(index, 'phone', e.target.value)}
                required
              />
              <label htmlFor={`ref-rel-${index}`}>Relationship to you</label>
              <input
                id={`ref-rel-${index}`}
                value={reference.relationship}
                onChange={(e) => updateReference(index, 'relationship', e.target.value)}
                required
              />
              <label htmlFor={`ref-said-${index}`}>What should they tell us about you?</label>
              <input
                id={`ref-said-${index}`}
                value={reference.whatTheySaid}
                onChange={(e) => updateReference(index, 'whatTheySaid', e.target.value)}
                required
              />
            </fieldset>
          ))}
          <button
            type="button"
            onClick={() => setReferences((current) => [...current, emptyReference()])}
          >
            Add another reference
          </button>
          {error && (
            <p className="note-urgent" role="alert">
              {error}
            </p>
          )}
          <div className="btnrow">
            <button type="button" onClick={goBack}>
              {t('back')}
            </button>
            <button type="submit">{t('next')}</button>
          </div>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={goNext}>
          <label htmlFor="s-account">Bank account number</label>
          <input
            id="s-account"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            required
          />
          <label htmlFor="s-ifsc">IFSC code</label>
          <input
            id="s-ifsc"
            value={ifsc}
            onChange={(e) => setIfsc(e.target.value.toUpperCase())}
            maxLength={11}
            required
          />
          <label htmlFor="s-acname">Account holder name</label>
          <input
            id="s-acname"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            required
          />
          {error && (
            <p className="note-urgent" role="alert">
              {error}
            </p>
          )}
          <div className="btnrow">
            <button type="button" onClick={goBack}>
              {t('back')}
            </button>
            <button type="submit">{t('next')}</button>
          </div>
        </form>
      )}

      {step === 4 && (
        <form onSubmit={handleSubmit}>
          <h2>Review</h2>
          <dl>
            <dt>Firm</dt>
            <dd>{firm}</dd>
            <dt>GSTIN</dt>
            <dd>{gstin}</dd>
            <dt>Mobile</dt>
            <dd>{mobile}</dd>
            <dt>References</dt>
            <dd>{references.length}</dd>
          </dl>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
            />
            I accept the terms of trade and the consent notice.
          </label>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={marketingOptIn}
              onChange={(e) => setMarketingOptIn(e.target.checked)}
            />
            Send me offers and updates (optional).
          </label>
          {error && (
            <p className="note-urgent" role="alert">
              {error}
            </p>
          )}
          <div className="btnrow">
            <button type="button" onClick={goBack}>
              {t('back')}
            </button>
            <button type="submit" disabled={!termsAccepted || submitting}>
              {submitting ? 'Submitting…' : t('submit')}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
