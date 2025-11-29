import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Star, Clock, CheckCircle, AlertCircle, User, Mail, Trash2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { format } from "date-fns";
import type { FeedbackWithRelations } from "@shared/schema";

export default function AdminFeedback() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading, isAdmin } = useAuth();
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackWithRelations | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [adminResponse, setAdminResponse] = useState("");
  const [newStatus, setNewStatus] = useState<string>("");

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

  const { data: feedbackList, isLoading } = useQuery<FeedbackWithRelations[]>({
    queryKey: ["/api/feedback"],
    enabled: isAuthenticated && isAdmin,
  });

  const { data: stats } = useQuery<{
    total: number;
    pending: number;
    reviewed: number;
    resolved: number;
  }>({
    queryKey: ["/api/feedback/stats"],
    enabled: isAuthenticated && isAdmin,
  });

  const updateFeedbackMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { status?: string; adminResponse?: string } }) => {
      return await apiRequest("PUT", `/api/feedback/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Feedback updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/feedback"] });
      queryClient.invalidateQueries({ queryKey: ["/api/feedback/stats"] });
      setIsDialogOpen(false);
      setSelectedFeedback(null);
      setAdminResponse("");
      setNewStatus("");
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
        description: error.message || "Failed to update feedback.",
        variant: "destructive",
      });
    },
  });

  const deleteFeedbackMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/feedback/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Feedback deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/feedback"] });
      queryClient.invalidateQueries({ queryKey: ["/api/feedback/stats"] });
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
        description: error.message || "Failed to delete feedback.",
        variant: "destructive",
      });
    },
  });

  const handleOpenDialog = (feedback: FeedbackWithRelations) => {
    setSelectedFeedback(feedback);
    setAdminResponse(feedback.adminResponse || "");
    setNewStatus(feedback.status);
    setIsDialogOpen(true);
  };

  const handleUpdateFeedback = () => {
    if (!selectedFeedback) return;
    
    const updateData: { status?: string; adminResponse?: string } = {};
    if (newStatus && newStatus !== selectedFeedback.status) {
      updateData.status = newStatus;
    }
    if (adminResponse && adminResponse !== selectedFeedback.adminResponse) {
      updateData.adminResponse = adminResponse;
    }
    
    if (Object.keys(updateData).length > 0) {
      updateFeedbackMutation.mutate({ id: selectedFeedback.id, data: updateData });
    } else {
      setIsDialogOpen(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "reviewed":
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">
            <AlertCircle className="h-3 w-3 mr-1" />
            Reviewed
          </Badge>
        );
      case "resolved":
        return (
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
            <CheckCircle className="h-3 w-3 mr-1" />
            Resolved
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRatingStars = (rating: string | null) => {
    if (!rating) return null;
    const numRating = parseInt(rating);
    if (isNaN(numRating)) return null;
    
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= numRating ? "fill-amber-400 text-amber-400" : "text-slate-600"}`}
          />
        ))}
      </div>
    );
  };

  if (authLoading || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="h-10 w-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Student Feedback</h1>
              <p className="text-slate-400 text-sm">Review and respond to student feedback</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-sm">Total</span>
            <MessageSquare className="h-4 w-4 text-slate-500" />
          </div>
          <div className="text-2xl font-bold text-white">{stats?.total || 0}</div>
        </div>
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-sm">Pending</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-400">{stats?.pending || 0}</div>
        </div>
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-sm">Reviewed</span>
            <AlertCircle className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-blue-400">{stats?.reviewed || 0}</div>
        </div>
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-sm">Resolved</span>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{stats?.resolved || 0}</div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full bg-slate-800" />
          ))}
        </div>
      ) : feedbackList && feedbackList.length > 0 ? (
        <div className="space-y-4">
          {feedbackList.map((feedback) => (
            <div
              key={feedback.id}
              className="bg-slate-900 rounded-xl border border-slate-800 p-5 hover:border-cyan-500/30 transition-all cursor-pointer"
              onClick={() => handleOpenDialog(feedback)}
              data-testid={`feedback-card-${feedback.id}`}
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-semibold text-white">{feedback.subject}</h3>
                    {getStatusBadge(feedback.status)}
                    {getRatingStars(feedback.rating)}
                  </div>
                  
                  <p className="text-slate-300 line-clamp-2">{feedback.message}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{feedback.student?.firstName} {feedback.student?.lastName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      <span>{feedback.student?.email}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{feedback.createdAt && format(new Date(feedback.createdAt), "MMM d, yyyy 'at' h:mm a")}</span>
                    </div>
                  </div>
                  
                  {feedback.adminResponse && (
                    <div className="bg-slate-800/50 rounded-lg p-3 mt-2 border-l-2 border-cyan-500">
                      <p className="text-sm text-slate-400 mb-1">Admin Response:</p>
                      <p className="text-slate-300 text-sm">{feedback.adminResponse}</p>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteFeedbackMutation.mutate(feedback.id);
                    }}
                    disabled={deleteFeedbackMutation.isPending}
                    data-testid={`button-delete-feedback-${feedback.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-12 text-center">
          <div className="h-16 w-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="h-8 w-8 text-slate-600" />
          </div>
          <h3 className="font-semibold text-lg text-white mb-2">
            No feedback yet
          </h3>
          <p className="text-slate-400">
            Student feedback will appear here when submitted
          </p>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-white">
              Respond to Feedback
            </DialogTitle>
          </DialogHeader>
          
          {selectedFeedback && (
            <div className="space-y-4">
              <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-white">{selectedFeedback.subject}</span>
                  {getRatingStars(selectedFeedback.rating)}
                </div>
                <p className="text-slate-300">{selectedFeedback.message}</p>
                <div className="text-sm text-slate-400">
                  From: {selectedFeedback.student?.firstName} {selectedFeedback.student?.lastName} ({selectedFeedback.student?.email})
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-300">Status</label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="pending" className="text-slate-300 focus:bg-slate-700 focus:text-white">Pending</SelectItem>
                    <SelectItem value="reviewed" className="text-slate-300 focus:bg-slate-700 focus:text-white">Reviewed</SelectItem>
                    <SelectItem value="resolved" className="text-slate-300 focus:bg-slate-700 focus:text-white">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-300">Admin Response</label>
                <Textarea
                  placeholder="Write your response to the student..."
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white min-h-24"
                  data-testid="textarea-admin-response"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsDialogOpen(false)}
              className="text-slate-300 hover:text-white hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateFeedback}
              className="bg-cyan-500 hover:bg-cyan-600 text-white"
              disabled={updateFeedbackMutation.isPending}
              data-testid="button-submit-response"
            >
              {updateFeedbackMutation.isPending ? "Saving..." : "Save Response"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
