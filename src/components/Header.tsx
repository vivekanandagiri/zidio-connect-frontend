import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, User, Briefcase, UserCheck, LogOut, Settings, Bell } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import AuthModal from "@/components/auth/AuthModal";

interface HeaderProps {
  onRoleSelect: (role: 'student' | 'recruiter' | 'admin') => void;
  currentRole?: 'student' | 'recruiter' | 'admin' | null;
}

export default function Header({ onRoleSelect, currentRole }: HeaderProps) {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');

  const handleAuthClick = (tab: 'login' | 'register') => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  const handleLogout = () => {
    logout();
    onRoleSelect('student'); // Reset to home
  };

  const roleButtons = [
    {
      role: 'student' as const,
      label: 'Student Portal',
      icon: User,
      description: 'Find internships and jobs'
    },
    {
      role: 'recruiter' as const,
      label: 'Recruiter Portal',
      icon: Briefcase,
      description: 'Post jobs and find talent'
    },
    ...(user?.role === 'admin' ? [{
      role: 'admin' as const,
      label: 'Admin Panel',
      icon: UserCheck,
      description: 'Manage the platform'
    }] : [])
  ];

  return (
    <header className="glass-nav sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow">
              <span className="text-primary-foreground font-bold text-lg">Z</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">ZIDIO Connect</h1>
              <p className="text-xs text-muted-foreground">Professional Network</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <nav className="flex items-center space-x-2">
              {roleButtons.map(({ role, label, icon: Icon }) => (
                <Button
                  key={role}
                  variant={currentRole === role ? "default" : "ghost"}
                  onClick={() => onRoleSelect(role)}
                  className="flex items-center space-x-2"
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </Button>
              ))}
            </nav>

            {/* User Actions */}
            {user ? (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-4 h-4" />
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.profile?.avatar} alt={user.name} />
                        <AvatarFallback>
                          {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{user.name}</p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" onClick={() => handleAuthClick('login')}>
                  Login
                </Button>
                <Button onClick={() => handleAuthClick('register')}>
                  Get Started
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Navigation */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col space-y-4 mt-8">
                <h2 className="text-lg font-semibold">Choose Portal</h2>
                {roleButtons.map(({ role, label, icon: Icon, description }) => (
                  <Button
                    key={role}
                    variant={currentRole === role ? "default" : "outline"}
                    onClick={() => {
                      onRoleSelect(role);
                      setIsOpen(false);
                    }}
                    className="flex items-start space-x-3 h-auto p-4 justify-start"
                  >
                    <Icon className="w-5 h-5 mt-0.5" />
                    <div className="text-left">
                      <div className="font-medium">{label}</div>
                      <div className="text-xs text-muted-foreground">{description}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)}
        defaultTab={authModalTab}
      />
    </header>
  );
}