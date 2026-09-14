'use client';

import Link from 'next/link';
import { Gate } from '../../../components/Gate';
import { LocaleToggle } from '../../../components/LocaleToggle';
import { AsyncBoundary } from '../../../components/AsyncBoundary';
import { SellerNav } from '../../../components/SellerNav';
import { SellerOrderCard } from '../../../components/SellerOrderCard';
import { useLocale } from '../../../providers/LocaleProvider';
import { useSession } from '../../../providers/SessionProvider';
import { useAsyncData } from '../../../lib/useAsyncData';
import { getMySellerOrders, type SellerPoDto } from '../../../lib/ordersApi';

function OrdersContent() {
  const { t } = useLocale();
  const { callApi } = useSession();
  const { state, retry } = useAsyncData<SellerPoDto[]>(
    () => callApi((token) => getMySellerOrders(token)),
    (items) => items.length === 0,
    [],
  );

  return (
    <AsyncBoundary state={state} onRetry={retry} emptyMessage={t('nothing_yet')}>
      {(orders) => (
        <div>
          {orders.map((order) => (
            <Link
              key={order.poId}
              href={`/seller/orders/${order.poId}`}
              style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
            >
              <SellerOrderCard order={order} />
            </Link>
          ))}
        </div>
      )}
    </AsyncBoundary>
  );
}

export default function SellerOrdersPage() {
  const { t } = useLocale();
  return (
    <Gate>
      <main className="with-bottom-nav">
        <header className="page-header">
          <h1>{t('orders_title')}</h1>
          <LocaleToggle />
        </header>
        <OrdersContent />
        <SellerNav />
      </main>
    </Gate>
  );
}
