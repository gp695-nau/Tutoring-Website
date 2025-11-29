import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, User } from "lucide-react";
import type { TutoringSessionWithRelations } from "@shared/schema";
import { format } from "date-fns";

const statusStyles = {
  scheduled: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  in_progress: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
};

export default function MySessions() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("upcoming");

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

  const { data: sessions, isLoading } = useQuery<TutoringSessionWithRelations[]>({
    queryKey: ["/api/sessions"],
    enabled: isAuthenticated,
  });

  const upcomingSessions = sessions?.filter((s) => s.status === "scheduled" && new Date(s.scheduledDate) > new Date()) || [];
  const pastSessions = sessions?.filter((s) => s.status === "completed" || (s.status === "scheduled" && new Date(s.scheduledDate) <= new Date())) || [];
  const cancelledSessions = sessions?.filter((s) => s.status === "cancelled") || [];

  if (authLoading) {
    return null;
  }

  const SessionCard = ({ session }: { session: TutoringSessionWithRelations }) => (
    <Card className="border-card-border hover-elevate" data-testid={`session-card-${session.id}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-14 w-14">
            <AvatarImage src={session.tutor.profileImageUrl || undefined} className="object-cover" />
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
              {session.tutor.name.split(" ").map((n) => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h3 className="font-semibold text-lg text-foreground">{session.subject}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <User className="h-3 w-3" />
                  {session.tutor.name}
                </p>
              </div>
              <Badge className={statusStyles[session.status]}>
                {session.status.replace("_", " ")}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(session.scheduledDate), "MMMM d, yyyy")}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{format(new Date(session.scheduledDate), "h:mm a")} • {session.duration}</span>
              </div>
            </div>
            {session.notes && (
              <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                {session.notes}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
          My Sessions
        </h1>
        <p className="text-muted-foreground text-lg">
          View and manage your tutoring sessions
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList data-testid="tabs-sessions">
          <TabsTrigger value="upcoming" data-testid="tab-upcoming">
            Upcoming ({upcomingSessions.length})
          </TabsTrigger>
          <TabsTrigger value="past" data-testid="tab-past">
            Past ({pastSessions.length})
          </TabsTrigger>
          <TabsTrigger value="cancelled" data-testid="tab-cancelled">
            Cancelled ({cancelledSessions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {isLoading ? (
            <>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-40 w-full" />
              ))}
            </>
          ) : upcomingSessions.length > 0 ? (
            upcomingSessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))
          ) : (
            <Card className="border-card-border">
              <CardContent className="p-12 text-center">
                <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="font-semibold text-lg text-foreground mb-2">No upcoming sessions</h3>
                <p className="text-muted-foreground">
                  You don't have any sessions scheduled. Book a session to get started!
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {isLoading ? (
            <>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-40 w-full" />
              ))}
            </>
          ) : pastSessions.length > 0 ? (
            pastSessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))
          ) : (
            <Card className="border-card-border">
              <CardContent className="p-12 text-center">
                <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="font-semibold text-lg text-foreground mb-2">No past sessions</h3>
                <p className="text-muted-foreground">
                  Your completed sessions will appear here
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-4">
          {isLoading ? (
            <>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-40 w-full" />
              ))}
            </>
          ) : cancelledSessions.length > 0 ? (
            cancelledSessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))
          ) : (
            <Card className="border-card-border">
              <CardContent className="p-12 text-center">
                <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="font-semibold text-lg text-foreground mb-2">No cancelled sessions</h3>
                <p className="text-muted-foreground">
                  You haven't cancelled any sessions
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
