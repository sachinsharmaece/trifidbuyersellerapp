'use client';

import Link from 'next/link';
import { Gate } from '../../components/Gate';
import { LocaleToggle } from '../../components/LocaleToggle';
import { SellerNav } from '../../components/SellerNav';
import { useLocale } from '../../providers/LocaleProvider';
import { useSession } from '../../providers/SessionProvider';

export default function SellerPage() {
  const { t } = useLocale();
  const { logout } = useSession();

  return (
    <Gate>
      <main className="with-bottom-nav">
        <header className="page-header">
          <h1>{t('seller_home_title')}</h1>
          <div className="page-header__actions">
            <LocaleToggle />
            <button type="button" onClick={() => void logout()}>
              {t('sign_out')}
            </button>
          </div>
        </header>
        <div className="card">
          <p>
            <Link href="/seller/listing/create">{t('create_listing_title')}</Link>
          </p>
          <p>
            <Link href="/seller/confirmations">{t('confirmations_title')}</Link>
          </p>
          <p>
            <Link href="/seller/claims">{t('claim_board_title')}</Link>
          </p>
          <p>
            <Link href="/seller/quotes">{t('my_rates_given_title')}</Link>
          </p>
          <p>
            <Link href="/seller/area">{t('area_page_title')}</Link>
          </p>
        </div>
        <SellerNav />
      </main>
    </Gate>
  );
}
