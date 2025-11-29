import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Video, Search, Play, Filter, Clock, User } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import type { LectureVideoWithRelations } from "@shared/schema";

function getYouTubeEmbedUrl(url: string): string {
  if (!url) return "";
  
  if (url.includes("/embed/")) {
    return url;
  }
  
  let videoId = "";
  
  const watchMatch = url.match(/[?&]v=([^&]+)/);
  if (watchMatch) {
    videoId = watchMatch[1];
  }
  
  const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
  if (shortMatch) {
    videoId = shortMatch[1];
  }
  
  const embedMatch = url.match(/embed\/([^?&]+)/);
  if (embedMatch) {
    videoId = embedMatch[1];
  }
  
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}`;
  }
  
  return url;
}

export default function LectureVideos() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [selectedVideo, setSelectedVideo] = useState<LectureVideoWithRelations | null>(null);

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

  const { data: videos, isLoading } = useQuery<LectureVideoWithRelations[]>({
    queryKey: ["/api/videos"],
    enabled: isAuthenticated,
  });

  const subjects = Array.from(new Set(videos?.map((v) => v.subject).filter((s) => s && s.trim() !== "") || []));

  const filteredVideos = videos?.filter((video) => {
    const matchesSearch =
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = subjectFilter === "all" || video.subject === subjectFilter;
    return matchesSearch && matchesSubject;
  });

  if (authLoading) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
          Lecture Videos
        </h1>
        <p className="text-muted-foreground text-lg">
          Watch recorded lectures and tutorials from expert professors
        </p>
      </div>

      {/* Filters */}
      <Card className="border-card-border">
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search videos..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search-videos"
              />
            </div>
            <div className="flex items-center gap-2 md:w-64">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger data-testid="select-subject-filter">
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Videos Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-72 w-full" />
          ))}
        </div>
      ) : filteredVideos && filteredVideos.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVideos.map((video) => (
            <Card
              key={video.id}
              className="border-card-border hover-elevate flex flex-col overflow-hidden cursor-pointer"
              onClick={() => setSelectedVideo(video)}
              data-testid={`video-card-${video.id}`}
            >
              {/* Thumbnail */}
              <div className="relative aspect-video bg-muted flex items-center justify-center">
                {video.thumbnailUrl ? (
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center">
                    <Video className="h-12 w-12 text-emerald-600 opacity-50" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <div className="h-14 w-14 rounded-full bg-white/90 flex items-center justify-center">
                    <Play className="h-6 w-6 text-emerald-600 ml-1" />
                  </div>
                </div>
                {video.duration && (
                  <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 rounded text-xs text-white flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {video.duration}
                  </div>
                )}
              </div>

              <CardContent className="flex-1 flex flex-col gap-3 p-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground line-clamp-2">
                    {video.title}
                  </h3>
                  <Badge variant="secondary" className="text-xs bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                    {video.subject}
                  </Badge>
                </div>
                {video.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {video.description}
                  </p>
                )}
                {video.tutor && (
                  <div className="mt-auto flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>{video.tutor.name}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-card-border">
          <CardContent className="p-12 text-center">
            <Video className="h-16 w-16 text-emerald-600 mx-auto mb-4 opacity-50" />
            <h3 className="font-semibold text-lg text-foreground mb-2">
              {searchQuery || subjectFilter !== "all"
                ? "No videos found"
                : "No videos available"}
            </h3>
            <p className="text-muted-foreground">
              {searchQuery || subjectFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Lecture videos will appear here when they're uploaded"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Video Player Dialog */}
      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-4xl" aria-describedby="video-description">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {selectedVideo?.title}
            </DialogTitle>
            <DialogDescription id="video-description" className="sr-only">
              Watch the lecture video: {selectedVideo?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Video Player */}
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              {selectedVideo?.videoUrl && (
                <iframe
                  src={getYouTubeEmbedUrl(selectedVideo.videoUrl)}
                  className="w-full h-full"
                  title={selectedVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>

            {/* Video Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                  {selectedVideo?.subject}
                </Badge>
                {selectedVideo?.duration && (
                  <Badge variant="outline">
                    <Clock className="h-3 w-3 mr-1" />
                    {selectedVideo.duration}
                  </Badge>
                )}
              </div>
              {selectedVideo?.description && (
                <p className="text-muted-foreground">{selectedVideo.description}</p>
              )}
              {selectedVideo?.tutor && (
                <p className="text-sm text-muted-foreground">
                  Instructor: <span className="font-medium text-foreground">{selectedVideo.tutor.name}</span>
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
