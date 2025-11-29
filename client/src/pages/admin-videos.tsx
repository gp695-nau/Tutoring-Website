import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Video, Trash2, Clock, User, Play } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { SUBJECTS } from "@/lib/subjects";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { LectureVideoWithRelations, InsertLectureVideo, Tutor } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertLectureVideoSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export default function AdminVideos() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading, isAdmin, user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  const { data: videos, isLoading } = useQuery<LectureVideoWithRelations[]>({
    queryKey: ["/api/videos"],
    enabled: isAuthenticated && isAdmin,
  });

  const { data: tutors } = useQuery<Tutor[]>({
    queryKey: ["/api/tutors"],
    enabled: isAuthenticated && isAdmin,
  });

  const form = useForm<InsertLectureVideo>({
    resolver: zodResolver(insertLectureVideoSchema),
    defaultValues: {
      title: "",
      description: "",
      subject: "",
      videoUrl: "",
      thumbnailUrl: "",
      duration: "",
      tutorId: undefined,
      uploadedById: user?.id || "",
    },
  });

  useEffect(() => {
    if (user?.id) {
      form.setValue("uploadedById", user.id);
    }
  }, [user, form]);

  const createVideoMutation = useMutation({
    mutationFn: async (data: InsertLectureVideo) => {
      return await apiRequest("POST", "/api/videos", data);
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Video uploaded successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
      setIsDialogOpen(false);
      form.reset();
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
        description: error.message || "Failed to upload video.",
        variant: "destructive",
      });
    },
  });

  const deleteVideoMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/videos/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Video deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
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
        description: error.message || "Failed to delete video.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertLectureVideo) => {
    const normalizedData = {
      ...data,
      tutorId: data.tutorId === "__none__" ? undefined : data.tutorId,
    };
    createVideoMutation.mutate(normalizedData);
  };

  if (authLoading || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="h-10 w-10 rounded-lg bg-rose-500/20 flex items-center justify-center">
              <Video className="h-5 w-5 text-rose-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Lecture Videos</h1>
              <p className="text-slate-400 text-sm">Upload and manage video lectures for students</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-slate-800 text-slate-300 border-slate-700 px-3 py-1">
            {videos?.length || 0} Videos
          </Badge>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-rose-500 hover:bg-rose-600 text-white" data-testid="button-add-video">
                <Plus className="h-4 w-4 mr-2" />
                Add Video
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-slate-900 border-slate-800">
              <DialogHeader>
                <DialogTitle className="font-display text-xl text-white">Add New Video</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Introduction to Calculus" {...field} className="bg-slate-800 border-slate-700 text-white" data-testid="input-video-title" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Subject</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-slate-800 border-slate-700 text-white" data-testid="select-video-subject">
                              <SelectValue placeholder="Select a subject" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-slate-800 border-slate-700 max-h-60">
                            {SUBJECTS.map((subj) => (
                              <SelectItem key={subj} value={subj} className="text-slate-300 focus:bg-slate-700 focus:text-white">
                                {subj}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="videoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Video URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://youtube.com/embed/..." {...field} className="bg-slate-800 border-slate-700 text-white" data-testid="input-video-url" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="thumbnailUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Thumbnail URL (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/thumbnail.jpg" {...field} value={field.value || ""} className="bg-slate-800 border-slate-700 text-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Duration (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="45:00" {...field} value={field.value || ""} className="bg-slate-800 border-slate-700 text-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tutorId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Instructor (optional)</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(value === "__none__" ? undefined : value)} 
                          value={field.value || "__none__"}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                              <SelectValue placeholder="Select instructor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-slate-800 border-slate-700">
                            <SelectItem value="__none__" className="text-slate-300 focus:bg-slate-700 focus:text-white">No instructor</SelectItem>
                            {tutors?.map((tutor) => (
                              <SelectItem key={tutor.id} value={tutor.id} className="text-slate-300 focus:bg-slate-700 focus:text-white">
                                {tutor.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Description (optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Brief description of the video..." {...field} value={field.value || ""} className="bg-slate-800 border-slate-700 text-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button
                      type="submit"
                      className="bg-rose-500 hover:bg-rose-600 text-white"
                      disabled={createVideoMutation.isPending}
                      data-testid="button-submit-video"
                    >
                      {createVideoMutation.isPending ? "Uploading..." : "Upload Video"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-72 w-full bg-slate-800" />
          ))}
        </div>
      ) : videos && videos.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {videos.map((video) => (
            <div
              key={video.id}
              className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden hover:border-rose-500/30 transition-all flex flex-col"
              data-testid={`admin-video-card-${video.id}`}
            >
              <div className="relative aspect-video bg-slate-800 flex items-center justify-center group">
                {video.thumbnailUrl ? (
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-rose-500/20 to-rose-600/10 flex items-center justify-center">
                    <Play className="h-12 w-12 text-rose-500 opacity-50" />
                  </div>
                )}
                {video.duration && (
                  <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 rounded text-xs text-white flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {video.duration}
                  </div>
                )}
              </div>

              <div className="flex-1 flex flex-col gap-3 p-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-white line-clamp-2">
                    {video.title}
                  </h3>
                  <Badge variant="outline" className="text-xs bg-rose-500/10 text-rose-400 border-rose-500/30">
                    {video.subject}
                  </Badge>
                </div>
                {video.tutor && (
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <User className="h-4 w-4" />
                    <span>{video.tutor.name}</span>
                  </div>
                )}
                <div className="mt-auto">
                  <Button
                    size="sm"
                    className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30"
                    onClick={() => deleteVideoMutation.mutate(video.id)}
                    disabled={deleteVideoMutation.isPending}
                    data-testid={`button-delete-video-${video.id}`}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-12 text-center">
          <div className="h-16 w-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
            <Video className="h-8 w-8 text-slate-600" />
          </div>
          <h3 className="font-semibold text-lg text-white mb-2">
            No videos uploaded
          </h3>
          <p className="text-slate-400 mb-4">
            Upload lecture videos to share with students
          </p>
          <Button onClick={() => setIsDialogOpen(true)} className="bg-rose-500 hover:bg-rose-600 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add First Video
          </Button>
        </div>
      )}
    </div>
  );
}
