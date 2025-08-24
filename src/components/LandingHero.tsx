import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { User, Briefcase, UserCheck, ArrowRight, Star, TrendingUp } from "lucide-react";

interface LandingHeroProps {
  onRoleSelect: (role: 'student' | 'recruiter' | 'admin') => void;
}

export default function LandingHero({ onRoleSelect }: LandingHeroProps) {
  const features = [
    {
      icon: Star,
      title: "10,000+",
      subtitle: "Active Jobs"
    },
    {
      icon: TrendingUp,
      title: "95%",
      subtitle: "Success Rate"
    },
    {
      icon: User,
      title: "50,000+",
      subtitle: "Students"
    }
  ];

  const roleCards = [
    {
      role: 'student' as const,
      title: "Students",
      description: "Discover internships and job opportunities from top companies. Build your career with personalized recommendations.",
      icon: User,
      features: ["Browse Jobs", "Apply Instantly", "Track Applications", "Career Guidance"],
      gradient: "from-primary to-primary-light"
    },
    {
      role: 'recruiter' as const,
      title: "Recruiters",
      description: "Find talented students and professionals. Post jobs and manage applications with powerful recruitment tools.",
      icon: Briefcase,
      features: ["Post Jobs", "Review Applications", "Manage Candidates", "Analytics Dashboard"],
      gradient: "from-secondary to-secondary-light"
    },
    {
      role: 'admin' as const,
      title: "Administrators",
      description: "Manage the platform, oversee user activities, and maintain system integrity with comprehensive admin tools.",
      icon: UserCheck,
      features: ["User Management", "Content Moderation", "Analytics", "System Settings"],
      gradient: "from-success to-success-light"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden floating-particles">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-r from-secondary/30 to-primary/30 rounded-full blur-3xl animate-pulse" />

      <div className="container mx-auto px-4 py-20 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Connect Your
            <span className="block bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              Career Journey
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
            ZIDIO Connect bridges the gap between talented students and leading companies. 
            Start your professional journey today.
          </p>
          
          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mb-12">
            {features.map(({ icon: Icon, title, subtitle }, index) => (
              <div 
                key={index} 
                className="flex items-center space-x-3 text-white animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Icon className="w-8 h-8 text-white/80" />
                <div className="text-left">
                  <div className="text-2xl font-bold">{title}</div>
                  <div className="text-sm text-white/70">{subtitle}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {roleCards.map(({ role, title, description, icon: Icon, features, gradient }, index) => (
            <Card 
              key={role} 
              className="p-8 glass-card hover-lift animate-scale-in border-0 shadow-glass hover-glow"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="text-center mb-6">
                <div className={`w-16 h-16 bg-gradient-to-r ${gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-medium`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">{title}</h3>
                <p className="text-muted-foreground">{description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {features.map((feature, idx) => (
                  <li key={idx} className="flex items-center space-x-2 text-sm">
                    <ArrowRight className="w-4 h-4 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                onClick={() => onRoleSelect(role)}
                className="w-full bg-gradient-primary hover:opacity-90 text-white font-semibold py-3 shadow-glow transition-all duration-300 hover:shadow-glow hover:scale-105 animate-glow"
              >
                Enter {title} Portal
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16 animate-fade-in">
          <p className="text-white/80 text-lg">
            Join thousands of professionals building their careers through ZIDIO Connect
          </p>
        </div>
      </div>
    </div>
  );
}