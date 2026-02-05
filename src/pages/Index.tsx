import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Calendar, MessageSquare } from "lucide-react";
import collegeLogo from "@/assets/college-logo.jpg";
import campusEntrance from "@/assets/campus-entrance.jpg";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/auth");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <img 
              src={collegeLogo} 
              alt="SCOE&M Logo" 
              className="h-12 w-12 rounded-full object-cover"
            />
            <div>
              <h1 className="text-lg font-bold text-primary">SCOE&M</h1>
              <p className="text-xs text-muted-foreground">Campus Connect</p>
            </div>
          </div>
          <Button onClick={handleGetStarted}>
            {user ? "Dashboard" : "Sign In"}
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={campusEntrance} 
            alt="Samarth Group Campus" 
            className="h-full w-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
        </div>
        
        <div className="container relative z-10 mx-auto px-4 py-20 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <img 
              src={collegeLogo} 
              alt="Samarth College of Engineering & Management" 
              className="mx-auto mb-8 h-32 w-32 rounded-full bg-white p-2 shadow-lg"
            />
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
              Samarth College of{" "}
              <span className="text-primary">Engineering & Management</span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground md:text-xl">
              Your digital campus hub for events, communities, and student life. 
              Stay connected with everything happening at SCOE&M.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" onClick={handleGetStarted} className="gap-2">
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/auth")}>
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">
            Everything You Need
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-xl border bg-card p-6 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Calendar className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Campus Events</h3>
              <p className="text-muted-foreground">
                Never miss an event. From sports to cultural fests, stay updated with all campus activities.
              </p>
            </div>
            <div className="rounded-xl border bg-card p-6 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Communities</h3>
              <p className="text-muted-foreground">
                Join clubs and communities that match your interests. Connect with like-minded peers.
              </p>
            </div>
            <div className="rounded-xl border bg-card p-6 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <MessageSquare className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Student Pulse</h3>
              <p className="text-muted-foreground">
                Share updates, thoughts, and connect with the entire campus community in real-time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Campus Image Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="overflow-hidden rounded-2xl shadow-2xl">
            <img 
              src={campusEntrance} 
              alt="Samarth Group Campus Entrance" 
              className="h-auto w-full object-cover"
            />
          </div>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Samarth Group of Institutions - Building Tomorrow's Leaders
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/50 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <img 
              src={collegeLogo} 
              alt="SCOE&M" 
              className="h-8 w-8 rounded-full"
            />
            <span className="font-semibold text-primary">SCOE&M Campus Connect</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Samarth College of Engineering & Management. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
