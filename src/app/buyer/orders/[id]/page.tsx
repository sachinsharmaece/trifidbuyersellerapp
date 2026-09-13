'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { Gate } from '../../../../components/Gate';
import { LocaleToggle } from '../../../../components/LocaleToggle';
import { AsyncBoundary } from '../../../../components/AsyncBoundary';
import { ProgressLadder } from '../../../../components/ProgressLadder';
import { Clock } from '../../../../components/Clock';
import { Note } from '../../../../components/Note';
import { formatRupees } from '../../../../lib/format';
import { useLocale } from '../../../../providers/LocaleProvider';
import { useSession } from '../../../../providers/SessionProvider';
import { useAsyncData } from '../../../../lib/useAsyncData';
import {
  getMyOrder,
  getDocuments,
  postConfirmReceipt,
  type BuyerSoDto,
  type OrderDocumentDto,
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

  const { state, retry } = useAsyncData<[BuyerSoDto, OrderDocumentDto[]]>(
    () =>
      Promise.all([
        callApi((token) => getMyOrder(token, soId)),
        callApi((token) => getDocuments(token, soId)),
      ]),
    () => false,
    [soId],
  );

  return (
    <AsyncBoundary state={state} onRetry={retry}>
      {([order, documents]) => (
        <div>
          <h2>{order.soNo}</h2>
          <p>{formatRupees(order.totalPaise)}</p>
          <ProgressLadder rung={order.rung} />

          {order.canPay && (
            <div>
              <Note tone="urgent">
                <Clock targetIso={order.payDeadline} />
              </Note>
              <Link href={`/buyer/orders/${soId}/pay`}>
                <button type="button">{t('order_pay_now')}</button>
              </Link>
            </div>
          )}

          {order.leg1 && (
            <p className="hint">
              {t('rung_leg1_dispatch')}: {order.leg1.mode}
            </p>
          )}

          {order.canConfirmReceipt && !confirmed && (
            <div>
              <p className="hint">{t('order_confirm_receipt_hint')}</p>
              <div className="btnrow">
                <button
                  type="button"
                  onClick={() =>
                    void callApi((token) => postConfirmReceipt(token, soId)).then(() => {
                      setConfirmed(true);
                      retry();
                    })
                  }
                >
                  {t('order_confirm_receipt')}
                </button>
                <Link href={`/buyer/orders/${soId}/complaint`}>
                  <button type="button">{t('order_raise_complaint')}</button>
                </Link>
              </div>
            </div>
          )}

          <h2>{t('order_documents')}</h2>
          <ul>
            {documents.map((doc) => (
              <li key={doc.kind}>
                {t(DOC_KEY[doc.kind])} — {doc.available ? doc.ref : t('doc_not_available_yet')}
              </li>
            ))}
          </ul>
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
      <main>
        <header className="page-header">
          <h1>{t('orders_title')}</h1>
          <LocaleToggle />
        </header>
        <OrderContent soId={id} />
      </main>
    </Gate>
  );
}
