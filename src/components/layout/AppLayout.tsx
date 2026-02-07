import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeProvider } from "next-themes";
import { AppSidebar } from "./AppSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MobileBottomNav } from "./MobileBottomNav";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          {/* Sidebar nur auf Desktop */}
          <div className="hidden md:block">
            <AppSidebar />
          </div>
          
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
      </SidebarProvider>
    </ThemeProvider>
  );
}
