"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, BarChart3, FileText, Briefcase, GraduationCap,
  MessageSquare, MessageCircle, Settings, LogOut, Info,
  Menu, X, PanelLeftClose, PanelLeftOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

const navItems = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "About Details", href: "/admin/about", icon: Info },
  { name: "Blog", href: "/admin/blog", icon: FileText },
  { name: "Portfolio", href: "/admin/portfolio", icon: Briefcase },
  { name: "Resume", href: "/admin/resume", icon: GraduationCap },
  { name: "Messages", href: "/admin/messages", icon: MessageSquare },
  { name: "Testimonials", href: "/admin/testimonials", icon: MessageCircle },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

interface AdminShellProps {
  children: React.ReactNode;
  profileName?: string;
  profilePhoto?: string | null;
}

export function AdminShell({ children, profileName, profilePhoto }: AdminShellProps) {
  // Desktop: starts open. Mobile: starts closed.
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();
  const { data: session } = useSession();

  const title =
    pathname.split("/").filter(Boolean).pop()?.replace(/-/g, " ") || "Dashboard";
  const displayTitle = title.charAt(0).toUpperCase() + title.slice(1);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">

      {/* ── Mobile overlay (only when sidebar open on small screens) ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={cn(
          // On mobile: fixed overlay drawer
          "fixed inset-y-0 left-0 z-40 flex h-screen w-64 flex-col",
          "border-r border-border bg-background/95 dark:bg-zinc-950/95 backdrop-blur-xl",
          "transition-transform duration-300 ease-in-out",
          // On desktop: part of flex layout (not fixed)
          "lg:relative lg:z-auto lg:flex",
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full lg:-translate-x-full lg:hidden"
        )}
      >
        {/* Sidebar header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-border flex-shrink-0">
          <Link
            href="/admin/dashboard"
            onClick={() => { if (window.innerWidth < 1024) closeSidebar() }}
            className="text-xl font-bold tracking-tighter text-foreground"
          >
            AdminPanel<span className="text-primary">.</span>
          </Link>
          {/* Close/collapse button */}
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
            title="Hide sidebar"
          >
            <PanelLeftClose className="h-5 w-5" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => { if (window.innerWidth < 1024) closeSidebar() }}
                className={cn(
                  "group flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-accent-foreground"
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-border flex-shrink-0">
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-accent/50"
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </Button>
        </div>
      </aside>

      {/* ── Main Area ── */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">

        {/* Topbar */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-background/50 px-4 md:px-6 backdrop-blur-xl z-20 sticky top-0 flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Toggle sidebar button — visible on ALL screen sizes */}
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
              aria-label={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
              title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
            >
              {sidebarOpen ? (
                <PanelLeftClose className="h-5 w-5" />
              ) : (
                <PanelLeftOpen className="h-5 w-5" />
              )}
            </button>
            <h1 className="text-lg md:text-xl font-semibold text-foreground tracking-tight capitalize">
              {displayTitle}
            </h1>
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            <ThemeToggle />
            <div className="flex items-center space-x-2 border-l border-border pl-2 md:pl-4">
              <div className="relative h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 flex-shrink-0 overflow-hidden">
                {profilePhoto ? (
                  <Image src={profilePhoto} alt={profileName || "Admin"} fill className="object-cover" />
                ) : (
                  <span className="text-sm font-medium text-primary">
                    {profileName?.charAt(0) || session?.user?.name?.charAt(0) || "A"}
                  </span>
                )}
              </div>
              <span className="text-sm font-medium text-foreground hidden md:block">
                {profileName || session?.user?.name || "Admin"}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/50 via-background to-background dark:from-zinc-900 dark:via-[#09090b] dark:to-[#09090b] -z-10" />
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
}
