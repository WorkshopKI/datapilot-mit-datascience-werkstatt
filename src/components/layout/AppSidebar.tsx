import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Home,
  BookOpen,
  GraduationCap,
  ClipboardList,
  Gamepad2,
  ChevronRight,
  Wrench,
  Layout,
  BarChart3,
  FileText,
  Calendar,
  MessageSquare,
  Calculator,
  Search,
  Handshake,
  Bot,
  FlaskConical,
  Plus,
  FolderOpen,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useScrollSpy } from "@/hooks/useScrollSpy";
import { WorkspaceStorage } from "@/engine/workspace/WorkspaceStorage";
import { WorkspaceProject } from "@/engine/types";

// Navigation groups data
const navigationGroups = [
  {
    id: "werkstatt",
    title: "DS Werkstatt",
    icon: FlaskConical,
    href: "/werkstatt",
    items: [],
    featured: true,
  },
  {
    id: "lernen",
    title: "Lernen",
    icon: BookOpen,
    href: "/lernen",
    items: [
      { id: "grundlagen", label: "Grundlagen", href: "/lernen/grundlagen", icon: BookOpen },
      { id: "challenge-cards", label: "Challenge Cards", href: "/lernen/challenge-cards", icon: Gamepad2 },
      { id: "quiz", label: "Quiz", href: "/lernen/quiz", icon: Gamepad2 },
    ],
  },
  {
    id: "planen",
    title: "Planen",
    icon: ClipboardList,
    href: "/planen",
    items: [
      { id: "projekt", label: "Projekt planen", href: "/planen/projekt", icon: Layout },
      { id: "checkliste", label: "Checkliste generieren", href: "/planen/checkliste", icon: FileText },
    ],
  },
  {
    id: "im-projekt",
    title: "Im Projekt",
    icon: Wrench,
    href: "/im-projekt",
    items: [
      { id: "meeting", label: "Meeting vorbereiten", href: "/im-projekt/meeting", icon: Calendar },
      { id: "stakeholder", label: "Stakeholder befragen", href: "/im-projekt/stakeholder", icon: MessageSquare },
      { id: "roi", label: "ROI berechnen", href: "/im-projekt/roi", icon: Calculator },
    ],
  },
  {
    id: "ki-assistenten",
    title: "KI-Assistenten",
    icon: Bot,
    href: "/ki-assistenten",
    items: [
      { id: "ki-tutor", label: "KI Tutor", href: "/ki-assistenten/tutor", icon: GraduationCap, badge: "Prompt" },
      { id: "ki-copilot", label: "KI Copilot", href: "/ki-assistenten/copilot", icon: Handshake, badge: "Prompt" },
    ],
  },
  {
    id: "nachschlagen",
    title: "Nachschlagen",
    icon: Search,
    href: "/nachschlagen",
    items: [
      { id: "begriffe", label: "Begriffe & Übersetzungen", href: "/nachschlagen/begriffe", icon: BookOpen },
      { id: "metriken", label: "Metriken-Referenz", href: "/nachschlagen/metriken", icon: BarChart3 },
      { id: "diagnose", label: "Problem diagnostizieren", href: "/nachschlagen/diagnose", icon: Wrench },
    ],
  },
];

// Grundlagen sub-items for scroll spy
const grundlagenSubItems = [
  { id: "was-ist-ds", label: "Was ist Data Science?" },
  { id: "crisp-dm", label: "Der CRISP-DM Prozess" },
  { id: "rollen", label: "Rollen im Projekt" },
  { id: "change-management", label: "Change Management" },
  { id: "projektmanagement", label: "Projektmanagement" },
];

