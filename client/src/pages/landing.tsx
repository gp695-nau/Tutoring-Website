import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { GraduationCap, Calendar, BookOpen, Award, ArrowRight, Shield, Users, Video, Star, CheckCircle } from "lucide-react";

import professorImg1 from "@assets/stock_images/professional_male_pr_81e546a5.jpg";
import professorImg2 from "@assets/stock_images/professional_female__acc4c11e.jpg";
import professorImg3 from "@assets/stock_images/professional_male_pr_cfe5304a.jpg";
import professorImg4 from "@assets/stock_images/professional_female__56a22deb.jpg";
import professorImg5 from "@assets/stock_images/professional_male_pr_22989faf.jpg";
import professorImg6 from "@assets/stock_images/professional_female__c27c1231.jpg";
import heroImage from "@assets/stock_images/online_education_stu_3d07c586.jpg";
import studyImage from "@assets/stock_images/online_education_stu_c1567fc2.jpg";
import booksImage from "@assets/stock_images/books_education_libr_591f4f9a.jpg";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-6 py-16 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                <Award className="h-4 w-4" />
                <span>Trusted by thousands of students worldwide</span>
              </div>
              
              <h1 className="font-display text-5xl md:text-6xl font-bold text-foreground leading-tight">
                Learn from Expert{" "}
                <span className="text-primary">Tutors</span>
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                Connect with qualified tutors, schedule personalized sessions, and access curated learning materials—all in one platform.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="text-lg"
                  onClick={() => window.location.href = "/login"}
                  data-testid="button-get-started"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg"
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  data-testid="button-learn-more"
                >
                  Learn More
                </Button>
              </div>

              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-3">
                  <Avatar className="h-10 w-10 border-2 border-background ring-2 ring-primary/20">
                    <AvatarImage src={professorImg1} className="object-cover" />
                    <AvatarFallback>P1</AvatarFallback>
                  </Avatar>
                  <Avatar className="h-10 w-10 border-2 border-background ring-2 ring-primary/20">
                    <AvatarImage src={professorImg2} className="object-cover" />
                    <AvatarFallback>P2</AvatarFallback>
                  </Avatar>
                  <Avatar className="h-10 w-10 border-2 border-background ring-2 ring-primary/20">
                    <AvatarImage src={professorImg3} className="object-cover" />
                    <AvatarFallback>P3</AvatarFallback>
                  </Avatar>
                  <Avatar className="h-10 w-10 border-2 border-background ring-2 ring-primary/20">
                    <AvatarImage src={professorImg4} className="object-cover" />
                    <AvatarFallback>P4</AvatarFallback>
                  </Avatar>
                </div>
                <div className="text-sm">
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                  </div>
                  <span className="text-muted-foreground">50+ Expert Tutors</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={heroImage}
                  alt="Student learning online"
                  className="w-full h-auto object-cover max-h-[400px] md:max-h-[500px]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              <div className="absolute -bottom-4 left-4 md:-bottom-6 md:-left-6 bg-white dark:bg-card rounded-xl shadow-lg p-3 md:p-4 flex items-center gap-3">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm md:text-base">1000+ Sessions</p>
                  <p className="text-xs md:text-sm text-muted-foreground">Completed this month</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Login Options Section */}
      <div className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-foreground mb-4">
              Choose Your Portal
            </h2>
            <p className="text-lg text-muted-foreground">
              Select your role to access the appropriate dashboard
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6 max-w-3xl mx-auto">
            <Card className="flex-1 border-card-border p-6 hover-elevate">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-14 w-14 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="h-7 w-7 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-xl text-foreground">Student Portal</h3>
                  <p className="text-sm text-muted-foreground">Book sessions & access materials</p>
                </div>
              </div>
              <ul className="space-y-3 mb-6 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Book 1-on-1 tutoring sessions
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Access learning materials
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Watch lecture videos
                </li>
              </ul>
              <Button
                className="w-full"
                onClick={() => window.location.href = "/login"}
                data-testid="button-student-login"
              >
                Student Login
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Card>

            <Card className="flex-1 border-card-border p-6 bg-slate-50 dark:bg-slate-900/50 hover-elevate">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-14 w-14 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Shield className="h-7 w-7 text-amber-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-xl text-foreground">Admin Portal</h3>
                  <p className="text-sm text-muted-foreground">Manage platform & tutors</p>
                </div>
              </div>
              <ul className="space-y-3 mb-6 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-amber-600" />
                  Manage tutors and students
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-amber-600" />
                  Upload learning materials
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-amber-600" />
                  Monitor sessions and payments
                </li>
              </ul>
              <Button
                variant="outline"
                className="w-full border-amber-500/50 text-amber-700 dark:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                onClick={() => window.location.href = "/login"}
                data-testid="button-admin-login"
              >
                Admin Login
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Card>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl font-bold text-foreground mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our platform provides all the tools you need for effective online learning
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card className="border-card-border hover-elevate overflow-hidden" data-testid="card-feature-tutors">
            <div className="h-40 overflow-hidden">
              <img src={professorImg5} alt="Expert Tutor" className="w-full h-full object-cover" />
            </div>
            <CardContent className="p-6 space-y-4">
              <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center -mt-12 relative bg-background border border-border">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display text-2xl font-semibold text-foreground">
                Expert Tutors
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Learn from qualified tutors with proven expertise in their subjects. Each tutor is carefully vetted for quality.
              </p>
            </CardContent>
          </Card>

          <Card className="border-card-border hover-elevate overflow-hidden" data-testid="card-feature-scheduling">
            <div className="h-40 overflow-hidden">
              <img src={studyImage} alt="Easy Scheduling" className="w-full h-full object-cover" />
            </div>
            <CardContent className="p-6 space-y-4">
              <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center -mt-12 relative bg-background border border-border">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display text-2xl font-semibold text-foreground">
                Easy Scheduling
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Book sessions that fit your schedule. Our intuitive calendar makes it simple to find the perfect time slot.
              </p>
            </CardContent>
          </Card>

          <Card className="border-card-border hover-elevate overflow-hidden" data-testid="card-feature-materials">
            <div className="h-40 overflow-hidden">
              <img src={booksImage} alt="Learning Materials" className="w-full h-full object-cover" />
            </div>
            <CardContent className="p-6 space-y-4">
              <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center -mt-12 relative bg-background border border-border">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display text-2xl font-semibold text-foreground">
                Learning Materials
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Access a rich library of study materials, resources, and guides to supplement your learning journey.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-card-border hover-elevate mt-6 max-w-6xl mx-auto" data-testid="card-feature-videos">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="h-16 w-16 rounded-md bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                <Video className="h-8 w-8 text-emerald-600" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="font-display text-2xl font-semibold text-foreground mb-2">
                  Lecture Videos
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Watch recorded lectures and tutorials from expert professors. Learn at your own pace with high-quality video content available anytime, anywhere.
                </p>
              </div>
              <Button
                onClick={() => window.location.href = "/login"}
                className="flex-shrink-0"
                data-testid="button-start-watching"
              >
                Start Watching
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tutors Showcase */}
      <div className="bg-muted/30 py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl font-bold text-foreground mb-4">
              Meet Our Expert Tutors
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our tutors are industry professionals and academics dedicated to your success
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 max-w-5xl mx-auto">
            {[professorImg1, professorImg2, professorImg3, professorImg4, professorImg5, professorImg6].map((img, i) => (
              <div key={i} className="text-center">
                <Avatar className="h-24 w-24 mx-auto mb-3 ring-4 ring-primary/10">
                  <AvatarImage src={img} className="object-cover" />
                  <AvatarFallback>T{i+1}</AvatarFallback>
                </Avatar>
                <p className="text-sm font-medium text-foreground">Expert Tutor</p>
                <p className="text-xs text-muted-foreground">Mathematics</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-primary to-primary/80 py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="font-display text-4xl font-bold text-white">
              Ready to Start Learning?
            </h2>
            <p className="text-lg text-primary-foreground/80">
              Join thousands of students who are already achieving their academic goals with TutorHub
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="text-lg px-8"
              onClick={() => window.location.href = "/login"}
              data-testid="button-login-cta"
            >
              Sign In to Continue
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
