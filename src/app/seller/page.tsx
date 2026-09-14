'use client';

import Link from 'next/link';
import { FiPlusCircle, FiInbox, FiFlag, FiTag, FiMapPin, FiChevronRight } from 'react-icons/fi';
import { Gate } from '../../components/Gate';
import { LocaleToggle } from '../../components/LocaleToggle';
import { SellerNav } from '../../components/SellerNav';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useLocale } from '../../providers/LocaleProvider';
import { useSession } from '../../providers/SessionProvider';

const LINKS = [
  { href: '/seller/listing/create', key: 'create_listing_title' as const, icon: FiPlusCircle },
  { href: '/seller/confirmations', key: 'confirmations_title' as const, icon: FiInbox },
  { href: '/seller/claims', key: 'claim_board_title' as const, icon: FiFlag },
  { href: '/seller/quotes', key: 'my_rates_given_title' as const, icon: FiTag },
  { href: '/seller/area', key: 'area_page_title' as const, icon: FiMapPin },
];

export default function SellerPage() {
  const { t } = useLocale();
  const { logout } = useSession();

  return (
    <Gate>
      <main className="mx-auto max-w-lg p-4 pb-20">
        <header className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-900">{t('seller_home_title')}</h1>
          <div className="flex items-center gap-2">
            <LocaleToggle />
            <Button variant="ghost" size="sm" onClick={() => void logout()}>
              {t('sign_out')}
            </Button>
          </div>
        </header>
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
        <SellerNav />
      </main>
    </Gate>
  );
}
