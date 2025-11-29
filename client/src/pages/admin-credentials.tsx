import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, User, Settings, Users, BookOpen, Video, MessageSquare } from "lucide-react";

export default function AdminCredentials() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading, isAdmin } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  useEffect(() => {
    if (!authLoading && isAuthenticated && !isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin panel.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    }
  }, [isAuthenticated, authLoading, isAdmin, toast]);

  if (authLoading || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="h-10 w-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Settings className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Settings</h1>
              <p className="text-slate-400 text-sm">System configuration and access management</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-amber-500/20 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
            <Shield className="h-4 w-4 text-amber-400" />
          </div>
          <div>
            <h3 className="font-semibold text-amber-400 mb-1">Admin Access</h3>
            <p className="text-slate-400 text-sm">
              You have full administrative access to the TutorHub platform. 
              Use the sidebar to navigate between different management areas.
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber-400" />
              Admin Features
            </CardTitle>
            <CardDescription className="text-slate-400">
              Full platform management capabilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-slate-300">
                <Users className="h-4 w-4 text-amber-400" />
                <span>Manage tutors and students</span>
              </li>
              <li className="flex items-center gap-3 text-slate-300">
                <Settings className="h-4 w-4 text-amber-400" />
                <span>Create and manage sessions</span>
              </li>
              <li className="flex items-center gap-3 text-slate-300">
                <BookOpen className="h-4 w-4 text-amber-400" />
                <span>Upload learning materials</span>
              </li>
              <li className="flex items-center gap-3 text-slate-300">
                <Video className="h-4 w-4 text-amber-400" />
                <span>Upload lecture videos</span>
              </li>
              <li className="flex items-center gap-3 text-slate-300">
                <MessageSquare className="h-4 w-4 text-amber-400" />
                <span>View and respond to feedback</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-indigo-400" />
              Student Features
            </CardTitle>
            <CardDescription className="text-slate-400">
              What students can access on the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-slate-300">
                <Settings className="h-4 w-4 text-indigo-400" />
                <span>Book tutoring sessions</span>
              </li>
              <li className="flex items-center gap-3 text-slate-300">
                <Users className="h-4 w-4 text-indigo-400" />
                <span>View upcoming sessions</span>
              </li>
              <li className="flex items-center gap-3 text-slate-300">
                <BookOpen className="h-4 w-4 text-indigo-400" />
                <span>Access learning materials</span>
              </li>
              <li className="flex items-center gap-3 text-slate-300">
                <Video className="h-4 w-4 text-indigo-400" />
                <span>Watch lecture videos</span>
              </li>
              <li className="flex items-center gap-3 text-slate-300">
                <MessageSquare className="h-4 w-4 text-indigo-400" />
                <span>Submit feedback</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-900 border-slate-800 mt-6">
        <CardHeader>
          <CardTitle className="text-white text-lg">Platform Statistics</CardTitle>
          <CardDescription className="text-slate-400">
            Overview of platform usage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400 text-sm">
            Use the Dashboard to view detailed statistics about tutors, students, sessions, and materials.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
