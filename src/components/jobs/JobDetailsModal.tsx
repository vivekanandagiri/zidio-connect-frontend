import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Building, 
  MapPin, 
  Clock, 
  DollarSign, 
  Calendar, 
  Users, 
  Eye,
  Heart,
  Share2,
  Loader2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { api, Job } from "@/lib/api";
import { toast } from "sonner";
import JobApplicationModal from "./JobApplicationModal";

interface JobDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string | null;
}

export default function JobDetailsModal({ isOpen, onClose, jobId }: JobDetailsModalProps) {
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(false);
  const [applicationModalOpen, setApplicationModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen && jobId) {
      fetchJobDetails();
    }
  }, [isOpen, jobId]);

  const fetchJobDetails = async () => {
    if (!jobId) return;
    
    setLoading(true);
    try {
      const response = await api.getJob(jobId);
      setJob(response.job);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load job details');
      onClose();
    } finally {
      setLoading(false);
    }
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleApply = () => {
    if (!user) {
      toast.error('Please login to apply for jobs');
      return;
    }
    if (user.role !== 'student') {
      toast.error('Only students can apply for jobs');
      return;
    }
    setApplicationModalOpen(true);
  };

  const handleBookmark = async () => {
    if (!job || !user) return;
    
    try {
      await api.bookmarkJob(job._id);
      toast.success('Job bookmarked!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to bookmark job');
    }
  };

  const handleShare = async () => {
    if (!job) return;
    
    try {
      await navigator.share({
        title: job.title,
        text: `Check out this job opportunity: ${job.title} at ${job.company}`,
        url: window.location.href
      });
    } catch (error) {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Job link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!job) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{job.title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Job Header */}
            <Card className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-4 text-muted-foreground">
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
                      <span>{job.jobType}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-green-600 text-lg">
                        {formatSalary(job.salary)}
                      </span>
                    </div>
                    <Badge variant={job.jobType === 'Internship' ? 'secondary' : 'default'}>
                      {job.jobType}
                    </Badge>
                    {job.isRemote && (
                      <Badge variant="outline">Remote</Badge>
                    )}
                    {job.isUrgent && (
                      <Badge variant="destructive">Urgent</Badge>
                    )}
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{job.applicationCount} applications</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>{job.viewCount} views</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Posted {formatDate(job.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-2">
                  {user?.role === 'student' && (
                    <Button onClick={handleApply} size="lg">
                      Apply Now
                    </Button>
                  )}
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={handleBookmark}>
                      <Heart className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleShare}>
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Job Description */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Job Description</h3>
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap">{job.description}</p>
              </div>
            </Card>

            {/* Requirements */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Requirements</h3>
              <div className="space-y-4">
                {job.requirements.skills.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Required Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {job.requirements.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {job.requirements.experience && (
                  <div>
                    <h4 className="font-medium mb-2">Experience</h4>
                    <p className="text-muted-foreground">
                      {job.requirements.experience.min && job.requirements.experience.max
                        ? `${job.requirements.experience.min} - ${job.requirements.experience.max} years`
                        : job.requirements.experience.min
                        ? `${job.requirements.experience.min}+ years`
                        : job.requirements.experience.max
                        ? `Up to ${job.requirements.experience.max} years`
                        : 'Experience level not specified'}
                    </p>
                  </div>
                )}

                {job.requirements.education && (
                  <div>
                    <h4 className="font-medium mb-2">Education</h4>
                    <p className="text-muted-foreground">{job.requirements.education}</p>
                  </div>
                )}

                {job.requirements.other && job.requirements.other.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Additional Requirements</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      {job.requirements.other.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>

            {/* Benefits */}
            {job.benefits && job.benefits.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Benefits</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {job.benefits.map((benefit, index) => (
                    <li key={index}>{benefit}</li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Important Dates */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Important Dates</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">Posted Date</p>
                  <p className="text-muted-foreground">{formatDate(job.createdAt)}</p>
                </div>
                {job.applicationDeadline && (
                  <div>
                    <p className="font-medium">Application Deadline</p>
                    <p className="text-muted-foreground">{formatDate(job.applicationDeadline)}</p>
                  </div>
                )}
                {job.startDate && (
                  <div>
                    <p className="font-medium">Expected Start Date</p>
                    <p className="text-muted-foreground">{formatDate(job.startDate)}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Company Info */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">About {job.company}</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Department:</span> {job.department}</p>
                {job.recruiter.recruiterProfile?.industry && (
                  <p><span className="font-medium">Industry:</span> {job.recruiter.recruiterProfile.industry}</p>
                )}
                {job.recruiter.recruiterProfile?.companySize && (
                  <p><span className="font-medium">Company Size:</span> {job.recruiter.recruiterProfile.companySize} employees</p>
                )}
                {job.recruiter.recruiterProfile?.companyDescription && (
                  <p className="mt-3">{job.recruiter.recruiterProfile.companyDescription}</p>
                )}
              </div>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      <JobApplicationModal
        isOpen={applicationModalOpen}
        onClose={() => setApplicationModalOpen(false)}
        job={job}
        onApplicationSubmit={() => {
          // Refresh job details to update application count
          fetchJobDetails();
        }}
      />
    </>
  );
}