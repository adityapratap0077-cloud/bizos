'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  House,
  UsersThree,
  User,
  Checks,
  CalendarBlank,
  Receipt,
  GearSix,
  UserCircle,
  SignOut,
  List,
  X,
  type Icon as PhosphorIcon,
} from '@phosphor-icons/react';
import { signOutAction } from '@/actions/auth';

/**
 * App shell — ink sidebar (the brand anchor), pine active states.
 * Mobile: top bar + slide-in drawer. Desktop: fixed rail.
 */

const NAV: { href: string; label: string; icon: PhosphorIcon }[] = [
  { href: '/dashboard', label: 'Dashboard', icon: House },
  { href: '/leads', label: 'Leads', icon: UsersThree },
  { href: '/customers', label: 'Customers', icon: User },
  { href: '/tasks', label: 'Tasks', icon: Checks },
  { href: '/bookings', label: 'Bookings', icon: CalendarBlank },
  { href: '/invoices', label: 'Invoices', icon: Receipt },
  { href: '/settings', label: 'Settings', icon: GearSix },
  { href: '/profile', label: 'Profile', icon: UserCircle },
];

function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`flex items-center justify-center rounded-control bg-pine-600 font-display font-bold text-white ${
          compact ? 'h-8 w-8 text-sm' : 'h-10 w-10 text-lg'
        }`}
        aria-hidden="true"
      >
        B
      </div>
      <div className="min-w-0 leading-none">
        <p className="font-display text-[17px] font-bold tracking-tight text-white">BizOS</p>
        {!compact && (
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-400">
            Business OS
          </p>
        )}
      </div>
    </div>
  );
}

function NavLinks({ onNavigate, businessName }: { onNavigate?: () => void; businessName: string }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Main navigation" className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + '/');
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={`pressable flex items-center gap-3 rounded-control px-3 py-2.5 text-[14px] font-medium ${
              active
                ? 'bg-pine-600 text-white shadow-press'
                : 'text-ink-300 hover:bg-white/[0.07] hover:text-white'
            }`}
          >
            <Icon className="h-5 w-5 shrink-0" weight={active ? 'fill' : 'regular'} aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({
  userEmail,
  businessName,
  children,
}: {
  userEmail: string;
  businessName: string;
  children: React.ReactNode;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Lock body scroll while the drawer is open; close on Escape.
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  const sidebarBody = (
    <div className="flex h-full flex-col">
      <div className="px-5 pb-5 pt-6">
        <Wordmark />
        <p className="mt-4 truncate border-t border-white/10 pt-4 text-[13px] font-medium text-ink-300">
          {businessName}
        </p>
      </div>
      <div className="thin-scroll flex-1 overflow-y-auto px-3">
        <NavLinks onNavigate={() => setDrawerOpen(false)} businessName={businessName} />
      </div>
      <div className="border-t border-white/10 p-4">
        <p className="truncate px-1 font-mono text-[11px] text-ink-400" title={userEmail}>
          {userEmail}
        </p>
        <form action={signOutAction} className="mt-2">
          <button
            type="submit"
            className="pressable flex w-full items-center gap-2.5 rounded-control px-3 py-2.5 text-sm font-medium text-ink-300 hover:bg-white/[0.07] hover:text-white"
          >
            <SignOut className="h-5 w-5" aria-hidden="true" />
            Sign out
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh bg-ink-50">
      {/* Desktop rail */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] bg-ink-950 lg:block">
        {sidebarBody}
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-ink-200/80 bg-ink-50/90 px-4 py-3 backdrop-blur lg:hidden">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open navigation menu"
          className="pressable rounded-control p-2 text-ink-700 hover:bg-ink-100"
        >
          <List className="h-6 w-6" weight="bold" aria-hidden="true" />
        </button>
        <div className="flex items-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-control bg-pine-600 font-display text-sm font-bold text-white"
            aria-hidden="true"
          >
            B
          </div>
          <span className="font-display text-[17px] font-bold tracking-tight text-ink-950">
            BizOS
          </span>
        </div>
      </header>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <div
            className="anim-fade absolute inset-0 bg-ink-950/55 backdrop-blur-[2px]"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0 w-[300px] max-w-[85vw] bg-ink-950 shadow-pop [animation:drawer-in_0.28s_cubic-bezier(0.22,1,0.36,1)_both]">
            <div className="flex justify-end p-2">
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close navigation menu"
                className="pressable rounded-control p-2 text-ink-300 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" weight="bold" aria-hidden="true" />
              </button>
            </div>
            <div className="h-[calc(100%-3rem)]">{sidebarBody}</div>
          </div>
          <style>{`@keyframes drawer-in{from{transform:translateX(-100%)}to{transform:translateX(0)}}`}</style>
        </div>
      )}

      {/* Main content */}
      <main className="lg:pl-[260px]">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</div>
      </main>
    </div>
  );
}
