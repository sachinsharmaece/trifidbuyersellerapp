'use client';

import { BuyerNav } from '../../components/BuyerNav';
import { useScreenCounter } from '../../components/AppHeader';

/** Every /buyer screen: the page, room at the bottom for the tab bar, then the tab bar. */
export default function BuyerLayout({ children }: LayoutProps<'/buyer'>) {
  useScreenCounter();
  return (
    <>
      <div className="pb-[calc(4rem+env(safe-area-inset-bottom))]">{children}</div>
      <BuyerNav />
    </>
  );
}
