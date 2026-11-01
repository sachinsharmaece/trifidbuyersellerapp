'use client';

import { FiHome, FiShoppingBag, FiUser } from 'react-icons/fi';
import { BottomNav, type BottomNavLink } from './BottomNav';

const LINKS: BottomNavLink[] = [
  { href: '/buyer', key: 'nav_home', icon: FiHome },
  { href: '/buyer/orders', key: 'nav_orders', icon: FiShoppingBag },
  { href: '/buyer/profile', key: 'nav_profile', icon: FiUser },
];

export function BuyerNav() {
  return <BottomNav links={LINKS} />;
}
