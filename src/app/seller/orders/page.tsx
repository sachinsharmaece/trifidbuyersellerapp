'use client';

import Link from 'next/link';
import { Gate } from '../../../components/Gate';
import { AppHeader } from '../../../components/AppHeader';
import { AsyncBoundary } from '../../../components/AsyncBoundary';
import { DevNote } from '../../../components/dev/DevNote';
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
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <Link key={order.poId} href={`/seller/orders/${order.poId}`}>
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
      <main className="mx-auto max-w-lg p-4 md:max-w-2xl">
        <AppHeader title={t('orders_title')} />
        <DevNote screen="seller_orders" />
        <OrdersContent />
      </main>
    </Gate>
  );
}
