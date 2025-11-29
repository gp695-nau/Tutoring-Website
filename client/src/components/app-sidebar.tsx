import { 
  Calendar, 
  LayoutDashboard, 
  BookOpen, 
  GraduationCap,
  Users,
  FileText,
  Settings,
  BarChart3,
  Video,
  Shield,
  CreditCard,
  LogOut,
  Activity,
  Database,
  MessageSquare,
  Key,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function AppSidebar() {
  const { user, isAdmin } = useAuth();
  const [location] = useLocation();

  const studentMenuItems = [
    {
      title: "Dashboard",
      url: "/",
      icon: LayoutDashboard,
    },
    {
      title: "Book Session",
      url: "/book-session",
      icon: Calendar,
    },
    {
      title: "My Sessions",
      url: "/my-sessions",
      icon: GraduationCap,
    },
    {
      title: "Learning Materials",
      url: "/materials",
      icon: BookOpen,
    },
    {
      title: "Lecture Videos",
      url: "/videos",
      icon: Video,
    },
    {
      title: "Feedback",
      url: "/feedback",
      icon: MessageSquare,
    },
    {
      title: "Payments",
      url: "/payments",
      icon: CreditCard,
    },
  ];

  const adminMenuItems = [
    {
      title: "Overview",
      url: "/admin",
      icon: Activity,
    },
    {
      title: "Tutors",
      url: "/admin/tutors",
      icon: GraduationCap,
    },
    {
      title: "Students",
      url: "/admin/students",
      icon: Users,
    },
    {
      title: "Sessions",
      url: "/admin/sessions",
      icon: Calendar,
    },
    {
      title: "Materials",
      url: "/admin/materials",
      icon: Database,
    },
    {
      title: "Videos",
      url: "/admin/videos",
      icon: Video,
    },
    {
      title: "Feedback",
      url: "/admin/feedback",
      icon: MessageSquare,
    },
    {
      title: "Credentials",
      url: "/admin/credentials",
      icon: Key,
    },
  ];

  const menuItems = isAdmin ? adminMenuItems : studentMenuItems;

  if (isAdmin) {
    return (
      <Sidebar className="bg-slate-900 border-slate-800">
        <SidebarHeader className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-slate-900 shadow-lg shadow-amber-500/20">
              <Shield className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-lg font-bold text-white">TutorHub</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-amber-500/10 text-amber-400 border-amber-500/30">
                  ADMIN
                </Badge>
              </div>
            </div>
          </div>
        </SidebarHeader>
        
        <SidebarContent className="bg-slate-900">
          <SidebarGroup>
            <SidebarGroupLabel className="text-slate-500 uppercase text-[10px] tracking-wider font-semibold px-3">
              Management
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => {
                  const isActive = location === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={isActive}
                        className={`
                          mx-2 rounded-lg transition-all duration-200
                          ${isActive 
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                          }
                        `}
                        data-testid={`link-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        <Link href={item.url}>
                          <item.icon className={`h-4 w-4 ${isActive ? 'text-amber-400' : ''}`} />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup className="mt-auto">
            <SidebarGroupLabel className="text-slate-500 uppercase text-[10px] tracking-wider font-semibold px-3">
              System
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    asChild 
                    className="mx-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                    data-testid="link-settings"
                  >
                    <Link href="/admin">
                      <Settings className="h-4 w-4" />
                      <span className="font-medium">Settings</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-4 border-t border-slate-800 bg-slate-900">
          <div className="flex items-center gap-3 rounded-lg bg-slate-800/50 p-3">
            <Avatar className="h-9 w-9 ring-2 ring-amber-500/20">
              <AvatarImage src={user?.profileImageUrl || undefined} className="object-cover" />
              <AvatarFallback className="bg-amber-500/20 text-amber-400 text-sm font-semibold">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-1 flex-col overflow-hidden">
              <span className="text-sm font-medium text-white truncate">
                {user?.firstName} {user?.lastName}
              </span>
              <span className="text-xs text-slate-500 truncate">{user?.email}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start mt-2 text-slate-400 hover:text-white hover:bg-slate-800"
            onClick={() => window.location.href = "/api/logout"}
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </SidebarFooter>
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      <SidebarHeader className="p-5">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-white">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-lg font-bold text-foreground">TutorHub</span>
            <span className="text-xs text-muted-foreground">Student Portal</span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url} data-testid={`link-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-5">
        <div className="flex items-center gap-3 rounded-md border border-border bg-card p-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user?.profileImageUrl || undefined} className="object-cover" />
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-1 flex-col overflow-hidden">
            <span className="text-sm font-medium text-foreground truncate">
              {user?.firstName} {user?.lastName}
            </span>
            <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start mt-2"
          onClick={() => window.location.href = "/api/logout"}
          data-testid="button-logout"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
