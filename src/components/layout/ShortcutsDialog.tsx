'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAppStore } from '@/store/useAppStore'

const SHORTCUTS: [string, string][] = [
  ['1 – 9', "Check off that habit for today"],
  ['N', 'New habit'],
  ['Ctrl / ⌘ + K', 'Search and commands'],
  ['?', 'Show this list'],
]

export function ShortcutsDialog() {
  const open = useAppStore(s => s.shortcutsOpen)
  const setOpen = useAppStore(s => s.setShortcutsOpen)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
          <DialogDescription>They work anywhere except while you’re typing.</DialogDescription>
        </DialogHeader>
        <dl className="grid gap-2.5">
          {SHORTCUTS.map(([keys, label]) => (
            <div key={keys} className="flex items-center justify-between gap-4 text-sm">
              <dt className="text-muted-foreground">{label}</dt>
              <dd>
                <kbd className="rounded-md border bg-muted px-2 py-0.5 font-mono text-xs">{keys}</kbd>
              </dd>
            </div>
          ))}
        </dl>
      </DialogContent>
    </Dialog>
  )
}
