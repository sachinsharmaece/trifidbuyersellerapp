'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale } from '../providers/LocaleProvider';

const LINKS = [
  { href: '/buyer', key: 'nav_home' as const },
  { href: '/buyer/orders', key: 'nav_orders' as const },
  { href: '/buyer/profile', key: 'nav_profile' as const },
];

export function BuyerNav() {
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
