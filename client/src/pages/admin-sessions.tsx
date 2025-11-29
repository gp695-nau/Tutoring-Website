import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Clock, User, Edit2, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { TutoringSessionWithRelations } from "@shared/schema";
import { format } from "date-fns";

const statusStyles = {
  scheduled: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/30",
  in_progress: "bg-amber-500/10 text-amber-400 border-amber-500/30",
};

export default function AdminSessions() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading, isAdmin } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>("all");

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

  const { data: sessions, isLoading } = useQuery<TutoringSessionWithRelations[]>({
    queryKey: ["/api/admin/sessions"],
    enabled: isAuthenticated && isAdmin,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ sessionId, status }: { sessionId: string; status: string }) => {
      return await apiRequest("PUT", `/api/sessions/${sessionId}`, { status });
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Session status updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sessions"] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to update session status.",
        variant: "destructive",
      });
    },
  });

  const filteredSessions = sessions?.filter((session) => {
    if (statusFilter === "all") return true;
    return session.status === statusFilter;
  });

  if (authLoading || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Sessions</h1>
              <p className="text-slate-400 text-sm">Manage all tutoring sessions</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 border-0 bg-transparent text-slate-300 h-auto p-0 focus:ring-0" data-testid="select-status-filter">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all" className="text-slate-300 focus:bg-slate-700 focus:text-white">All Statuses</SelectItem>
                <SelectItem value="scheduled" className="text-slate-300 focus:bg-slate-700 focus:text-white">Scheduled</SelectItem>
                <SelectItem value="in_progress" className="text-slate-300 focus:bg-slate-700 focus:text-white">In Progress</SelectItem>
                <SelectItem value="completed" className="text-slate-300 focus:bg-slate-700 focus:text-white">Completed</SelectItem>
                <SelectItem value="cancelled" className="text-slate-300 focus:bg-slate-700 focus:text-white">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Badge variant="outline" className="bg-slate-800 text-slate-300 border-slate-700 px-3 py-1">
            {filteredSessions?.length || 0} Sessions
          </Badge>
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full bg-slate-800" />
            ))}
          </div>
        ) : filteredSessions && filteredSessions.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-slate-800/50">
                  <TableHead className="text-slate-400">Session</TableHead>
                  <TableHead className="text-slate-400">Student</TableHead>
                  <TableHead className="text-slate-400">Tutor</TableHead>
                  <TableHead className="text-slate-400">Date & Time</TableHead>
                  <TableHead className="text-slate-400">Status</TableHead>
                  <TableHead className="text-right text-slate-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSessions.map((session) => (
                  <TableRow key={session.id} className="border-slate-800 hover:bg-slate-800/30" data-testid={`session-row-${session.id}`}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-white">{session.subject}</p>
                        <p className="text-sm text-slate-500">{session.duration} minutes</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-slate-400">
                        <User className="h-4 w-4" />
                        <span>{session.student?.firstName} {session.student?.lastName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {session.tutor?.name || "Unassigned"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-4 text-slate-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{format(new Date(session.scheduledDate), "MMM d, yyyy")}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{format(new Date(session.scheduledDate), "h:mm a")}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={statusStyles[session.status as keyof typeof statusStyles]}
                      >
                        {session.status === "in_progress" ? "In Progress" : session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Select
                        value={session.status}
                        onValueChange={(newStatus) => 
                          updateStatusMutation.mutate({ sessionId: session.id, status: newStatus })
                        }
                      >
                        <SelectTrigger className="w-36 bg-slate-800 border-slate-700 text-slate-300" data-testid={`select-status-${session.id}`}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="scheduled" className="text-slate-300 focus:bg-slate-700 focus:text-white">Scheduled</SelectItem>
                          <SelectItem value="in_progress" className="text-slate-300 focus:bg-slate-700 focus:text-white">In Progress</SelectItem>
                          <SelectItem value="completed" className="text-slate-300 focus:bg-slate-700 focus:text-white">Completed</SelectItem>
                          <SelectItem value="cancelled" className="text-slate-300 focus:bg-slate-700 focus:text-white">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="h-16 w-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-slate-600" />
            </div>
            <h3 className="font-semibold text-lg text-white mb-2">No sessions found</h3>
            <p className="text-slate-400">
              {statusFilter !== "all" 
                ? `No ${statusFilter} sessions at the moment` 
                : "Sessions will appear here once students book them"
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
