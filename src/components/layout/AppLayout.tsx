import { useState, useEffect, useCallback, useRef } from "react";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { ThemeProvider } from "next-themes";
import { AppSidebar } from "./AppSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MobileBottomNav } from "./MobileBottomNav";
import { useIsMobile } from "@/hooks/use-mobile";

const SIDEBAR_WIDTH_KEY = 'ds-werkstatt-sidebar-width';
const MIN_WIDTH = 224; // 14rem
const MAX_WIDTH = 448; // 28rem
const DEFAULT_WIDTH = 256; // 16rem

function loadSidebarWidth(): number {
  try {
    const stored = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    if (stored) {
      const parsed = Number(stored);
      if (parsed >= MIN_WIDTH && parsed <= MAX_WIDTH) return parsed;
    }
  } catch { /* ignore */ }
  return DEFAULT_WIDTH;
}

interface AppLayoutProps {
  children: React.ReactNode;
}

function SidebarLayoutInner({ children, sidebarWidth, onResize }: {
  children: React.ReactNode;
  sidebarWidth: number;
  onResize: (width: number) => void;
}) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const isMobile = useIsMobile();
  const isDragging = useRef(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    document.documentElement.classList.add('sidebar-resizing');
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, e.clientX));
      onResize(newWidth);
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      document.documentElement.classList.remove('sidebar-resizing');
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [onResize]);

  return (
    <div className="min-h-screen flex w-full">
      {/* Sidebar nur auf Desktop */}
      <div className="hidden md:block">
        <AppSidebar />
      </div>

      {/* Resize Handle */}
      {!collapsed && !isMobile && (
        <div
          onMouseDown={handleMouseDown}
          className="hidden md:block fixed top-0 z-20 w-1.5 h-full cursor-col-resize group/resize"
          style={{ left: `${sidebarWidth - 3}px` }}
        >
          <div className="w-0.5 h-full mx-auto bg-transparent group-hover/resize:bg-orange-400 group-active/resize:bg-orange-500 transition-colors" />
        </div>
      )}

      <main className="flex-1 flex flex-col">
        <header className="hidden md:flex h-14 items-center justify-between border-b px-4 bg-background sticky top-0 z-10 shadow-sm">
          <SidebarTrigger />
          <ThemeToggle />
        </header>

        <div className="flex-1 overflow-auto pb-20 md:pb-0">
          {children}
        </div>
      </main>

      {/* Bottom Nav nur auf Mobile */}
      <MobileBottomNav />
    </div>
  );
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarWidth, setSidebarWidth] = useState(loadSidebarWidth);

  const handleResize = useCallback((width: number) => {
    setSidebarWidth(width);
    localStorage.setItem(SIDEBAR_WIDTH_KEY, String(Math.round(width)));
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SidebarProvider
        style={{ '--sidebar-width': `${sidebarWidth}px` } as React.CSSProperties}
      >
        <SidebarLayoutInner sidebarWidth={sidebarWidth} onResize={handleResize}>
          {children}
        </SidebarLayoutInner>
      </SidebarProvider>
    </ThemeProvider>
  );
}
