import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Building, MapPin, Clock, DollarSign } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { api, Job } from "@/lib/api";
import { toast } from "sonner";
import ResumeUpload from "@/components/upload/ResumeUpload";

interface JobApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job | null;
  onApplicationSubmit?: () => void;
}

export default function JobApplicationModal({ 
  isOpen, 
  onClose, 
  job, 
  onApplicationSubmit 
}: JobApplicationModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!job || !user) return;

    if (user.role !== 'student') {
      toast.error('Only students can apply for jobs');
      return;
    }

    setLoading(true);

    try {
      await api.applyForJob({
        jobId: job._id,
        coverLetter: coverLetter.trim() || undefined
      });

      toast.success('Application submitted successfully!');
      onApplicationSubmit?.();
      onClose();
      setCoverLetter("");
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  if (!job) return null;

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Apply for Position</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Job Summary */}
          <Card className="p-4">
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-semibold">{job.title}</h3>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
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
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-600">
                    {formatSalary(job.salary)}
                  </span>
                </div>
                <Badge variant={job.jobType === 'Internship' ? 'secondary' : 'default'}>
                  {job.jobType}
                </Badge>
              </div>

              {job.requirements.skills.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Required Skills:</p>
                  <div className="flex flex-wrap gap-1">
                    {job.requirements.skills.slice(0, 6).map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {job.requirements.skills.length > 6 && (
                      <Badge variant="outline" className="text-xs">
                        +{job.requirements.skills.length - 6} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Resume Section */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Resume</Label>
            <ResumeUpload 
              currentResume={user?.studentProfile?.resume}
            />
            {!user?.studentProfile?.resume && (
              <p className="text-sm text-muted-foreground">
                Please upload your resume before applying
              </p>
            )}
          </div>

          {/* Cover Letter */}
          <div className="space-y-3">
            <Label htmlFor="cover-letter" className="text-base font-medium">
              Cover Letter (Optional)
            </Label>
            <Textarea
              id="cover-letter"
              placeholder="Tell the employer why you're interested in this position and what makes you a great fit..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows={6}
              maxLength={2000}
            />
            <p className="text-xs text-muted-foreground text-right">
              {coverLetter.length}/2000 characters
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={loading || !user?.studentProfile?.resume}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Application
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}