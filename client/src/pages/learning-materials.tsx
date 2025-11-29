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
import { BookOpen, Search, FileText, Download, Filter } from "lucide-react";
import type { LearningMaterialWithRelations } from "@shared/schema";
import { format } from "date-fns";

export default function LearningMaterials() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");

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

  const { data: materials, isLoading } = useQuery<LearningMaterialWithRelations[]>({
    queryKey: ["/api/materials"],
    enabled: isAuthenticated,
  });

  const subjects = Array.from(new Set(materials?.map((m) => m.subject).filter((s) => s && s.trim() !== "") || []));

  const filteredMaterials = materials?.filter((material) => {
    const matchesSearch =
      material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = subjectFilter === "all" || material.subject === subjectFilter;
    return matchesSearch && matchesSubject;
  });

  if (authLoading) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
          Learning Materials
        </h1>
        <p className="text-muted-foreground text-lg">
          Access study guides, notes, and resources for your subjects
        </p>
      </div>

      {/* Filters */}
      <Card className="border-card-border">
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search materials..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search-materials"
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

      {/* Materials Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      ) : filteredMaterials && filteredMaterials.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMaterials.map((material) => (
            <Card
              key={material.id}
              className="border-card-border hover-elevate flex flex-col"
              data-testid={`material-card-${material.id}`}
            >
              <CardHeader className="space-y-3">
                <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <CardTitle className="font-semibold text-lg text-foreground leading-tight">
                    {material.title}
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {material.subject}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-4">
                {material.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {material.description}
                  </p>
                )}
                <div className="mt-auto space-y-3">
                  <div className="text-xs text-muted-foreground">
                    Uploaded {material.createdAt ? format(new Date(material.createdAt), "MMM d, yyyy") : "Recently"}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open(material.fileUrl, "_blank")}
                    data-testid={`button-download-${material.id}`}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-card-border">
          <CardContent className="p-12 text-center">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="font-semibold text-lg text-foreground mb-2">
              {searchQuery || subjectFilter !== "all"
                ? "No materials found"
                : "No materials available"}
            </h3>
            <p className="text-muted-foreground">
              {searchQuery || subjectFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Learning materials will appear here when they're uploaded"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
