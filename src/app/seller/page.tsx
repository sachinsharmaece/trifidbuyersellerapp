'use client';

import Link from 'next/link';
import { Gate } from '../../components/Gate';
import { LocaleToggle } from '../../components/LocaleToggle';
import { useLocale } from '../../providers/LocaleProvider';
import { useSession } from '../../providers/SessionProvider';

export default function SellerPage() {
  const { t } = useLocale();
  const { logout } = useSession();

  return (
    <Gate>
      <main>
        <header className="page-header">
          <h1>{t('seller_home_title')}</h1>
          <div className="page-header__actions">
            <LocaleToggle />
            <button type="button" onClick={() => void logout()}>
              {t('sign_out')}
            </button>
          </div>
        </header>
        <p>{t('seller_home_body')}</p>
        <p>
          <Link href="/seller/area">{t('area_page_title')}</Link>
        </p>
      </main>
    </Gate>
  );
}
