import { ChartColumn, CircleCheckBig, LayoutList, UserRound, type LucideIcon } from 'lucide-react'

export const NAV_ITEMS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: '/', label: 'Today', icon: CircleCheckBig },
  { href: '/insights', label: 'Insights', icon: ChartColumn },
  { href: '/habits', label: 'Habits', icon: LayoutList },
  { href: '/you', label: 'You', icon: UserRound },
]

export function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`)
}
