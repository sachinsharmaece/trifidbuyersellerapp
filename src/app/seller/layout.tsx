'use client';

import { SellerNav } from '../../components/SellerNav';
import { useScreenCounter } from '../../components/AppHeader';

/** Every /seller screen: the page, room at the bottom for the tab bar, then the tab bar. */
export default function SellerLayout({ children }: LayoutProps<'/seller'>) {
  useScreenCounter();
  return (
    <>
      <div className="pb-[calc(4rem+env(safe-area-inset-bottom))]">{children}</div>
      <SellerNav />
    </>
  );
}
