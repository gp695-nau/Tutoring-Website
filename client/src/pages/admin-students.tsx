import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Mail, UserCog, Users, Shield } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { User } from "@shared/schema";
import { format } from "date-fns";

export default function AdminStudents() {
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

  const { data: students, isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/students"],
    enabled: isAuthenticated && isAdmin,
  });

  const changeRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: "student" | "admin" }) => {
      return await apiRequest("PUT", `/api/admin/users/${userId}/role`, { role });
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "User role updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/students"] });
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
        description: error.message || "Failed to update user role.",
        variant: "destructive",
      });
    },
  });

  if (authLoading || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Students</h1>
              <p className="text-slate-400 text-sm">Manage student accounts and roles</p>
            </div>
          </div>
        </div>
        <Badge variant="outline" className="bg-slate-800 text-slate-300 border-slate-700 px-3 py-1 self-start">
          {students?.length || 0} Total Students
        </Badge>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full bg-slate-800" />
            ))}
          </div>
        ) : students && students.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-slate-800/50">
                  <TableHead className="text-slate-400">User</TableHead>
                  <TableHead className="text-slate-400">Email</TableHead>
                  <TableHead className="text-slate-400">Role</TableHead>
                  <TableHead className="text-slate-400">Joined</TableHead>
                  <TableHead className="text-right text-slate-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id} className="border-slate-800 hover:bg-slate-800/30" data-testid={`student-row-${student.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 ring-2 ring-slate-700">
                          <AvatarImage src={student.profileImageUrl || undefined} className="object-cover" />
                          <AvatarFallback className="bg-blue-500/20 text-blue-400 text-sm">
                            {student.firstName?.[0]}{student.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-white" data-testid={`student-name-${student.id}`}>
                            {student.firstName} {student.lastName}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-slate-400">
                        <Mail className="h-4 w-4" />
                        <span data-testid={`student-email-${student.id}`}>{student.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={student.role === "admin" 
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/30" 
                          : "bg-blue-500/10 text-blue-400 border-blue-500/30"
                        }
                        data-testid={`student-role-${student.id}`}
                      >
                        {student.role === "admin" ? (
                          <>
                            <Shield className="h-3 w-3 mr-1" />
                            Admin
                          </>
                        ) : (
                          "Student"
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-400">
                      {student.createdAt 
                        ? format(new Date(student.createdAt), "MMM d, yyyy")
                        : "N/A"
                      }
                    </TableCell>
                    <TableCell className="text-right">
                      {student.role === "student" ? (
                        <Button
                          size="sm"
                          className="bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30"
                          onClick={() => changeRoleMutation.mutate({ userId: student.id, role: "admin" })}
                          disabled={changeRoleMutation.isPending}
                          data-testid={`button-make-admin-${student.id}`}
                        >
                          <UserCog className="h-4 w-4 mr-1" />
                          Make Admin
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="bg-slate-700 text-slate-300 hover:bg-slate-600 border border-slate-600"
                          onClick={() => changeRoleMutation.mutate({ userId: student.id, role: "student" })}
                          disabled={changeRoleMutation.isPending}
                          data-testid={`button-make-student-${student.id}`}
                        >
                          <UserCog className="h-4 w-4 mr-1" />
                          Remove Admin
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="h-16 w-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-slate-600" />
            </div>
            <h3 className="font-semibold text-lg text-white mb-2">No students yet</h3>
            <p className="text-slate-400">
              Students will appear here once they sign up
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
