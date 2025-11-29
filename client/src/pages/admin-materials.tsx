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
import { Plus, FileText, Trash2, Download, Database } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { SUBJECTS } from "@/lib/subjects";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { LearningMaterialWithRelations, InsertLearningMaterial } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertLearningMaterialSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { format } from "date-fns";

export default function AdminMaterials() {
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

  const { data: materials, isLoading } = useQuery<LearningMaterialWithRelations[]>({
    queryKey: ["/api/materials"],
    enabled: isAuthenticated && isAdmin,
  });

  const form = useForm<InsertLearningMaterial>({
    resolver: zodResolver(insertLearningMaterialSchema),
    defaultValues: {
      title: "",
      description: "",
      subject: "",
      fileUrl: "",
      fileType: "",
      uploadedById: user?.id || "",
    },
  });

  useEffect(() => {
    if (user?.id) {
      form.setValue("uploadedById", user.id);
    }
  }, [user, form]);

  const createMutation = useMutation({
    mutationFn: async (data: InsertLearningMaterial) => {
      return await apiRequest("POST", "/api/materials", data);
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Learning material added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/materials"] });
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
        description: error.message || "Failed to add material.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/materials/${id}`, {});
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Material deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/materials"] });
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
        description: error.message || "Failed to delete material.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: InsertLearningMaterial) => {
    createMutation.mutate(data);
  };

  if (authLoading || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Database className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Learning Materials</h1>
              <p className="text-slate-400 text-sm">Manage learning resources for students</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-slate-800 text-slate-300 border-slate-700 px-3 py-1">
            {materials?.length || 0} Materials
          </Badge>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-purple-500 hover:bg-purple-600 text-white" data-testid="button-add-material">
                <Plus className="h-4 w-4 mr-2" />
                Add Material
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-slate-900 border-slate-800">
              <DialogHeader>
                <DialogTitle className="font-display text-2xl text-white">Add Learning Material</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Calculus Study Guide" {...field} className="bg-slate-800 border-slate-700 text-white" data-testid="input-material-title" />
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
                            <SelectTrigger className="bg-slate-800 border-slate-700 text-white" data-testid="select-material-subject">
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
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Describe this material..." {...field} value={field.value || ""} className="bg-slate-800 border-slate-700 text-white" data-testid="input-material-description" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fileUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">File URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/file.pdf" {...field} className="bg-slate-800 border-slate-700 text-white" data-testid="input-material-url" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fileType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">File Type (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="PDF, DOCX, etc." {...field} value={field.value || ""} className="bg-slate-800 border-slate-700 text-white" data-testid="input-material-type" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button
                      type="submit"
                      className="bg-purple-500 hover:bg-purple-600 text-white"
                      disabled={createMutation.isPending}
                      data-testid="button-submit-material"
                    >
                      {createMutation.isPending ? "Adding..." : "Add Material"}
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
            <Skeleton key={i} className="h-64 w-full bg-slate-800" />
          ))}
        </div>
      ) : materials && materials.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {materials.map((material) => (
            <div
              key={material.id}
              className="bg-slate-900 rounded-xl border border-slate-800 p-6 hover:border-purple-500/30 transition-all flex flex-col"
              data-testid={`material-card-${material.id}`}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="h-12 w-12 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-6 w-6 text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg text-white line-clamp-2 mb-1">
                    {material.title}
                  </h3>
                  <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-400 border-purple-500/30">
                    {material.subject}
                  </Badge>
                </div>
              </div>
              
              {material.description && (
                <p className="text-sm text-slate-400 line-clamp-3 mb-4 flex-1">
                  {material.description}
                </p>
              )}
              
              <div className="mt-auto space-y-3">
                <div className="text-xs text-slate-500">
                  {material.createdAt && `Uploaded ${format(new Date(material.createdAt), "MMM d, yyyy")}`}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                    onClick={() => window.open(material.fileUrl, "_blank")}
                    data-testid={`button-download-${material.id}`}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                  <Button
                    size="sm"
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30"
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this material?")) {
                        deleteMutation.mutate(material.id);
                      }
                    }}
                    data-testid={`button-delete-${material.id}`}
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
            <FileText className="h-8 w-8 text-slate-600" />
          </div>
          <h3 className="font-semibold text-lg text-white mb-2">No materials yet</h3>
          <p className="text-slate-400 mb-4">
            Add your first learning material to get started
          </p>
          <Button 
            className="bg-purple-500 hover:bg-purple-600 text-white"
            onClick={() => setIsDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Material
          </Button>
        </div>
      )}
    </div>
  );
}
