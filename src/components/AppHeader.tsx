'use client';

import { useEffect } from 'react';
import type { MouseEvent, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FiArrowLeft, FiLogOut } from 'react-icons/fi';
import { LocaleToggle } from './LocaleToggle';
import { Button } from './ui/Button';
import { useLocale } from '../providers/LocaleProvider';
import { useSession } from '../providers/SessionProvider';

// How many screens this tab has shown since the app loaded. Above one, "back" can safely
// step back through history; on a screen opened directly it goes to the parent instead.
let screensShown = 0;

/** Called once by the buyer and seller layouts so the back button knows the history is ours. */
export function useScreenCounter(): void {
  const pathname = usePathname();
  useEffect(() => {
    screensShown += 1;
  }, [pathname]);
}

/**
 * The top of every buyer / seller screen: back (on an inner screen), the title, the language
 * toggle, and sign out where the screen offers it. Stays pinned while the page scrolls.
 */
export function AppHeader({
  title,
  backHref,
  showSignOut = false,
}: {
  title: ReactNode;
  /** Where back goes when there is no in-app history (a link opened from SMS, a reload). */
  backHref?: string;
  showSignOut?: boolean;
}) {
  const { t } = useLocale();
  const { logout } = useSession();
  const router = useRouter();

  function onBack(event: MouseEvent<HTMLAnchorElement>): void {
    if (screensShown > 1 && !event.metaKey && !event.ctrlKey && !event.shiftKey) {
      event.preventDefault();
      router.back();
    }
  }

  return (
    <header className="sticky top-0 z-20 -mx-4 -mt-4 mb-4 flex items-center gap-2 border-b border-slate-200/80 bg-slate-50/90 px-4 py-2.5 backdrop-blur supports-[backdrop-filter]:bg-slate-50/75">
      {backHref && (
        <Link
          href={backHref}
          onClick={onBack}
          aria-label={t('back')}
          className="-ml-2 flex size-10 shrink-0 items-center justify-center rounded-full text-slate-700 hover:bg-slate-200/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600"
        >
          <FiArrowLeft className="text-xl" aria-hidden />
        </Link>
      )}
      <h1 className="min-w-0 flex-1 text-lg leading-tight font-semibold break-words text-slate-900">
        {title}
      </h1>
      <div className="flex shrink-0 items-center gap-1.5">
        <LocaleToggle />
        {showSignOut && (
          <Button variant="ghost" size="sm" icon={<FiLogOut />} onClick={() => void logout()}>
            {t('sign_out')}
          </Button>
        )}
      </div>
    </header>
  );
}
