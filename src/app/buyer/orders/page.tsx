'use client';

import Link from 'next/link';
import { Gate } from '../../../components/Gate';
import { LocaleToggle } from '../../../components/LocaleToggle';
import { AsyncBoundary } from '../../../components/AsyncBoundary';
import { BuyerNav } from '../../../components/BuyerNav';
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
        <div>
          {orders.map((order) => (
            <Link
              key={order.soId}
              href={`/buyer/orders/${order.soId}`}
              style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
            >
              <div className="card">
                <div className="page-header">
                  <strong>{order.soNo}</strong>
                  <span>{formatRupees(order.totalPaise)}</span>
                </div>
                <div className="hint">{t(RUNG_KEY[order.rung] ?? 'rung_placed')}</div>
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
      <main className="with-bottom-nav">
        <header className="page-header">
          <h1>{t('orders_title')}</h1>
          <LocaleToggle />
        </header>
        <OrdersContent />
        <BuyerNav />
      </main>
    </Gate>
  );
}
