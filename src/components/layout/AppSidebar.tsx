import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
  MoreHorizontal,
  Pencil,
  Copy,
  Trash2,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useScrollSpy } from "@/hooks/useScrollSpy";
import { WorkspaceStorage } from "@/engine/workspace/WorkspaceStorage";
import { WorkspaceProject } from "@/engine/types";

const PROJECT_TYPE_COLORS: Record<string, string> = {
  klassifikation: 'bg-blue-500',
  regression: 'bg-green-500',
  clustering: 'bg-purple-500',
};

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
  const navigate = useNavigate();
  const isOnGrundlagen = location.pathname === "/lernen/grundlagen";

  // User projects from LocalStorage
  const [userProjects, setUserProjects] = useState<WorkspaceProject[]>([]);
  const exampleProjects = WorkspaceStorage.getExampleProjects();

  // Inline rename state
  const [renamingProjectId, setRenamingProjectId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const renameInputRef = useRef<HTMLInputElement>(null);

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

  // Focus rename input when entering rename mode
  useEffect(() => {
    if (renamingProjectId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingProjectId]);

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

  // --- Context menu handlers ---

  const handleRenameStart = (proj: WorkspaceProject) => {
    setRenamingProjectId(proj.id);
    setRenameValue(proj.name);
  };

  const handleRenameSubmit = (id: string) => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== '') {
      WorkspaceStorage.updateProject(id, { name: trimmed });
      setUserProjects(WorkspaceStorage.getProjects());
    }
    setRenamingProjectId(null);
  };

  const handleRenameCancel = () => {
    setRenamingProjectId(null);
  };

  const handleDuplicate = (id: string) => {
    const clone = WorkspaceStorage.cloneUserProject(id);
    setUserProjects(WorkspaceStorage.getProjects());
    navigate(`/werkstatt/${clone.id}`);
  };

  const handleDelete = (proj: WorkspaceProject) => {
    const confirmed = window.confirm(`Projekt "${proj.name}" wirklich löschen?`);
    if (!confirmed) return;
    WorkspaceStorage.deleteProject(proj.id);
    setUserProjects(WorkspaceStorage.getProjects());
    // Navigate away if the deleted project is currently active
    if (location.pathname === `/werkstatt/${proj.id}`) {
      navigate('/werkstatt');
    }
  };

  /** Render the Werkstatt submenu with categories */
  const renderWerkstattSubmenu = () => (
    <SidebarMenuSub>
      {/* Meine Projekte (always visible) */}
      <li>
        <p className="px-2 pt-2 pb-1 text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider">
          Meine Projekte ({userProjects.length})
        </p>
      </li>

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

      {userProjects.map((proj) => {
            const isActive = location.pathname === `/werkstatt/${proj.id}`;
            const isRenaming = renamingProjectId === proj.id;
            const colorDot = PROJECT_TYPE_COLORS[proj.type] || 'bg-gray-400';

            return (
              <SidebarMenuSubItem key={proj.id} className="group/project relative">
                {isRenaming ? (
                  <div className="px-2 py-1">
                    <input
                      ref={renameInputRef}
                      type="text"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRenameSubmit(proj.id);
                        if (e.key === 'Escape') handleRenameCancel();
                      }}
                      onBlur={() => handleRenameSubmit(proj.id)}
                      className="w-full text-sm px-2 py-1 rounded border border-orange-300 focus:outline-none focus:ring-1 focus:ring-orange-500 bg-background"
                    />
                  </div>
                ) : (
                  <SidebarMenuSubButton
                    asChild
                    size="sm"
                    isActive={isActive}
                  >
                    <NavLink
                      to={`/werkstatt/${proj.id}`}
                      className={cn(
                        "flex items-center gap-2 text-muted-foreground hover:text-foreground pr-7",
                        isActive && "text-primary font-medium"
                      )}
                    >
                      <span className={cn("h-2 w-2 rounded-full shrink-0", colorDot)} />
                      <span className="truncate">{proj.name}</span>
                    </NavLink>
                  </SidebarMenuSubButton>
                )}

                {/* 3-Dot Context Menu */}
                {!isRenaming && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="absolute right-1 top-1/2 -translate-y-1/2 p-0.5 rounded opacity-0 group-hover/project:opacity-100 hover:bg-accent focus:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" side="right" className="w-44">
                      <DropdownMenuItem onClick={() => handleRenameStart(proj)}>
                        <Pencil className="h-3.5 w-3.5 mr-2" />
                        Umbenennen
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(proj.id)}>
                        <Copy className="h-3.5 w-3.5 mr-2" />
                        Duplizieren
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600"
                        onClick={() => handleDelete(proj)}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-2" />
                        Löschen
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </SidebarMenuSubItem>
            );
          })}

      {/* Beispielprojekte (always visible) */}
      <li>
        <p className="px-2 pt-3 pb-1 text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider">
          Echte Daten ({exampleProjects.filter(p => !!p.selectedDataset).length})
        </p>
      </li>
      {exampleProjects.filter(p => !!p.selectedDataset).map((proj) => {
        const isActive = location.pathname === `/werkstatt/${proj.id}`;
        const colorDot = PROJECT_TYPE_COLORS[proj.type] || 'bg-gray-400';

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
                <span className={cn("h-2 w-2 rounded-full shrink-0", colorDot)} />
                <span className="truncate">{proj.name}</span>
              </NavLink>
            </SidebarMenuSubButton>
          </SidebarMenuSubItem>
        );
      })}
      <li>
        <p className="px-2 pt-2 pb-1 text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider">
          Synth. Szenarien ({exampleProjects.filter(p => !p.selectedDataset).length})
        </p>
      </li>
      {exampleProjects.filter(p => !p.selectedDataset).map((proj) => {
        const isActive = location.pathname === `/werkstatt/${proj.id}`;
        const colorDot = PROJECT_TYPE_COLORS[proj.type] || 'bg-gray-400';

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
                <span className={cn("h-2 w-2 rounded-full shrink-0", colorDot)} />
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
