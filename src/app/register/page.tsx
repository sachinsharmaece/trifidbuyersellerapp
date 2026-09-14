'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiCheckCircle } from 'react-icons/fi';
import { useLocale } from '../../providers/LocaleProvider';
import { LocaleToggle } from '../../components/LocaleToggle';
import { BuyerRegistrationForm } from '../../components/BuyerRegistrationForm';
import { SellerRegistrationForm } from '../../components/SellerRegistrationForm';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

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
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-sm text-center">
          <div className="mb-4 flex justify-center">
            <LocaleToggle />
          </div>
          <FiCheckCircle className="mx-auto mb-3 text-3xl text-success-500" aria-hidden />
          <h1 className="mb-2 text-lg font-semibold text-slate-900">{t('reg_success_title')}</h1>
          <p className="mb-6 text-sm text-slate-600">{t('reg_success_body')}</p>
          <Button fullWidth onClick={() => router.push('/login')}>
            {t('go_to_login')}
          </Button>
        </Card>
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
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-sm text-center">
        <div className="mb-4 flex justify-center">
          <LocaleToggle />
        </div>
        <h1 className="mb-4 text-lg font-semibold text-slate-900">{t('choose_role_title')}</h1>
        <div className="flex flex-col gap-3">
          <Button fullWidth onClick={() => setRole('buyer')}>
            {t('register_as_buyer')}
          </Button>
          <Button fullWidth variant="secondary" onClick={() => setRole('seller')}>
            {t('register_as_seller')}
          </Button>
        </div>
      </Card>
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
