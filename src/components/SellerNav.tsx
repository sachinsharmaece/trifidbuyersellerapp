'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale } from '../providers/LocaleProvider';

const LINKS = [
  { href: '/seller', key: 'nav_home' as const },
  { href: '/seller/demand', key: 'nav_demand' as const },
  { href: '/seller/stock', key: 'nav_stock' as const },
  { href: '/seller/orders', key: 'nav_orders' as const },
  { href: '/seller/profile', key: 'nav_profile' as const },
];

export function SellerNav() {
  const { t } = useLocale();
  const pathname = usePathname();
  return (
    <nav className="bottom-nav">
      {LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          aria-current={pathname === link.href ? 'page' : undefined}
        >
          {t(link.key)}
        </Link>
      ))}
    </nav>
  );
}
