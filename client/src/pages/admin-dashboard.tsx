import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, GraduationCap, Calendar, TrendingUp, BookOpen, Video, ArrowRight, Activity, Shield, Clock, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading, isAdmin } = useAuth();

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

  const { data: stats, isLoading } = useQuery<{
    totalStudents: number;
    totalTutors: number;
    totalSessions: number;
    sessionsToday: number;
  }>({
    queryKey: ["/api/admin/stats"],
    enabled: isAuthenticated && isAdmin,
  });

  if (authLoading || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 space-y-6">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <Activity className="h-5 w-5 text-slate-900" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Control Panel</h1>
              <p className="text-slate-400 text-sm">
                Welcome back, <span className="text-amber-400">{user?.firstName}</span>
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 px-3 py-1">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse mr-2"></span>
            System Online
          </Badge>
          <Badge variant="outline" className="bg-slate-800 text-slate-300 border-slate-700 px-3 py-1">
            <Shield className="h-3 w-3 mr-1" />
            Admin Access
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 hover:border-slate-700 transition-colors" data-testid="card-total-students">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-400" />
            </div>
            <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-400 border-blue-500/30">
              +12%
            </Badge>
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-20 bg-slate-800" />
          ) : (
            <>
              <div className="text-3xl font-bold text-white mb-1" data-testid="text-total-students">
                {stats?.totalStudents || 0}
              </div>
              <p className="text-sm text-slate-500">Total Students</p>
            </>
          )}
        </div>

        <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 hover:border-slate-700 transition-colors" data-testid="card-total-tutors">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-amber-400" />
            </div>
            <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-400 border-amber-500/30">
              Active
            </Badge>
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-20 bg-slate-800" />
          ) : (
            <>
              <div className="text-3xl font-bold text-white mb-1" data-testid="text-total-tutors">
                {stats?.totalTutors || 0}
              </div>
              <p className="text-sm text-slate-500">Active Tutors</p>
            </>
          )}
        </div>

        <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 hover:border-slate-700 transition-colors" data-testid="card-total-sessions">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-emerald-400" />
            </div>
            <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
              All Time
            </Badge>
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-20 bg-slate-800" />
          ) : (
            <>
              <div className="text-3xl font-bold text-white mb-1" data-testid="text-total-sessions">
                {stats?.totalSessions || 0}
              </div>
              <p className="text-sm text-slate-500">Total Sessions</p>
            </>
          )}
        </div>

        <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 hover:border-slate-700 transition-colors" data-testid="card-sessions-today">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-purple-400" />
            </div>
            <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-400 border-purple-500/30">
              Today
            </Badge>
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-20 bg-slate-800" />
          ) : (
            <>
              <div className="text-3xl font-bold text-white mb-1" data-testid="text-sessions-today">
                {stats?.sessionsToday || 0}
              </div>
              <p className="text-sm text-slate-500">Sessions Today</p>
            </>
          )}
        </div>
      </div>

      {/* Quick Actions Header */}
      <div className="flex items-center justify-between pt-4">
        <h2 className="text-lg font-semibold text-white">Quick Actions</h2>
        <span className="text-sm text-slate-500">Manage your platform</span>
      </div>

      {/* Management Cards - Row 1 */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 hover:border-amber-500/30 transition-all group" data-testid="card-manage-tutors">
          <div className="flex items-start justify-between mb-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-600/20 flex items-center justify-center group-hover:from-amber-400/30 group-hover:to-amber-600/30 transition-colors">
              <GraduationCap className="h-6 w-6 text-amber-400" />
            </div>
            <ArrowRight className="h-5 w-5 text-slate-600 group-hover:text-amber-400 transition-colors" />
          </div>
          <h3 className="font-semibold text-lg text-white mb-2">Manage Tutors</h3>
          <p className="text-sm text-slate-400 mb-4 line-clamp-2">
            Add, edit, or remove tutors from your platform
          </p>
          <Link href="/admin/tutors">
            <Button 
              className="w-full bg-slate-800 hover:bg-amber-500 text-slate-300 hover:text-slate-900 border border-slate-700 hover:border-amber-500 transition-all"
              data-testid="button-go-to-tutors"
            >
              View Tutors
            </Button>
          </Link>
        </div>

        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 hover:border-blue-500/30 transition-all group" data-testid="card-manage-students">
          <div className="flex items-start justify-between mb-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-400/20 to-blue-600/20 flex items-center justify-center group-hover:from-blue-400/30 group-hover:to-blue-600/30 transition-colors">
              <Users className="h-6 w-6 text-blue-400" />
            </div>
            <ArrowRight className="h-5 w-5 text-slate-600 group-hover:text-blue-400 transition-colors" />
          </div>
          <h3 className="font-semibold text-lg text-white mb-2">Manage Students</h3>
          <p className="text-sm text-slate-400 mb-4 line-clamp-2">
            View and manage student accounts and roles
          </p>
          <Link href="/admin/students">
            <Button 
              className="w-full bg-slate-800 hover:bg-blue-500 text-slate-300 hover:text-white border border-slate-700 hover:border-blue-500 transition-all"
              data-testid="button-go-to-students"
            >
              View Students
            </Button>
          </Link>
        </div>

        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 hover:border-emerald-500/30 transition-all group" data-testid="card-manage-sessions">
          <div className="flex items-start justify-between mb-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 flex items-center justify-center group-hover:from-emerald-400/30 group-hover:to-emerald-600/30 transition-colors">
              <Calendar className="h-6 w-6 text-emerald-400" />
            </div>
            <ArrowRight className="h-5 w-5 text-slate-600 group-hover:text-emerald-400 transition-colors" />
          </div>
          <h3 className="font-semibold text-lg text-white mb-2">Manage Sessions</h3>
          <p className="text-sm text-slate-400 mb-4 line-clamp-2">
            Oversee all tutoring sessions and schedules
          </p>
          <Link href="/admin/sessions">
            <Button 
              className="w-full bg-slate-800 hover:bg-emerald-500 text-slate-300 hover:text-white border border-slate-700 hover:border-emerald-500 transition-all"
              data-testid="button-go-to-sessions"
            >
              View Sessions
            </Button>
          </Link>
        </div>
      </div>

      {/* Management Cards - Row 2 */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 hover:border-purple-500/30 transition-all group" data-testid="card-manage-materials">
          <div className="flex items-start justify-between mb-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-400/20 to-purple-600/20 flex items-center justify-center group-hover:from-purple-400/30 group-hover:to-purple-600/30 transition-colors">
              <BookOpen className="h-6 w-6 text-purple-400" />
            </div>
            <ArrowRight className="h-5 w-5 text-slate-600 group-hover:text-purple-400 transition-colors" />
          </div>
          <h3 className="font-semibold text-lg text-white mb-2">Learning Materials</h3>
          <p className="text-sm text-slate-400 mb-4">
            Upload and manage educational resources and study guides for students
          </p>
          <Link href="/admin/materials">
            <Button 
              className="w-full bg-slate-800 hover:bg-purple-500 text-slate-300 hover:text-white border border-slate-700 hover:border-purple-500 transition-all"
              data-testid="button-go-to-materials"
            >
              View Materials
            </Button>
          </Link>
        </div>

        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 hover:border-rose-500/30 transition-all group" data-testid="card-manage-videos">
          <div className="flex items-start justify-between mb-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-rose-400/20 to-rose-600/20 flex items-center justify-center group-hover:from-rose-400/30 group-hover:to-rose-600/30 transition-colors">
              <Video className="h-6 w-6 text-rose-400" />
            </div>
            <ArrowRight className="h-5 w-5 text-slate-600 group-hover:text-rose-400 transition-colors" />
          </div>
          <h3 className="font-semibold text-lg text-white mb-2">Lecture Videos</h3>
          <p className="text-sm text-slate-400 mb-4">
            Upload and manage video lectures and tutorials for the platform
          </p>
          <Link href="/admin/videos">
            <Button 
              className="w-full bg-slate-800 hover:bg-rose-500 text-slate-300 hover:text-white border border-slate-700 hover:border-rose-500 transition-all"
              data-testid="button-go-to-videos"
            >
              View Videos
            </Button>
          </Link>
        </div>
      </div>

      {/* System Status Footer */}
      <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4 mt-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span className="text-sm text-slate-400">Database Connected</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span className="text-sm text-slate-400">Auth System Active</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span className="text-sm text-slate-400">API Endpoints Online</span>
            </div>
          </div>
          <span className="text-xs text-slate-600">TutorHub Admin v1.0</span>
        </div>
      </div>
    </div>
  );
}
