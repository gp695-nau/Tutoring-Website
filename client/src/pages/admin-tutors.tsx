import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getProfessorImage } from "@/lib/professorImages";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Mail, GraduationCap, DollarSign } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Tutor, InsertTutor } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTutorSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export default function AdminTutors() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading, isAdmin } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTutor, setEditingTutor] = useState<Tutor | null>(null);

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

  const { data: tutors, isLoading } = useQuery<Tutor[]>({
    queryKey: ["/api/tutors"],
    enabled: isAuthenticated && isAdmin,
  });

  const form = useForm<InsertTutor>({
    resolver: zodResolver(insertTutorSchema),
    defaultValues: {
      name: "",
      email: "",
      specialty: "",
      bio: "",
      profileImageUrl: "",
      hourlyRate: "",
      availability: "Monday-Friday: 9:00 AM - 5:00 PM",
    },
  });

  useEffect(() => {
    if (editingTutor) {
      form.reset(editingTutor);
    } else {
      form.reset({
        name: "",
        email: "",
        specialty: "",
        bio: "",
        profileImageUrl: "",
        hourlyRate: "",
        availability: "Monday-Friday: 9:00 AM - 5:00 PM",
      });
    }
  }, [editingTutor, form]);

  const createMutation = useMutation({
    mutationFn: async (data: InsertTutor) => {
      return await apiRequest("POST", "/api/tutors", data);
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Tutor created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tutors"] });
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
        description: error.message || "Failed to create tutor.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: InsertTutor }) => {
      return await apiRequest("PUT", `/api/tutors/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Tutor updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tutors"] });
      setIsDialogOpen(false);
      setEditingTutor(null);
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
        description: error.message || "Failed to update tutor.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/tutors/${id}`, {});
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Tutor deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tutors"] });
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
        description: error.message || "Failed to delete tutor.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: InsertTutor) => {
    if (editingTutor) {
      updateMutation.mutate({ id: editingTutor.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (authLoading || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="h-10 w-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Tutors</h1>
              <p className="text-slate-400 text-sm">Manage your platform's tutors</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-slate-800 text-slate-300 border-slate-700 px-3 py-1">
            {tutors?.length || 0} Tutors
          </Badge>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingTutor(null);
              form.reset();
            }
          }}>
            <DialogTrigger asChild>
              <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900" data-testid="button-add-tutor">
                <Plus className="h-4 w-4 mr-2" />
                Add Tutor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-800">
              <DialogHeader>
                <DialogTitle className="font-display text-2xl text-white">
                  {editingTutor ? "Edit Tutor" : "Add New Tutor"}
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} className="bg-slate-800 border-slate-700 text-white" data-testid="input-tutor-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@example.com" {...field} className="bg-slate-800 border-slate-700 text-white" data-testid="input-tutor-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="specialty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Specialty</FormLabel>
                        <FormControl>
                          <Input placeholder="Mathematics" {...field} className="bg-slate-800 border-slate-700 text-white" data-testid="input-tutor-specialty" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Bio (Optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Tell us about this tutor..." {...field} value={field.value || ""} className="bg-slate-800 border-slate-700 text-white" data-testid="input-tutor-bio" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="hourlyRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Hourly Rate (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="50" {...field} value={field.value || ""} className="bg-slate-800 border-slate-700 text-white" data-testid="input-tutor-rate" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="availability"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Availability</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Monday-Friday: 9:00 AM - 5:00 PM" {...field} className="bg-slate-800 border-slate-700 text-white" data-testid="input-tutor-availability" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button
                      type="submit"
                      className="bg-amber-500 hover:bg-amber-600 text-slate-900"
                      disabled={createMutation.isPending || updateMutation.isPending}
                      data-testid="button-submit-tutor"
                    >
                      {createMutation.isPending || updateMutation.isPending
                        ? "Saving..."
                        : editingTutor
                          ? "Update Tutor"
                          : "Create Tutor"}
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
      ) : tutors && tutors.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tutors.map((tutor) => (
            <div 
              key={tutor.id} 
              className="bg-slate-900 rounded-xl border border-slate-800 p-6 hover:border-amber-500/30 transition-all"
              data-testid={`tutor-card-${tutor.id}`}
            >
              <div className="flex items-start gap-4 mb-4">
                <Avatar className="h-16 w-16 ring-2 ring-amber-500/20">
                  <AvatarImage src={tutor.profileImageUrl || getProfessorImage(tutor.id)} className="object-cover" />
                  <AvatarFallback className="bg-amber-500/20 text-amber-400 text-lg font-medium">
                    {tutor.name.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg text-white truncate">
                    {tutor.name}
                  </h3>
                  <Badge variant="outline" className="mt-1 text-xs bg-amber-500/10 text-amber-400 border-amber-500/30">
                    {tutor.specialty}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{tutor.email}</span>
                </div>
                {tutor.hourlyRate && (
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <DollarSign className="h-4 w-4" />
                    <span><span className="font-medium text-white">${tutor.hourlyRate}</span> per hour</span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                  onClick={() => {
                    setEditingTutor(tutor);
                    setIsDialogOpen(true);
                  }}
                  data-testid={`button-edit-${tutor.id}`}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30"
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this tutor?")) {
                      deleteMutation.mutate(tutor.id);
                    }
                  }}
                  data-testid={`button-delete-${tutor.id}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-12 text-center">
          <div className="h-16 w-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="h-8 w-8 text-slate-600" />
          </div>
          <h3 className="font-semibold text-lg text-white mb-2">No tutors yet</h3>
          <p className="text-slate-400 mb-4">
            Add your first tutor to get started
          </p>
          <Button 
            className="bg-amber-500 hover:bg-amber-600 text-slate-900"
            onClick={() => setIsDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Tutor
          </Button>
        </div>
      )}
    </div>
  );
}
