'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale } from '../../providers/LocaleProvider';
import { LocaleToggle } from '../../components/LocaleToggle';
import { BuyerRegistrationForm } from '../../components/BuyerRegistrationForm';
import { SellerRegistrationForm } from '../../components/SellerRegistrationForm';

type Role = 'buyer' | 'seller' | null;

function RegisterContent() {
  const { t } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMobile = searchParams.get('mobile') ?? '';

  const [role, setRole] = useState<Role>(null);
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <main className="auth-page">
        <LocaleToggle />
        <h1>{t('reg_success_title')}</h1>
        <p>{t('reg_success_body')}</p>
        <button type="button" onClick={() => router.push('/login')}>
          {t('go_to_login')}
        </button>
      </main>
    );
  }

  if (role === 'buyer') {
    return <BuyerRegistrationForm initialMobile={initialMobile} onDone={() => setDone(true)} />;
  }
  if (role === 'seller') {
    return <SellerRegistrationForm initialMobile={initialMobile} onDone={() => setDone(true)} />;
  }

  return (
    <main className="auth-page">
      <LocaleToggle />
      <h1>{t('choose_role_title')}</h1>
      <div className="btnrow">
        <button type="button" onClick={() => setRole('buyer')}>
          {t('register_as_buyer')}
        </button>
        <button type="button" onClick={() => setRole('seller')}>
          {t('register_as_seller')}
        </button>
      </div>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterContent />
    </Suspense>
  );
}
