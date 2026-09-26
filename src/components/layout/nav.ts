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

function tabIndex(pathname: string) {
  return NAV_ITEMS.findIndex(item => isActive(pathname, item.href))
}

export type NavType = 'nav-forward' | 'nav-back'

/**
 * Which way the page should slide when going from `from` to `to`:
 * later tabs and deeper pages are "forward", earlier tabs and parents are "back".
 */
export function navType(from: string, to: string): NavType[] {
  if (from === to) return []
  if (to !== '/' && from.startsWith(`${to}/`)) return ['nav-back']
  if (from !== '/' && to.startsWith(`${from}/`)) return ['nav-forward']
  const a = tabIndex(from)
  const b = tabIndex(to)
  if (a === -1 || b === -1 || a === b) return []
  return [b > a ? 'nav-forward' : 'nav-back']
}
