import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Users, Building, TrendingUp, AlertTriangle, CheckCircle, XCircle, Eye, Shield } from "lucide-react";

const mockUsers = [
  {
    id: 1,
    name: "John Smith",
    email: "john.smith@email.com",
    role: "student",
    status: "active",
    joinDate: "2024-01-15",
    lastLogin: "2024-01-20"
  },
  {
    id: 2,
    name: "Tech Corp Inc.",
    email: "hr@techcorp.com",
    role: "recruiter",
    status: "pending",
    joinDate: "2024-01-18",
    lastLogin: "Never"
  },
  {
    id: 3,
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    role: "student",
    status: "active",
    joinDate: "2024-01-10",
    lastLogin: "2024-01-19"
  },
  {
    id: 4,
    name: "Innovation Labs",
    email: "contact@innovationlabs.com",
    role: "recruiter",
    status: "suspended",
    joinDate: "2024-01-05",
    lastLogin: "2024-01-12"
  }
];

const mockJobListings = [
  {
    id: 1,
    title: "Frontend Developer Intern",
    company: "TechCorp Inc.",
    status: "approved",
    applications: 45,
    flagged: false,
    posted: "2024-01-15"
  },
  {
    id: 2,
    title: "Data Scientist Position",
    company: "AI Solutions",
    status: "pending",
    applications: 12,
    flagged: true,
    posted: "2024-01-18"
  },
  {
    id: 3,
    title: "Marketing Intern",
    company: "Creative Agency",
    status: "rejected",
    applications: 0,
    flagged: false,
    posted: "2024-01-17"
  }
];

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("overview");

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': 
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'suspended':
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  const handleUserAction = (userId: number, action: 'approve' | 'suspend' | 'activate') => {
    console.log(`User ${userId} ${action}`);
    // Handle user action logic here
  };

  const handleJobAction = (jobId: number, action: 'approve' | 'reject') => {
    console.log(`Job ${jobId} ${action}`);
    // Handle job action logic here
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Monitor and manage the ZIDIO Connect platform</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 hover-lift glass-card hover-glow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold text-primary">2,847</p>
                <p className="text-xs text-success">+12% this month</p>
              </div>
              <Users className="w-8 h-8 text-primary opacity-50" />
            </div>
          </Card>
          <Card className="p-6 hover-lift glass-card hover-glow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Companies</p>
                <p className="text-2xl font-bold text-success">156</p>
                <p className="text-xs text-success">+8% this month</p>
              </div>
              <Building className="w-8 h-8 text-success opacity-50" />
            </div>
          </Card>
          <Card className="p-6 hover-lift glass-card hover-glow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Job Postings</p>
                <p className="text-2xl font-bold text-warning">423</p>
                <p className="text-xs text-success">+15% this month</p>
              </div>
              <TrendingUp className="w-8 h-8 text-warning opacity-50" />
            </div>
          </Card>
          <Card className="p-6 hover-lift glass-card hover-glow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Reviews</p>
                <p className="text-2xl font-bold text-destructive">23</p>
                <p className="text-xs text-destructive">Needs attention</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-destructive opacity-50" />
            </div>
          </Card>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="jobs">Job Listings</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 glass-card">
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-success" />
                      <span className="text-sm">New user registered: Sarah Johnson</span>
                    </div>
                    <span className="text-xs text-muted-foreground">2h ago</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="w-5 h-5 text-warning" />
                      <span className="text-sm">Job posting flagged for review</span>
                    </div>
                    <span className="text-xs text-muted-foreground">4h ago</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Building className="w-5 h-5 text-primary" />
                      <span className="text-sm">New company registration: Tech Startup</span>
                    </div>
                    <span className="text-xs text-muted-foreground">6h ago</span>
                  </div>
                </div>
              </Card>

            <Card className="p-6 glass-card">
                <h3 className="text-lg font-semibold mb-4">System Health</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Server Status</span>
                    <Badge variant="default">Healthy</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Database Performance</span>
                    <Badge variant="default">Optimal</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">API Response Time</span>
                    <Badge variant="secondary">145ms</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Active Sessions</span>
                    <Badge variant="secondary">1,234</Badge>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card className="p-6 glass-card">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <h2 className="text-2xl font-semibold">User Management</h2>
                <div className="mt-4 md:mt-0 flex space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(user.status) as any}>
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.joinDate}</TableCell>
                      <TableCell>{user.lastLogin}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          {user.status === 'pending' && (
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => handleUserAction(user.id, 'approve')}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                        {user.status === 'active' && (
                          <Button 
                            variant="secondary" 
                            size="sm"
                            onClick={() => handleUserAction(user.id, 'suspend')}
                          >
                            <Shield className="w-4 h-4" />
                          </Button>
                        )}
                        {user.status === 'suspended' && (
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => handleUserAction(user.id, 'activate')}
                          >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="jobs" className="space-y-6">
              <Card className="p-6 glass-card">
              <h2 className="text-2xl font-semibold mb-6">Job Listing Management</h2>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Applications</TableHead>
                    <TableHead>Posted Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockJobListings.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{job.title}</span>
                          {job.flagged && (
                            <AlertTriangle className="w-4 h-4 text-destructive" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{job.company}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(job.status) as any}>
                          {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{job.applications}</TableCell>
                      <TableCell>{job.posted}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          {job.status === 'pending' && (
                            <>
                              <Button 
                                variant="default" 
                                size="sm"
                                onClick={() => handleJobAction(job.id, 'approve')}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleJobAction(job.id, 'reject')}
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 glass-card">
                <h3 className="text-lg font-semibold mb-4">User Growth</h3>
                <div className="h-48 flex items-center justify-center text-muted-foreground">
                  Chart placeholder - User registration over time
                </div>
              </Card>
              <Card className="p-6 glass-card">
                <h3 className="text-lg font-semibold mb-4">Job Posting Activity</h3>
                <div className="h-48 flex items-center justify-center text-muted-foreground">
                  Chart placeholder - Job postings per month
                </div>
              </Card>
              <Card className="p-6 glass-card">
                <h3 className="text-lg font-semibold mb-4">Application Success Rate</h3>
                <div className="h-48 flex items-center justify-center text-muted-foreground">
                  Chart placeholder - Application to hire ratio
                </div>
              </Card>
              <Card className="p-6 glass-card">
                <h3 className="text-lg font-semibold mb-4">Platform Revenue</h3>
                <div className="h-48 flex items-center justify-center text-muted-foreground">
                  Chart placeholder - Monthly revenue from subscriptions
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}