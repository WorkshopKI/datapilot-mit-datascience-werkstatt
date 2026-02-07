import { Home, BookOpen, ClipboardList, Wrench, Search, Moon, Sun, FlaskConical } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const navItems = [
  { icon: Home, label: "Start", href: "/" },
  { icon: FlaskConical, label: "Werkstatt", href: "/werkstatt" },
  { icon: BookOpen, label: "Lernen", href: "/lernen" },
  { icon: Wrench, label: "Projekt", href: "/im-projekt" },
  { icon: Search, label: "Suche", href: "/nachschlagen" },
];

export function MobileBottomNav() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background border-t border-border" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className="flex flex-col items-center gap-1 py-2 px-2 text-muted-foreground transition-colors"
            activeClassName="text-primary"
            end={item.href === "/"}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs">{item.label}</span>
          </NavLink>
        ))}
        
        {/* Vertical Separator */}
        <div className="h-8 w-px bg-border" />
        
        {/* Theme Toggle - nur Icon */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex items-center justify-center py-2 px-3 text-muted-foreground transition-colors"
          aria-label={theme === "dark" ? "Zum hellen Modus wechseln" : "Zum dunklen Modus wechseln"}
        >
          {mounted && theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>
      </div>
    </nav>
  );
}
