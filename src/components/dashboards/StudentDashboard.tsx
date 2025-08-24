import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, MapPin, Clock, Building, Heart, Eye, Filter, BookmarkIcon, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { api, Job, Application } from "@/lib/api";
import { toast } from "sonner";
import JobDetailsModal from "@/components/jobs/JobDetailsModal";
import JobApplicationModal from "@/components/jobs/JobApplicationModal";
import ResumeUpload from "@/components/upload/ResumeUpload";
import { ApplicationTest } from "@/components/test/ApplicationTest";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [applicationsLoading, setApplicationsLoading] = useState(true);
  const [bookmarkedJobs, setBookmarkedJobs] = useState(new Set<string>());
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [jobDetailsModalOpen, setJobDetailsModalOpen] = useState(false);
  const [applicationModalOpen, setApplicationModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  useEffect(() => {
    fetchJobs();
    fetchApplications();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await api.getJobs({ 
        limit: 10,
        ...(searchTerm && { q: searchTerm })
      });
      setJobs(response.jobs || []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const response = await api.getMyApplications({ limit: 10 });
      setApplications(response.applications || []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load applications');
    } finally {
      setApplicationsLoading(false);
    }
  };

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchTerm !== "") {
        fetchJobs();
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm]);

  const toggleBookmark = async (jobId: string) => {
    try {
      await api.bookmarkJob(jobId);
      const newBookmarked = new Set(bookmarkedJobs);
      if (newBookmarked.has(jobId)) {
        newBookmarked.delete(jobId);
        toast.success('Job removed from bookmarks');
      } else {
        newBookmarked.add(jobId);
        toast.success('Job bookmarked!');
      }
      setBookmarkedJobs(newBookmarked);
    } catch (error: any) {
      toast.error(error.message || 'Failed to bookmark job');
    }
  };

  const handleJobDetails = (jobId: string) => {
    setSelectedJobId(jobId);
    setJobDetailsModalOpen(true);
  };

  const handleApplyNow = (job: Job) => {
    if (!user) {
      toast.error('Please login to apply for jobs');
      return;
    }
    setSelectedJob(job);
    setApplicationModalOpen(true);
  };

  const formatSalary = (salary: Job['salary']) => {
    if (!salary || (!salary.min && !salary.max)) return 'Salary not specified';
    
    const formatAmount = (amount: number) => {
      if (salary.period === 'hour') return `$${amount}/hr`;
      if (salary.period === 'month') return `$${amount.toLocaleString()}/mo`;
      return `$${amount.toLocaleString()}/yr`;
    };

    if (salary.min && salary.max) {
      return `${formatAmount(salary.min)} - ${formatAmount(salary.max)}`;
    }
    return formatAmount(salary.min || salary.max || 0);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'under_review': return 'warning';
      case 'interview': return 'success';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'under_review': return 'Under Review';
      case 'interview': return 'Interview Scheduled';
      case 'rejected': return 'Not Selected';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        {/* Testing Panel - Remove in production */}
        {import.meta.env.DEV && <ApplicationTest />}

        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {user?.name || 'Student'}!
          </h1>
          <p className="text-muted-foreground">Ready to find your next opportunity?</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 hover-lift glass-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Applications</p>
                <p className="text-2xl font-bold text-primary">
                  {applicationsLoading ? '...' : applications.length}
                </p>
              </div>
              <Eye className="w-8 h-8 text-primary opacity-50" />
            </div>
          </Card>
          <Card className="p-6 hover-lift">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Interviews</p>
                <p className="text-2xl font-bold text-success">
                  {applicationsLoading ? '...' : applications.filter(app => app.status === 'interview').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-success opacity-50" />
            </div>
          </Card>
          <Card className="p-6 hover-lift">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Bookmarks</p>
                <p className="text-2xl font-bold text-warning">{bookmarkedJobs.size}</p>
              </div>
              <BookmarkIcon className="w-8 h-8 text-warning opacity-50" />
            </div>
          </Card>
          <Card className="p-6 hover-lift">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Profile Views</p>
                <p className="text-2xl font-bold text-secondary">
                  {user?.profileViews || 0}
                </p>
              </div>
              <Heart className="w-8 h-8 text-secondary opacity-50" />
            </div>
          </Card>
        </div>

        <Tabs defaultValue="browse" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="browse">Browse Jobs</TabsTrigger>
            <TabsTrigger value="applications">My Applications</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            {/* Search and Filters */}
            <Card className="p-6 glass-card">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search jobs and internships..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button 
                  variant="outline" 
                  className="flex items-center space-x-2"
                  onClick={() => {
                    setSearchTerm("");
                    fetchJobs();
                  }}
                >
                  <Filter className="w-4 h-4" />
                  <span>Clear Filters</span>
                </Button>
              </div>
            </Card>

            {/* Job Listings */}
            <div className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : jobs.length === 0 ? (
                <Card className="p-12 text-center">
                  <p className="text-muted-foreground">No jobs found. Try adjusting your search criteria.</p>
                </Card>
              ) : (
                jobs.map((job) => (
                  <Card key={job._id} className="p-6 hover-lift glass-card hover-glow">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-xl font-semibold text-foreground">{job.title}</h3>
                            <div className="flex items-center space-x-4 text-muted-foreground mt-1">
                              <div className="flex items-center space-x-1">
                                <Building className="w-4 h-4" />
                                <span>{job.company}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <MapPin className="w-4 h-4" />
                                <span>{job.location}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>{formatDate(job.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleBookmark(job._id)}
                          >
                            <Heart
                              className={`w-5 h-5 ${
                                bookmarkedJobs.has(job._id)
                                  ? 'fill-red-500 text-red-500'
                                  : 'text-muted-foreground'
                              }`}
                            />
                          </Button>
                        </div>
                        
                        <p className="text-muted-foreground mb-3 line-clamp-2">{job.description}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          {job.requirements.skills.slice(0, 4).map((skill, index) => (
                            <Badge key={index} variant="secondary">
                              {skill}
                            </Badge>
                          ))}
                          {job.requirements.skills.length > 4 && (
                            <Badge variant="outline">
                              +{job.requirements.skills.length - 4} more
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Badge variant={job.jobType === 'Internship' ? 'secondary' : 'default'}>
                              {job.jobType}
                            </Badge>
                            <span className="font-semibold text-primary">{formatSalary(job.salary)}</span>
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleJobDetails(job._id)}
                            >
                              View Details
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => handleApplyNow(job)}
                            >
                              Apply Now
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            <Card className="p-6 glass-card">
              <h2 className="text-2xl font-semibold mb-6">My Applications</h2>
              <div className="space-y-4">
                {applicationsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : applications.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No applications yet. Start applying to jobs!</p>
                  </div>
                ) : (
                  applications.map((app) => (
                    <div key={app._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{app.job.title}</h3>
                        <p className="text-muted-foreground">{app.job.company}</p>
                        <p className="text-sm text-muted-foreground">
                          Applied: {formatDate(app.createdAt)}
                        </p>
                      </div>
                      <Badge variant={getStatusColor(app.status) as any}>
                        {getStatusLabel(app.status)}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card className="p-6 glass-card">
              <h2 className="text-2xl font-semibold mb-6">Profile Management</h2>
              <div className="space-y-6">
                <p className="text-muted-foreground">
                  Complete your profile to increase your chances of getting hired!
                </p>
                
                {/* Resume Upload Section */}
                <div className="space-y-3">
                  <h3 className="text-lg font-medium">Resume</h3>
                  <ResumeUpload 
                    currentResume={user?.studentProfile?.resume}
                    onUploadSuccess={() => {
                      toast.success('Resume uploaded successfully!');
                    }}
                  />
                </div>

                {/* Profile Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col"
                    onClick={() => toast.info('Skills management coming soon!')}
                  >
                    <span className="font-semibold">Add Skills</span>
                    <span className="text-sm text-muted-foreground">Showcase your abilities</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col"
                    onClick={() => toast.info('Education management coming soon!')}
                  >
                    <span className="font-semibold">Education History</span>
                    <span className="text-sm text-muted-foreground">Academic background</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col"
                    onClick={() => toast.info('Experience management coming soon!')}
                  >
                    <span className="font-semibold">Work Experience</span>
                    <span className="text-sm text-muted-foreground">Previous roles</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col"
                    onClick={() => toast.info('Projects management coming soon!')}
                  >
                    <span className="font-semibold">Projects</span>
                    <span className="text-sm text-muted-foreground">Showcase your work</span>
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <JobDetailsModal
        isOpen={jobDetailsModalOpen}
        onClose={() => setJobDetailsModalOpen(false)}
        jobId={selectedJobId}
      />

      <JobApplicationModal
        isOpen={applicationModalOpen}
        onClose={() => setApplicationModalOpen(false)}
        job={selectedJob}
        onApplicationSubmit={() => {
          fetchApplications(); // Refresh applications
          setApplicationModalOpen(false);
        }}
      />
    </div>
  );
}