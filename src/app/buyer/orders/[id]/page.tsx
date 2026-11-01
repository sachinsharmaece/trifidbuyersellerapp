'use client';

import { use, useState } from 'react';
import { FiCheck, FiAlertCircle } from 'react-icons/fi';
import { Gate } from '../../../../components/Gate';
import { AppHeader } from '../../../../components/AppHeader';
import { AsyncBoundary } from '../../../../components/AsyncBoundary';
import { DevNote } from '../../../../components/dev/DevNote';
import { ProgressLadder } from '../../../../components/ProgressLadder';
import { Clock } from '../../../../components/Clock';
import { Note } from '../../../../components/Note';
import { Card } from '../../../../components/ui/Card';
import { Button, ButtonLink } from '../../../../components/ui/Button';
import { formatRupees } from '../../../../lib/format';
import { useLocale } from '../../../../providers/LocaleProvider';
import { useSession } from '../../../../providers/SessionProvider';
import { useAsyncData } from '../../../../lib/useAsyncData';
import {
  getMyOrder,
  getDocuments,
  getPromotionOffer,
  postConfirmReceipt,
  type BuyerSoDto,
  type OrderDocumentDto,
  type PromotionOfferDto,
} from '../../../../lib/ordersApi';
import type { DictionaryKey } from '../../../../lib/i18n';

const DOC_KEY: Record<OrderDocumentDto['kind'], DictionaryKey> = {
  invoice: 'doc_invoice',
  eway_bill: 'doc_eway_bill',
  lr: 'doc_lr',
  dispatch_photo: 'doc_dispatch_photo',
};

function OrderContent({ soId }: { soId: string }) {
  const { t } = useLocale();
  const { callApi } = useSession();
  const [confirmed, setConfirmed] = useState(false);

  const { state, retry } = useAsyncData<[BuyerSoDto, OrderDocumentDto[], PromotionOfferDto | null]>(
    () =>
      Promise.all([
        callApi((token) => getMyOrder(token, soId)),
        callApi((token) => getDocuments(token, soId)),
        callApi((token) => getPromotionOffer(token, soId)),
      ]),
    () => false,
    [soId],
  );

  return (
    <AsyncBoundary state={state} onRetry={retry}>
      {([order, documents, promotionOffer]) => (
        <div className="flex flex-col gap-4">
          <Card>
            <h2 className="text-lg font-semibold text-slate-900">{order.soNo}</h2>
            <p className="mb-3 text-xl font-bold text-slate-900">
              {formatRupees(order.totalPaise)}
            </p>
            <ProgressLadder rung={order.rung} />
          </Card>

          {promotionOffer && (
            <Card>
              <Note tone="urgent">
                {t('promoted_fallback_title')}
                <Clock targetIso={promotionOffer.expiresAt} />
              </Note>
              <ButtonLink href={`/buyer/orders/${soId}/promotion`} fullWidth className="mt-3">
                {t('view')}
              </ButtonLink>
            </Card>
          )}

          {order.canPay && (
            <Card>
              <Note tone="urgent">
                <Clock targetIso={order.payDeadline} />
              </Note>
              <ButtonLink href={`/buyer/orders/${soId}/pay`} fullWidth className="mt-3">
                {t('order_pay_now')}
              </ButtonLink>
            </Card>
          )}

          {order.leg1 && (
            <p className="text-sm text-slate-500">
              {t('rung_leg1_dispatch')}: {order.leg1.mode}
            </p>
          )}

          {order.canConfirmReceipt && !confirmed && (
            <Card>
              <p className="mb-3 text-sm text-slate-500">{t('order_confirm_receipt_hint')}</p>
              <div className="flex gap-3">
                <Button
                  fullWidth
                  icon={<FiCheck />}
                  onClick={() =>
                    void callApi((token) => postConfirmReceipt(token, soId)).then(() => {
                      setConfirmed(true);
                      retry();
                    })
                  }
                >
                  {t('order_confirm_receipt')}
                </Button>
                <ButtonLink
                  href={`/buyer/orders/${soId}/complaint`}
                  fullWidth
                  variant="secondary"
                  icon={<FiAlertCircle />}
                  className="flex-1"
                >
                  {t('order_raise_complaint')}
                </ButtonLink>
              </div>
            </Card>
          )}

          <Card title={t('order_documents')}>
            <ul className="flex flex-col gap-1.5 text-sm text-slate-700">
              {documents.map((doc) => (
                <li key={doc.kind} className="flex justify-between">
                  <span>{t(DOC_KEY[doc.kind])}</span>
                  <span className={doc.available ? 'text-slate-900' : 'text-slate-400'}>
                    {doc.available ? doc.ref : t('doc_not_available_yet')}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </AsyncBoundary>
  );
}

export default function OrderDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = use(props.params);
  const { t } = useLocale();

  return (
    <Gate>
      <main className="mx-auto max-w-lg p-4 md:max-w-2xl">
        <AppHeader title={t('orders_title')} backHref={'/buyer/orders'} />
        <DevNote screen="buyer_order_detail" />
        <OrderContent soId={id} />
      </main>
    </Gate>
  );
}
