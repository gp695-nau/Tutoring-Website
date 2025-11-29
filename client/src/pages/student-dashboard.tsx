import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, BookOpen, Clock, TrendingUp, ArrowRight, Video, PlayCircle, CreditCard, MessageSquare } from "lucide-react";
import { Link } from "wouter";
import type { TutoringSessionWithRelations } from "@shared/schema";
import { format } from "date-fns";

export default function StudentDashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  const { data: upcomingSessions, isLoading: sessionsLoading } = useQuery<TutoringSessionWithRelations[]>({
    queryKey: ["/api/sessions/upcoming"],
    enabled: isAuthenticated,
  });

  const { data: stats } = useQuery<{
    totalSessions: number;
    completedSessions: number;
    upcomingSessions: number;
  }>({
    queryKey: ["/api/sessions/stats"],
    enabled: isAuthenticated,
  });

  if (authLoading) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-primary to-primary/80 p-8 text-white">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="relative">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            Welcome back, {user?.firstName || "Student"}!
          </h1>
          <p className="text-primary-foreground/80 text-lg">
            Ready to continue your learning journey?
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="border-card-border" data-testid="card-total-sessions">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Sessions
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {sessionsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-3xl font-bold text-foreground" data-testid="text-total-sessions">
                  {stats?.totalSessions || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  All time
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-card-border" data-testid="card-completed-sessions">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed Sessions
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {sessionsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-3xl font-bold text-foreground" data-testid="text-completed-sessions">
                  {stats?.completedSessions || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Learning hours logged
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-card-border" data-testid="card-upcoming-sessions">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Upcoming Sessions
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {sessionsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-3xl font-bold text-foreground" data-testid="text-upcoming-sessions">
                  {stats?.upcomingSessions || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Scheduled ahead
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-5">
        <Card className="border-card-border hover-elevate" data-testid="card-quick-action-book">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
              <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg text-foreground">Book a Session</h3>
                <p className="text-sm text-muted-foreground">
                  Schedule your next learning session with an expert tutor
                </p>
                <Link href="/book-session">
                  <Button className="mt-2 w-full" data-testid="button-book-session">
                    Book Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-card-border hover-elevate" data-testid="card-quick-action-materials">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
              <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg text-foreground">Learning Materials</h3>
                <p className="text-sm text-muted-foreground">
                  Access study guides, notes, and resources
                </p>
                <Link href="/materials">
                  <Button className="mt-2 w-full" data-testid="button-view-materials">
                    Browse Materials
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-card-border hover-elevate" data-testid="card-quick-action-videos">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
              <div className="h-12 w-12 rounded-md bg-emerald-500/10 flex items-center justify-center">
                <PlayCircle className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg text-foreground">Lecture Videos</h3>
                <p className="text-sm text-muted-foreground">
                  Watch recorded lectures and tutorials
                </p>
                <Link href="/videos">
                  <Button className="mt-2 w-full" data-testid="button-view-videos">
                    Watch Videos
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-card-border hover-elevate" data-testid="card-quick-action-payments">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
              <div className="h-12 w-12 rounded-md bg-violet-500/10 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-violet-600" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg text-foreground">Payments</h3>
                <p className="text-sm text-muted-foreground">
                  Manage your session payments
                </p>
                <Link href="/payments">
                  <Button className="mt-2 w-full" data-testid="button-view-payments">
                    Make Payment
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-card-border hover-elevate" data-testid="card-quick-action-feedback">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
              <div className="h-12 w-12 rounded-md bg-amber-500/10 flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-amber-600" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg text-foreground">Feedback</h3>
                <p className="text-sm text-muted-foreground">
                  Share your thoughts and suggestions
                </p>
                <Link href="/feedback">
                  <Button className="mt-2 w-full" data-testid="button-view-feedback">
                    Give Feedback
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Sessions */}
      <Card className="border-card-border" data-testid="card-upcoming-sessions-list">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-display text-2xl">Upcoming Sessions</CardTitle>
            <Link href="/my-sessions">
              <Button variant="ghost" size="sm" data-testid="button-view-all-sessions">
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {sessionsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : upcomingSessions && upcomingSessions.length > 0 ? (
            <div className="space-y-3">
              {upcomingSessions.slice(0, 3).map((session) => (
                <div
                  key={session.id}
                  className="flex items-center gap-4 p-4 rounded-md border border-border hover-elevate"
                  data-testid={`session-card-${session.id}`}
                >
                  <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground truncate">
                      {session.subject}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      with {session.tutor.name}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-medium text-foreground">
                      {format(new Date(session.scheduledDate), "MMM d, yyyy")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(session.scheduledDate), "h:mm a")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground mb-4">No upcoming sessions scheduled</p>
              <Link href="/book-session">
                <Button data-testid="button-book-first-session">
                  Book Your First Session
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
