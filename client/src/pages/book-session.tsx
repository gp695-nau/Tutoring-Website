import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Clock, Search, Check } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Tutor } from "@shared/schema";
import { getProfessorImage } from "@/lib/professorImages";
import { SUBJECTS } from "@/lib/subjects";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function BookSession() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("");
  const [subject, setSubject] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

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

  const { data: tutors, isLoading: tutorsLoading } = useQuery<Tutor[]>({
    queryKey: ["/api/tutors"],
    enabled: isAuthenticated,
  });

  const bookSessionMutation = useMutation({
    mutationFn: async (data: {
      tutorId: string;
      subject: string;
      scheduledDate: Date;
      duration: string;
    }) => {
      return await apiRequest("POST", "/api/sessions", data);
    },
    onSuccess: () => {
      toast({
        title: "Session Booked!",
        description: "Your tutoring session has been scheduled successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      setSelectedTutor(null);
      setSelectedDate(undefined);
      setSelectedTime("");
      setSubject("");
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
        title: "Booking Failed",
        description: error.message || "Failed to book session. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleBookSession = () => {
    if (!selectedTutor || !selectedDate || !selectedTime || !subject) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields to book a session.",
        variant: "destructive",
      });
      return;
    }

    const [hours, minutes] = selectedTime.split(":");
    const scheduledDateTime = new Date(selectedDate);
    scheduledDateTime.setHours(parseInt(hours), parseInt(minutes));

    bookSessionMutation.mutate({
      tutorId: selectedTutor.id,
      subject,
      scheduledDate: scheduledDateTime,
      duration: "60 minutes",
    });
  };

  const filteredTutors = tutors?.filter(
    (tutor) =>
      tutor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutor.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const timeSlots = [
    "09:00", "10:00", "11:00", "12:00", "13:00", "14:00",
    "15:00", "16:00", "17:00", "18:00", "19:00", "20:00",
  ];

  if (authLoading) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
          Book a Session
        </h1>
        <p className="text-muted-foreground text-lg">
          Choose a tutor and schedule your next learning session
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Tutor Selection */}
        <Card className="border-card-border" data-testid="card-select-tutor">
          <CardHeader>
            <CardTitle className="font-display text-2xl">Select a Tutor</CardTitle>
            <CardDescription>Choose from our expert tutors</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or specialty..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search-tutors"
              />
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {tutorsLoading ? (
                <>
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </>
              ) : filteredTutors && filteredTutors.length > 0 ? (
                filteredTutors.map((tutor) => (
                  <div
                    key={tutor.id}
                    className={`flex items-start gap-4 p-4 rounded-md border cursor-pointer transition-colors ${
                      selectedTutor?.id === tutor.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover-elevate"
                    }`}
                    onClick={() => setSelectedTutor(tutor)}
                    data-testid={`tutor-card-${tutor.id}`}
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={tutor.profileImageUrl || getProfessorImage(tutor.id)} className="object-cover" />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {tutor.name.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-foreground">{tutor.name}</h4>
                        {selectedTutor?.id === tutor.id && (
                          <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                            <Check className="h-3 w-3 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {tutor.specialty}
                      </Badge>
                      {tutor.hourlyRate && (
                        <p className="text-sm text-muted-foreground mt-2">
                          ${tutor.hourlyRate}/hour
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">No tutors found</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Booking Details */}
        <Card className="border-card-border" data-testid="card-booking-details">
          <CardHeader>
            <CardTitle className="font-display text-2xl">Booking Details</CardTitle>
            <CardDescription>Select date, time, and subject</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger id="subject" data-testid="select-subject">
                  <SelectValue placeholder="Choose a subject" />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECTS.map((subj) => (
                    <SelectItem key={subj} value={subj}>
                      {subj}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Select Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    data-testid="button-select-date"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Select Time</Label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger id="time" data-testid="select-time">
                  <SelectValue placeholder="Choose a time slot" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {format(new Date(`2000-01-01T${time}`), "h:mm a")}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTutor && (
              <div className="p-4 bg-muted/50 rounded-md border border-border">
                <h4 className="font-medium text-sm text-foreground mb-2">Session Summary</h4>
                <div className="space-y-1 text-sm">
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">Tutor:</span> {selectedTutor.name}
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">Subject:</span>{" "}
                    {subject || "Not specified"}
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">Duration:</span> 60 minutes
                  </p>
                </div>
              </div>
            )}

            <Button
              className="w-full"
              onClick={handleBookSession}
              disabled={!selectedTutor || !selectedDate || !selectedTime || !subject || bookSessionMutation.isPending}
              data-testid="button-confirm-booking"
            >
              {bookSessionMutation.isPending ? "Booking..." : "Confirm Booking"}
            </Button>
            
            {(!selectedTutor || !selectedDate || !selectedTime || !subject) && (
              <p className="text-xs text-muted-foreground text-center mt-2">
                Please fill all fields: 
                {!selectedTutor && " Select a tutor,"}
                {!subject && " Choose a subject,"}
                {!selectedDate && " Pick a date,"}
                {!selectedTime && " Select a time"}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
