'use client';

import Link from 'next/link';
import { FiPlusCircle, FiInbox, FiFlag, FiTag, FiMapPin, FiChevronRight } from 'react-icons/fi';
import { Gate } from '../../components/Gate';
import { AppHeader } from '../../components/AppHeader';
import { Card } from '../../components/ui/Card';
import { useLocale } from '../../providers/LocaleProvider';

const LINKS = [
  { href: '/seller/listing/create', key: 'create_listing_title' as const, icon: FiPlusCircle },
  { href: '/seller/confirmations', key: 'confirmations_title' as const, icon: FiInbox },
  { href: '/seller/claims', key: 'claim_board_title' as const, icon: FiFlag },
  { href: '/seller/quotes', key: 'my_rates_given_title' as const, icon: FiTag },
  { href: '/seller/area', key: 'area_page_title' as const, icon: FiMapPin },
];

export default function SellerPage() {
  const { t } = useLocale();

  return (
    <Gate>
      <main className="mx-auto max-w-lg p-4 md:max-w-2xl">
        <AppHeader title={t('seller_home_title')} showSignOut />
        <Card className="p-0">
          {LINKS.map((link, index) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 ${
                  index > 0 ? 'border-t border-slate-100' : ''
                }`}
              >
                <Icon className="text-lg text-brand-500" aria-hidden />
                <span className="flex-1">{t(link.key)}</span>
                <FiChevronRight className="text-slate-300" aria-hidden />
              </Link>
            );
          })}
        </Card>
      </main>
    </Gate>
  );
}
