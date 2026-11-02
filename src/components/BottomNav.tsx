'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { IconType } from 'react-icons';
import { useLocale } from '../providers/LocaleProvider';
import { useSession } from '../providers/SessionProvider';
import type { DictionaryKey } from '../lib/i18n';

export interface BottomNavLink {
  href: string;
  key: DictionaryKey;
  icon: IconType;
}

/**
 * The tab bar pinned to the bottom of every buyer / seller screen. The tab whose address is
 * the longest match for the current page is the open one — so an order's own page still
 * lights up "Orders". Shown only to a signed-in, active account (Gate decides the rest).
 */
export function BottomNav({ links }: { links: BottomNavLink[] }) {
  const { t } = useLocale();
  const { status, me } = useSession();
  const pathname = usePathname();

  if (status !== 'authenticated' || me?.status !== 'active') return null;

  const active = links
    .filter((link) => pathname === link.href || pathname.startsWith(`${link.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0];

  return (
    <nav
      aria-label={t('app_name')}
      className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur supports-[backdrop-filter]:bg-white/85"
    >
      <div className="mx-auto flex max-w-2xl">
        {links.map((link) => {
          const isActive = link === active;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-xs transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-600 ${
                isActive ? 'font-semibold text-brand-600' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {isActive && (
                <span
                  aria-hidden
                  className="absolute inset-x-6 top-0 h-0.5 rounded-b bg-brand-500"
                />
              )}
              <Icon className="text-xl" aria-hidden />
              {t(link.key)}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
