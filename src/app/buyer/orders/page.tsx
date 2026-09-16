'use client';

import Link from 'next/link';
import { Gate } from '../../../components/Gate';
import { LocaleToggle } from '../../../components/LocaleToggle';
import { AsyncBoundary } from '../../../components/AsyncBoundary';
import { BuyerNav } from '../../../components/BuyerNav';
import { DevNote } from '../../../components/dev/DevNote';
import { formatRupees } from '../../../lib/format';
import { useLocale } from '../../../providers/LocaleProvider';
import { useSession } from '../../../providers/SessionProvider';
import { useAsyncData } from '../../../lib/useAsyncData';
import { getMyOrders, type BuyerSoDto } from '../../../lib/ordersApi';
import type { DictionaryKey } from '../../../lib/i18n';

const RUNG_KEY: Record<string, DictionaryKey> = {
  placed: 'rung_placed',
  payment: 'rung_payment',
  seller_confirmed: 'rung_seller_confirmed',
  leg1_dispatch: 'rung_leg1_dispatch',
  paperwork_at_indore: 'rung_paperwork_at_indore',
  leg2_dispatch: 'rung_leg2_dispatch',
  delivered: 'rung_delivered',
  closed: 'rung_closed',
  stopped: 'rung_stopped',
};

function OrdersContent() {
  const { t } = useLocale();
  const { callApi } = useSession();
  const { state, retry } = useAsyncData<BuyerSoDto[]>(
    () => callApi((token) => getMyOrders(token)),
    (items) => items.length === 0,
    [],
  );

  return (
    <AsyncBoundary state={state} onRetry={retry} emptyMessage={t('nothing_yet')}>
      {(orders) => (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <Link key={order.soId} href={`/buyer/orders/${order.soId}`}>
              <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex items-center justify-between">
                  <strong className="text-slate-900">{order.soNo}</strong>
                  <span className="font-semibold text-slate-900">
                    {formatRupees(order.totalPaise)}
                  </span>
                </div>
                <div className="mt-1 text-sm text-slate-500">
                  {t(RUNG_KEY[order.rung] ?? 'rung_placed')}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </AsyncBoundary>
  );
}

export default function BuyerOrdersPage() {
  const { t } = useLocale();
  return (
    <Gate>
      <main className="mx-auto max-w-lg p-4 pb-20">
        <header className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-900">{t('orders_title')}</h1>
          <LocaleToggle />
        </header>
        <DevNote screen="buyer_orders" />
        <OrdersContent />
        <BuyerNav />
      </main>
    </Gate>
  );
}
