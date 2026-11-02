'use client';

import { FiHome, FiList, FiPackage, FiShoppingBag, FiUser } from 'react-icons/fi';
import { BottomNav, type BottomNavLink } from './BottomNav';

const LINKS: BottomNavLink[] = [
  { href: '/seller', key: 'nav_home', icon: FiHome },
  { href: '/seller/demand', key: 'nav_demand', icon: FiList },
  { href: '/seller/stock', key: 'nav_stock', icon: FiPackage },
  { href: '/seller/orders', key: 'nav_orders', icon: FiShoppingBag },
  { href: '/seller/profile', key: 'nav_profile', icon: FiUser },
];

export function SellerNav() {
  return <BottomNav links={LINKS} />;
}
