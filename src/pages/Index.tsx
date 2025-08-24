import { useState, useEffect } from "react";
import Header from "@/components/Header";
import LandingHero from "@/components/LandingHero";
import StudentDashboard from "@/components/dashboards/StudentDashboard";
import RecruiterDashboard from "@/components/dashboards/RecruiterDashboard";
import AdminDashboard from "@/components/dashboards/AdminDashboard";
import { useAuth } from "@/contexts/AuthContext";
import { SystemStatus } from "@/components/test/SystemStatus";

const Index = () => {
  const { user, loading } = useAuth();
  const [currentRole, setCurrentRole] = useState<'student' | 'recruiter' | 'admin' | null>(null);

  // Auto-select role based on user's role when logged in
  useEffect(() => {
    if (user && !currentRole) {
      setCurrentRole(user.role);
    }
  }, [user, currentRole]);

  const handleRoleSelect = (role: 'student' | 'recruiter' | 'admin') => {
    // Only allow role selection if user is logged in and has permission
    if (!user) {
      setCurrentRole(null); // Show landing page for non-authenticated users
      return;
    }
    
    // Admin can access all roles, others can only access their own role or go back to landing
    if (user.role === 'admin' || role === user.role || role === 'student') {
      setCurrentRole(role);
    }
  };

  const handleBackToHome = () => {
    setCurrentRole(null);
  };

  const renderDashboard = () => {
    // Show loading state
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      );
    }

    // If user is not logged in, show landing page
    if (!user) {
      return <LandingHero onRoleSelect={handleRoleSelect} />;
    }

    // Show appropriate dashboard based on current role
    switch (currentRole) {
      case 'student':
        return <StudentDashboard />;
      case 'recruiter':
        // Only show recruiter dashboard if user is recruiter or admin
        if (user.role === 'recruiter' || user.role === 'admin') {
          return <RecruiterDashboard />;
        }
        return <LandingHero onRoleSelect={handleRoleSelect} />;
      case 'admin':
        // Only show admin dashboard if user is admin
        if (user.role === 'admin') {
          return <AdminDashboard />;
        }
        return <LandingHero onRoleSelect={handleRoleSelect} />;
      default:
        return <LandingHero onRoleSelect={handleRoleSelect} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onRoleSelect={currentRole ? handleBackToHome : handleRoleSelect} 
        currentRole={currentRole} 
      />
      
      {/* System Status - Show only in development and when not logged in */}
      {import.meta.env.DEV && !user && (
        <div className="container mx-auto px-4 pt-4">
          <SystemStatus />
        </div>
      )}
      
      {renderDashboard()}
    </div>
  );
};

export default Index;