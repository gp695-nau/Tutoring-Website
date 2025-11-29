import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import StudentDashboard from "@/pages/student-dashboard";
import BookSession from "@/pages/book-session";
import MySessions from "@/pages/my-sessions";
import LearningMaterials from "@/pages/learning-materials";
import LectureVideos from "@/pages/lecture-videos";
import Payments from "@/pages/payments";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminTutors from "@/pages/admin-tutors";
import AdminStudents from "@/pages/admin-students";
import AdminSessions from "@/pages/admin-sessions";
import AdminMaterials from "@/pages/admin-materials";
import AdminVideos from "@/pages/admin-videos";
import AdminFeedback from "@/pages/admin-feedback";
import AdminCredentials from "@/pages/admin-credentials";
import AdminLogin from "@/pages/admin-login";
import StudentFeedback from "@/pages/student-feedback";

function Router() {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/login" component={Login} />
          <Route path="/admin/login" component={AdminLogin} />
        </>
      ) : (
        <>
          {isAdmin ? (
            <>
              <Route path="/admin" component={AdminDashboard} />
              <Route path="/admin/tutors" component={AdminTutors} />
              <Route path="/admin/students" component={AdminStudents} />
              <Route path="/admin/sessions" component={AdminSessions} />
              <Route path="/admin/materials" component={AdminMaterials} />
              <Route path="/admin/videos" component={AdminVideos} />
              <Route path="/admin/feedback" component={AdminFeedback} />
              <Route path="/admin/credentials" component={AdminCredentials} />
              <Route path="/" component={AdminDashboard} />
            </>
          ) : (
            <>
              <Route path="/" component={StudentDashboard} />
              <Route path="/book-session" component={BookSession} />
              <Route path="/my-sessions" component={MySessions} />
              <Route path="/materials" component={LearningMaterials} />
              <Route path="/videos" component={LectureVideos} />
              <Route path="/feedback" component={StudentFeedback} />
              <Route path="/payments" component={Payments} />
            </>
          )}
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  
  const sidebarStyle = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <>
      {!isLoading && isAuthenticated ? (
        <SidebarProvider style={sidebarStyle as React.CSSProperties}>
          <div className="flex h-screen w-full">
            <AppSidebar />
            <div className="flex flex-col flex-1">
              <header className="flex items-center justify-between p-5 border-b border-border bg-background">
                <SidebarTrigger data-testid="button-sidebar-toggle" />
              </header>
              <main className="flex-1 overflow-auto bg-background">
                <div className="container mx-auto max-w-7xl p-6">
                  <Router />
                </div>
              </main>
            </div>
          </div>
        </SidebarProvider>
      ) : (
        <Router />
      )}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppContent />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
