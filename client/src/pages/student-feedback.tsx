import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { MessageSquare, Star, Clock, CheckCircle, AlertCircle, Plus, Send } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { format } from "date-fns";
import type { FeedbackWithRelations, InsertFeedback } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertFeedbackSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export default function StudentFeedback() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number>(0);

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

  const { data: feedbackList, isLoading } = useQuery<FeedbackWithRelations[]>({
    queryKey: ["/api/feedback"],
    enabled: isAuthenticated,
  });

  const form = useForm<InsertFeedback>({
    resolver: zodResolver(insertFeedbackSchema),
    defaultValues: {
      studentId: user?.id || "",
      subject: "",
      message: "",
      rating: "",
    },
  });

  useEffect(() => {
    if (user?.id) {
      form.setValue("studentId", user.id);
    }
  }, [user, form]);

  const createFeedbackMutation = useMutation({
    mutationFn: async (data: InsertFeedback) => {
      return await apiRequest("POST", "/api/feedback", data);
    },
    onSuccess: () => {
      toast({
        title: "Feedback Submitted!",
        description: "Thank you for your feedback. We'll review it soon.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/feedback"] });
      setIsDialogOpen(false);
      form.reset();
      setSelectedRating(0);
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
        description: error.message || "Failed to submit feedback.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertFeedback) => {
    createFeedbackMutation.mutate({
      ...data,
      rating: selectedRating > 0 ? selectedRating.toString() : undefined,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "reviewed":
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30">
            <AlertCircle className="h-3 w-3 mr-1" />
            Reviewed
          </Badge>
        );
      case "resolved":
        return (
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
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
            className={`h-4 w-4 ${star <= numRating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
          />
        ))}
      </div>
    );
  };

  if (authLoading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">My Feedback</h1>
              <p className="text-muted-foreground text-sm">Share your thoughts and suggestions</p>
            </div>
          </div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" data-testid="button-new-feedback">
              <Plus className="h-4 w-4 mr-2" />
              New Feedback
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">Submit Feedback</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl>
                        <Input placeholder="What's your feedback about?" {...field} data-testid="input-feedback-subject" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Share your thoughts, suggestions, or concerns..."
                          className="min-h-24"
                          {...field}
                          data-testid="textarea-feedback-message"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <label className="text-sm font-medium">Rating (Optional)</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setSelectedRating(star === selectedRating ? 0 : star)}
                        className="p-1 hover:scale-110 transition-transform"
                        data-testid={`button-rating-${star}`}
                      >
                        <Star
                          className={`h-6 w-6 ${star <= selectedRating ? "fill-amber-400 text-amber-400" : "text-gray-300 hover:text-amber-300"}`}
                        />
                      </button>
                    ))}
                    {selectedRating > 0 && (
                      <span className="text-sm text-muted-foreground ml-2">
                        {selectedRating}/5
                      </span>
                    )}
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    disabled={createFeedbackMutation.isPending}
                    data-testid="button-submit-feedback"
                  >
                    {createFeedbackMutation.isPending ? (
                      "Submitting..."
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Feedback
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : feedbackList && feedbackList.length > 0 ? (
        <div className="space-y-4">
          {feedbackList.map((feedback) => (
            <Card key={feedback.id} className="hover:shadow-md transition-shadow" data-testid={`student-feedback-card-${feedback.id}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <CardTitle className="text-lg">{feedback.subject}</CardTitle>
                  <div className="flex items-center gap-2">
                    {getRatingStars(feedback.rating)}
                    {getStatusBadge(feedback.status)}
                  </div>
                </div>
                <CardDescription className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {feedback.createdAt && format(new Date(feedback.createdAt), "MMM d, yyyy 'at' h:mm a")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-foreground">{feedback.message}</p>
                
                {feedback.adminResponse && (
                  <div className="bg-indigo-50 dark:bg-indigo-950/30 rounded-lg p-4 border-l-4 border-indigo-500">
                    <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-1">
                      Admin Response
                    </p>
                    <p className="text-foreground text-sm">{feedback.adminResponse}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <div className="h-16 w-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="font-semibold text-lg mb-2">
            No feedback submitted yet
          </h3>
          <p className="text-muted-foreground mb-4">
            Share your thoughts, suggestions, or concerns with us
          </p>
          <Button onClick={() => setIsDialogOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Submit Your First Feedback
          </Button>
        </Card>
      )}
    </div>
  );
}