const sectionIds = grundlagenSubItems.map((item) => item.id);

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const isOnGrundlagen = location.pathname === "/lernen/grundlagen";

  // User projects from LocalStorage
  const [userProjects, setUserProjects] = useState<WorkspaceProject[]>([]);
  const exampleProjects = WorkspaceStorage.getExampleProjects();

  // Load user projects and listen for changes
  useEffect(() => {
    const loadUserProjects = () => {
      setUserProjects(WorkspaceStorage.getProjects());
    };

    loadUserProjects();

    // Listen for custom storage event
    window.addEventListener('werkstatt-projects-changed', loadUserProjects);
    // Also listen for storage events from other tabs
    window.addEventListener('storage', loadUserProjects);

    return () => {
      window.removeEventListener('werkstatt-projects-changed', loadUserProjects);
      window.removeEventListener('storage', loadUserProjects);
    };
  }, []);

  // Reload user projects on route change (covers navigation after clone)
  useEffect(() => {
    setUserProjects(WorkspaceStorage.getProjects());
  }, [location.pathname]);

  // State für offene Gruppen - initial basierend auf aktueller Route
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    for (const group of navigationGroups) {
      if (location.pathname.startsWith(group.href)) {
        initial.add(group.id);
      }
    }
    return initial;
  });

  // Bei Route-Wechsel: Neue aktive Gruppe hinzufügen (nicht ersetzen!)
  useEffect(() => {
    for (const group of navigationGroups) {
      if (location.pathname.startsWith(group.href)) {
        setOpenGroups(prev => new Set(prev).add(group.id));
        break;
      }
    }
  }, [location.pathname]);

  // Toggle-Funktion für manuelles Öffnen/Schließen
  const toggleGroup = (groupId: string) => {
    setOpenGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  // Only use scroll spy when on Grundlagen page
  const activeSection = useScrollSpy(isOnGrundlagen ? sectionIds : []);

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  // Determine which group is active based on current path
  const getActiveGroup = () => {
    for (const group of navigationGroups) {
      if (location.pathname.startsWith(group.href)) {
        return group.id;
      }
    }
    return null;
  };

  const activeGroup = getActiveGroup();

  /** Render the Werkstatt submenu with categories */
  const renderWerkstattSubmenu = () => (
    <SidebarMenuSub>
      {/* Übersicht */}
      <SidebarMenuSubItem>
        <SidebarMenuSubButton
          asChild
          size="sm"
          isActive={location.pathname === "/werkstatt"}
        >
          <NavLink
            to="/werkstatt"
            end
            className={cn(
              "flex items-center gap-2 text-muted-foreground hover:text-foreground",
              location.pathname === "/werkstatt" && "text-primary font-medium"
            )}
          >
            <FolderOpen className="h-3.5 w-3.5" />
            Übersicht
          </NavLink>
        </SidebarMenuSubButton>
      </SidebarMenuSubItem>

      {/* Neues Projekt */}
      <SidebarMenuSubItem>
        <SidebarMenuSubButton
          asChild
          size="sm"
          isActive={location.pathname === "/werkstatt/neu"}
        >
          <NavLink
            to="/werkstatt/neu"
            className={cn(
              "flex items-center gap-2 text-muted-foreground hover:text-foreground",
              location.pathname === "/werkstatt/neu" && "text-primary font-medium"
            )}
          >
            <Plus className="h-3.5 w-3.5" />
            Neues Projekt
          </NavLink>
        </SidebarMenuSubButton>
      </SidebarMenuSubItem>

      {/* Meine Projekte (only if user has projects) */}
      {userProjects.length > 0 && (
        <>
          <li>
            <p className="px-2 pt-3 pb-1 text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider">
              Meine Projekte
            </p>
          </li>
          {userProjects.map((proj) => {
            const isActive = location.pathname === `/werkstatt/${proj.id}`;
            return (
              <SidebarMenuSubItem key={proj.id}>
                <SidebarMenuSubButton
                  asChild
                  size="sm"
                  isActive={isActive}
                >
                  <NavLink
                    to={`/werkstatt/${proj.id}`}
                    className={cn(
                      "flex items-center gap-2 text-muted-foreground hover:text-foreground",
                      isActive && "text-primary font-medium"
                    )}
                  >
                    <span className="truncate">{proj.name}</span>
                  </NavLink>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            );
          })}
        </>
      )}

      {/* Beispielprojekte (always visible) */}
      <li>
        <p className="px-2 pt-3 pb-1 text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider">
          Beispielprojekte
        </p>
      </li>
      {exampleProjects.map((proj) => {
        const isActive = location.pathname === `/werkstatt/${proj.id}`;
        return (
          <SidebarMenuSubItem key={proj.id}>
            <SidebarMenuSubButton
              asChild
              size="sm"
              isActive={isActive}
            >
              <NavLink
                to={`/werkstatt/${proj.id}`}
                className={cn(
                  "flex items-center gap-2 text-muted-foreground hover:text-foreground",
                  isActive && "text-primary font-medium"
                )}
              >
                <span className="truncate">{proj.name}</span>
              </NavLink>
            </SidebarMenuSubButton>
          </SidebarMenuSubItem>
        );
      })}
    </SidebarMenuSub>
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="pt-4">
        {/* Logo/Header */}
        <div className={cn("px-4 pb-4 mb-2 border-b", collapsed && "px-2")}>
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary shrink-0" />
            {!collapsed && (
              <span className="font-semibold text-lg">DataPilot</span>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Start */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/"
                    end
                    className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent"
                    activeClassName="bg-accent text-accent-foreground font-medium"
                  >
                    <Home className="h-4 w-4 shrink-0" />
                    {!collapsed && <span>Start</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Navigation Groups */}
              {navigationGroups.map((group) => {
                const isGroupActive = activeGroup === group.id;

                return (
                  <Collapsible
                    key={group.id}
                    open={openGroups.has(group.id)}
                    onOpenChange={() => toggleGroup(group.id)}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton asChild>
                          <NavLink
                            to={group.href}
                            end
                            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent"
                            activeClassName="bg-accent text-accent-foreground font-medium"
                          >
                            <group.icon className="h-4 w-4 shrink-0" />
                            {!collapsed && (
                              <>
                                <span className="flex-1">{group.title}</span>
                                <ChevronRight className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                              </>
                            )}
                          </NavLink>
                        </SidebarMenuButton>
                      </CollapsibleTrigger>

                      {!collapsed && (
                        <CollapsibleContent>
                          {/* Special rendering for Werkstatt with dynamic projects */}
                          {group.id === "werkstatt" ? (
                            renderWerkstattSubmenu()
                          ) : (
                          <SidebarMenuSub>
                            {group.items.map((item) => {
                              // Special handling for Grundlagen - show scroll spy sub-items
                              if (item.id === "grundlagen" && isOnGrundlagen) {
                                return (
                                  <div key={item.id}>
                                    <SidebarMenuSubItem>
                                      <SidebarMenuSubButton
                                        asChild
                                        size="sm"
                                        isActive={location.pathname === item.href}
                                      >
                                        <NavLink
                                          to={item.href}
                                          className={cn(
                                            "flex items-center gap-2 text-muted-foreground hover:text-foreground",
                                            location.pathname === item.href && "text-primary font-medium"
                                          )}
                                        >
                                          <item.icon className="h-3.5 w-3.5" />
                                          {item.label}
                                        </NavLink>
                                      </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                    {/* Grundlagen sub-sections */}
                                    {grundlagenSubItems.map((subItem) => (
                                      <SidebarMenuSubItem key={subItem.id} className="pl-4">
                                        <SidebarMenuSubButton
                                          asChild
                                          size="sm"
                                          isActive={activeSection === subItem.id}
                                        >
                                          <a
                                            href={`#${subItem.id}`}
                                            onClick={(e) => handleAnchorClick(e, subItem.id)}
                                            className={cn(
                                              "text-xs text-muted-foreground hover:text-foreground",
                                              activeSection === subItem.id && "text-primary font-medium"
                                            )}
                                          >
                                            {subItem.label}
                                          </a>
                                        </SidebarMenuSubButton>
                                      </SidebarMenuSubItem>
                                    ))}
                                  </div>
                                );
                              }

                              // Check if this item or its sub-routes are active
                              const isItemActive = location.pathname === item.href ||
                                (item.id === "ki-tutor" && location.pathname.startsWith("/ki-assistenten/tutor")) ||
                                (item.id === "ki-copilot" && location.pathname.startsWith("/ki-assistenten/copilot"));

                              return (
                                <SidebarMenuSubItem key={item.id}>
                                  <SidebarMenuSubButton
                                    asChild
                                    size="sm"
                                    isActive={isItemActive}
                                  >
                                    <NavLink
                                      to={item.href}
                                      className={cn(
                                        "flex items-center gap-2 text-muted-foreground hover:text-foreground",
                                        isItemActive && "text-primary font-medium"
                                      )}
                                    >
                                      <item.icon className="h-3.5 w-3.5" />
                                      <span className="flex-1">{item.label}</span>
                                      {'badge' in item && item.badge && (
                                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                          {item.badge}
                                        </Badge>
                                      )}
                                    </NavLink>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              );
                            })}
                          </SidebarMenuSub>
                          )}
                        </CollapsibleContent>
                      )}
                    </SidebarMenuItem>
                  </Collapsible>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
