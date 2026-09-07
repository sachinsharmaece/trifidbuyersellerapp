'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { registerBuyer } from '../lib/onboardingApi';
import { isValidGstin, isValidIfsc } from '../lib/validators';
import { ApiError } from '../lib/apiErrors';
import { useLocale } from '../providers/LocaleProvider';

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
    <div className="auth-page">
      <h1>{t('reg_buyer_title')}</h1>
      <p className="hint">
        Step {step} of {TOTAL_STEPS}
      </p>

      {step === 1 && (
        <form onSubmit={goNext}>
          <label htmlFor="b-mobile">Mobile number</label>
          <input
            id="b-mobile"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            maxLength={10}
            required
          />
          <label htmlFor="b-firm">Firm name</label>
          <input id="b-firm" value={firm} onChange={(e) => setFirm(e.target.value)} required />
          <label htmlFor="b-gstin">GSTIN</label>
          <input
            id="b-gstin"
            value={gstin}
            onChange={(e) => setGstin(e.target.value.toUpperCase())}
            maxLength={15}
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
          <label htmlFor="b-owner">Owner name</label>
          <input
            id="b-owner"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            required
          />
          <label htmlFor="b-ppob">Principal place of business (from your GST certificate)</label>
          <input
            id="b-ppob"
            value={gstPpobAddress}
            onChange={(e) => setGstPpobAddress(e.target.value)}
            required
          />
          <label htmlFor="b-licence">Insecticide licence number</label>
          <input
            id="b-licence"
            value={licenceNo}
            onChange={(e) => setLicenceNo(e.target.value)}
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

      {step === 3 && (
        <form onSubmit={goNext}>
          <label htmlFor="b-account">Bank account number</label>
          <input
            id="b-account"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            required
          />
          <label htmlFor="b-ifsc">IFSC code</label>
          <input
            id="b-ifsc"
            value={ifsc}
            onChange={(e) => setIfsc(e.target.value.toUpperCase())}
            maxLength={11}
            required
          />
          <label htmlFor="b-acname">Account holder name</label>
          <input
            id="b-acname"
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
