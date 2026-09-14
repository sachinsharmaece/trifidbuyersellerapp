'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiShoppingBag, FiUser } from 'react-icons/fi';
import { useLocale } from '../providers/LocaleProvider';

const LINKS = [
  { href: '/buyer', key: 'nav_home' as const, icon: FiHome },
  { href: '/buyer/orders', key: 'nav_orders' as const, icon: FiShoppingBag },
  { href: '/buyer/profile', key: 'nav_profile' as const, icon: FiUser },
];

export function BuyerNav() {
  const { t } = useLocale();
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)]">
      {LINKS.map((link) => {
        const active = pathname === link.href;
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? 'page' : undefined}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs ${
              active ? 'font-semibold text-brand-600' : 'text-slate-500'
            }`}
          >
            <Icon className="text-lg" aria-hidden />
            {t(link.key)}
          </Link>
        );
      })}
    </nav>
  );
}
