'use client';

import { Gate } from '../../../components/Gate';
import { LocaleToggle } from '../../../components/LocaleToggle';
import { AsyncBoundary } from '../../../components/AsyncBoundary';
import { BuyerNav } from '../../../components/BuyerNav';
import { Note } from '../../../components/Note';
import { formatRupees } from '../../../lib/format';
import { useLocale } from '../../../providers/LocaleProvider';
import { useSession } from '../../../providers/SessionProvider';
import { useAsyncData } from '../../../lib/useAsyncData';
import { getConduct, type BuyerConductDto } from '../../../lib/conductApi';
import { getMyDeliveryLocations, type DeliveryLocation } from '../../../lib/listingApi';
import { getMyRefunds, type BuyerRefundDto } from '../../../lib/ordersApi';

function ProfileSections() {
  const { t } = useLocale();
  const { me } = useSession();
  const { callApi } = useSession();

  const { state, retry } = useAsyncData<[BuyerConductDto, DeliveryLocation[], BuyerRefundDto[]]>(
    () =>
      Promise.all([
        callApi((token) => getConduct(token)),
        callApi((token) => getMyDeliveryLocations(token)),
        callApi((token) => getMyRefunds(token)),
      ]),
    () => false,
    [],
  );

  return (
    <div>
      <dl>
        <dt>{t('profile_mobile')}</dt>
        <dd>{me?.mobile}</dd>
      </dl>

      <AsyncBoundary state={state} onRetry={retry}>
        {([conduct, locations, refunds]) => (
          <div>
            <h2>{t('conduct_title')}</h2>
            <p>
              {t('conduct_rate_views')}: {conduct.rateViews} / {conduct.rateViewThreshold}
            </p>
            <p className="hint">{t('conduct_no_strikes_yet')}</p>

            <h2>{t('delivery_locations_title')}</h2>
            <p className="hint">{t('delivery_locations_hint')}</p>
            <ul>
              {locations.map((loc) => (
                <li key={loc.locationId}>
                  {loc.label} — {loc.address}
                </li>
              ))}
            </ul>

            {refunds.length > 0 && (
              <>
                <h2>{t('refunds_title')}</h2>
                <ul>
                  {refunds.map((r) => (
                    <li key={r.refundId}>
                      {formatRupees(r.amountPaise)} — {r.state}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
      </AsyncBoundary>

      <h2>{t('help_title')}</h2>
      <Note>{t('help_call_desk_body')}</Note>
    </div>
  );
}

export default function BuyerProfilePage() {
  const { t } = useLocale();
  const { logout } = useSession();

  return (
    <Gate>
      <main className="with-bottom-nav">
        <header className="page-header">
          <h1>{t('profile_title')}</h1>
          <div className="page-header__actions">
            <LocaleToggle />
            <button type="button" onClick={() => void logout()}>
              {t('sign_out')}
            </button>
          </div>
        </header>
        <ProfileSections />
        <BuyerNav />
      </main>
    </Gate>
  );
}
