import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Users, TrendingUp, Eye, CheckCircle, XCircle, Clock, Download, Loader2, Edit, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { api, Job, Application } from "@/lib/api";
import { toast } from "sonner";
import CreateJobModal from "@/components/jobs/CreateJobModal";
import ApplicationManagementModal from "@/components/applications/ApplicationManagementModal";
import { ApplicationTest } from "@/components/test/ApplicationTest";

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [applicationsLoading, setApplicationsLoading] = useState(true);
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalApplications: 0,
    interviewsScheduled: 0,
    hiredThisMonth: 0
  });
  
  const [createJobModalOpen, setCreateJobModalOpen] = useState(false);
  const [applicationModalOpen, setApplicationModalOpen] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role === 'recruiter') {
      fetchJobs();
      fetchApplications();
    }
  }, [user]);

  const fetchJobs = async () => {
    if (!user) return;
    
    try {
      const response = await api.getRecruiterJobs(user._id, { limit: 20 });
      setJobs(response.jobs || []);
      
      // Calculate stats
      const activeJobs = response.jobs?.filter(job => job.status === 'active').length || 0;
      setStats(prev => ({ ...prev, activeJobs }));
    } catch (error: any) {
      toast.error(error.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const response = await api.getReceivedApplications({ limit: 20 });
      setApplications(response.applications || []);
      
      // Calculate stats
      const totalApplications = response.applications?.length || 0;
      const interviewsScheduled = response.applications?.filter(app => app.status === 'interview').length || 0;
      const hiredThisMonth = response.applications?.filter(app => app.status === 'approved').length || 0;
      
      setStats(prev => ({
        ...prev,
        totalApplications,
        interviewsScheduled,
        hiredThisMonth
      }));
    } catch (error: any) {
      toast.error(error.message || 'Failed to load applications');
    } finally {
      setApplicationsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': 
      case 'approved': return 'success';
      case 'draft':
      case 'pending': return 'warning';
      case 'closed':
      case 'paused': return 'secondary';
      case 'interview': return 'default';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'under_review': return 'Under Review';
      case 'interview': return 'Interview Scheduled';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleViewApplication = (applicationId: string) => {
    setSelectedApplicationId(applicationId);
    setApplicationModalOpen(true);
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job posting?')) return;
    
    try {
      await api.deleteJob(jobId);
      toast.success('Job deleted successfully');
      fetchJobs();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete job');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        {/* Testing Panel - Remove in production */}
        {import.meta.env.DEV && <ApplicationTest />}

        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome, {user?.name || 'Recruiter'}!
            </h1>
            <p className="text-muted-foreground">Manage your job postings and find the best talent</p>
          </div>
          <Button 
            className="mt-4 md:mt-0"
            onClick={() => setCreateJobModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Post New Job
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 hover-lift glass-card hover-glow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Jobs</p>
                <p className="text-2xl font-bold text-success">
                  {loading ? '...' : stats.activeJobs}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-success opacity-50" />
            </div>
          </Card>
          <Card className="p-6 hover-lift glass-card hover-glow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Applications</p>
                <p className="text-2xl font-bold text-primary">
                  {applicationsLoading ? '...' : stats.totalApplications}
                </p>
              </div>
              <Users className="w-8 h-8 text-primary opacity-50" />
            </div>
          </Card>
          <Card className="p-6 hover-lift glass-card hover-glow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Interviews Scheduled</p>
                <p className="text-2xl font-bold text-warning">
                  {applicationsLoading ? '...' : stats.interviewsScheduled}
                </p>
              </div>
              <Clock className="w-8 h-8 text-warning opacity-50" />
            </div>
          </Card>
          <Card className="p-6 hover-lift glass-card hover-glow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Hired This Month</p>
                <p className="text-2xl font-bold text-success">
                  {applicationsLoading ? '...' : stats.hiredThisMonth}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-success opacity-50" />
            </div>
          </Card>
        </div>

        <Tabs defaultValue="jobs" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="jobs">Job Postings</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="space-y-6">
            <div className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : jobs.length === 0 ? (
                <Card className="p-12 text-center">
                  <p className="text-muted-foreground mb-4">No job postings yet.</p>
                  <Button onClick={() => setCreateJobModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Job
                  </Button>
                </Card>
              ) : (
                jobs.map((job) => (
                  <Card key={job._id} className="p-6 hover-lift glass-card hover-glow">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-semibold text-foreground">{job.title}</h3>
                          <Badge variant={getStatusColor(job.status) as any}>
                            {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                          </Badge>
                          {job.isUrgent && (
                            <Badge variant="destructive">Urgent</Badge>
                          )}
                          {job.isRemote && (
                            <Badge variant="outline">Remote</Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground mb-2">
                          {job.department} • Posted: {formatDate(job.createdAt)}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{job.applicationCount} applications</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Eye className="w-4 h-4" />
                            <span>{job.viewCount} views</span>
                          </div>
                          {job.applicationDeadline && (
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>Deadline: {formatDate(job.applicationDeadline)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => toast.info('Job details view coming soon!')}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => toast.info('Job editing coming soon!')}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteJob(job._id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            <div className="space-y-4">
              {applicationsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : applications.length === 0 ? (
                <Card className="p-12 text-center">
                  <p className="text-muted-foreground">No applications received yet.</p>
                </Card>
              ) : (
                applications.map((application) => (
                  <Card key={application._id} className="p-6 hover-lift glass-card hover-glow">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-foreground">
                            {application.student.name}
                          </h3>
                          <Badge variant={getStatusColor(application.status) as any}>
                            {getStatusLabel(application.status)}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-2">
                          {application.job.title} • {application.student.email}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                          <span>Applied: {formatDate(application.createdAt)}</span>
                          {application.student.studentProfile?.university && (
                            <span>From: {application.student.studentProfile.university}</span>
                          )}
                        </div>
                        {application.student.studentProfile?.skills && (
                          <div className="flex flex-wrap gap-2">
                            {application.student.studentProfile.skills.slice(0, 4).map((skill, index) => (
                              <Badge key={index} variant="secondary">
                                {skill}
                              </Badge>
                            ))}
                            {application.student.studentProfile.skills.length > 4 && (
                              <Badge variant="outline">
                                +{application.student.studentProfile.skills.length - 4} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        {application.student.studentProfile?.resume && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(application.student.studentProfile?.resume, '_blank')}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Resume
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewApplication(application._id)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Manage
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 glass-card">
                <h3 className="text-lg font-semibold mb-4">Application Trends</h3>
                <div className="h-48 flex items-center justify-center text-muted-foreground">
                  Chart placeholder - Applications over time
                </div>
              </Card>
              <Card className="p-6 glass-card">
                <h3 className="text-lg font-semibold mb-4">Top Skills in Applications</h3>
                <div className="h-48 flex items-center justify-center text-muted-foreground">
                  Chart placeholder - Most common skills
                </div>
              </Card>
              <Card className="p-6 glass-card">
                <h3 className="text-lg font-semibold mb-4">Hiring Funnel</h3>
                <div className="h-48 flex items-center justify-center text-muted-foreground">
                  Chart placeholder - Application to hire conversion
                </div>
              </Card>
              <Card className="p-6 glass-card">
                <h3 className="text-lg font-semibold mb-4">Time to Hire</h3>
                <div className="h-48 flex items-center justify-center text-muted-foreground">
                  Chart placeholder - Average time from application to hire
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <CreateJobModal
        isOpen={createJobModalOpen}
        onClose={() => setCreateJobModalOpen(false)}
        onJobCreated={() => {
          fetchJobs(); // Refresh jobs list
          setCreateJobModalOpen(false);
        }}
      />

      <ApplicationManagementModal
        isOpen={applicationModalOpen}
        onClose={() => setApplicationModalOpen(false)}
        applicationId={selectedApplicationId}
        onStatusUpdate={() => {
          fetchApplications(); // Refresh applications
        }}
      />
    </div>
  );
}