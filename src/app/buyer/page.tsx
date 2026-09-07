'use client';

import { Gate } from '../../components/Gate';
import { LocaleToggle } from '../../components/LocaleToggle';
import { useLocale } from '../../providers/LocaleProvider';
import { useSession } from '../../providers/SessionProvider';

export default function BuyerPage() {
  const { t } = useLocale();
  const { logout } = useSession();

  return (
    <Gate>
      <main>
        <header className="page-header">
          <h1>{t('buyer_home_title')}</h1>
          <div className="page-header__actions">
            <LocaleToggle />
            <button type="button" onClick={() => void logout()}>
              {t('sign_out')}
            </button>
          </div>
        </header>
        <p>{t('buyer_home_body')}</p>
      </main>
    </Gate>
  );
}
