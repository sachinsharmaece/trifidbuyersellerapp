'use client';

import { Gate } from '../../../components/Gate';
import { LocaleToggle } from '../../../components/LocaleToggle';
import { AsyncBoundary } from '../../../components/AsyncBoundary';
import { BuyerNav } from '../../../components/BuyerNav';
import { DevNote } from '../../../components/dev/DevNote';
import { Note } from '../../../components/Note';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
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
    <div className="flex flex-col gap-4">
      <Card>
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
          <dt className="font-medium text-slate-500">{t('profile_mobile')}</dt>
          <dd className="text-slate-900">{me?.mobile}</dd>
        </dl>
      </Card>

      <AsyncBoundary state={state} onRetry={retry}>
        {([conduct, locations, refunds]) => (
          <>
            <Card title={t('conduct_title')}>
              <p className="mb-1 text-sm text-slate-700">
                {t('conduct_rate_views')}: {conduct.rateViews} / {conduct.rateViewThreshold}
              </p>
              <p className="text-sm text-slate-500">{t('conduct_no_strikes_yet')}</p>
            </Card>

            <Card title={t('delivery_locations_title')}>
              <p className="mb-3 text-sm text-slate-500">{t('delivery_locations_hint')}</p>
              <ul className="flex flex-col gap-1.5 text-sm text-slate-700">
                {locations.map((loc) => (
                  <li key={loc.locationId}>
                    {loc.label} — {loc.address}
                  </li>
                ))}
              </ul>
            </Card>

            {refunds.length > 0 && (
              <Card title={t('refunds_title')}>
                <ul className="flex flex-col gap-1.5 text-sm text-slate-700">
                  {refunds.map((r) => (
                    <li key={r.refundId} className="flex justify-between">
                      <span>{formatRupees(r.amountPaise)}</span>
                      <span className="text-slate-500">{r.state}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </>
        )}
      </AsyncBoundary>

      <Card title={t('help_title')}>
        <Note>{t('help_call_desk_body')}</Note>
      </Card>
    </div>
  );
}

export default function BuyerProfilePage() {
  const { t } = useLocale();
  const { logout } = useSession();

  return (
    <Gate>
      <main className="mx-auto max-w-lg p-4 pb-20">
        <header className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-900">{t('profile_title')}</h1>
          <div className="flex items-center gap-2">
            <LocaleToggle />
            <Button variant="ghost" size="sm" onClick={() => void logout()}>
              {t('sign_out')}
            </Button>
          </div>
        </header>
        <DevNote screen="buyer_profile" />
        <ProfileSections />
        <BuyerNav />
      </main>
    </Gate>
  );
}
