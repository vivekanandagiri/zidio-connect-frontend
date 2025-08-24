import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJobCreated?: () => void;
}

export default function CreateJobModal({ isOpen, onClose, onJobCreated }: CreateJobModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [benefitInput, setBenefitInput] = useState("");
  const [otherRequirementInput, setOtherRequirementInput] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    company: user?.recruiterProfile?.company || "",
    location: "",
    jobType: "Full-time" as const,
    department: "",
    salary: {
      min: "",
      max: "",
      period: "year" as const
    },
    requirements: {
      skills: [] as string[],
      experience: {
        min: "",
        max: ""
      },
      education: "",
      other: [] as string[]
    },
    benefits: [] as string[],
    applicationDeadline: "",
    startDate: "",
    isRemote: false,
    isUrgent: false
  });

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.requirements.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        requirements: {
          ...prev.requirements,
          skills: [...prev.requirements.skills, skillInput.trim()]
        }
      }));
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      requirements: {
        ...prev.requirements,
        skills: prev.requirements.skills.filter(s => s !== skill)
      }
    }));
  };

  const addBenefit = () => {
    if (benefitInput.trim() && !formData.benefits.includes(benefitInput.trim())) {
      setFormData(prev => ({
        ...prev,
        benefits: [...prev.benefits, benefitInput.trim()]
      }));
      setBenefitInput("");
    }
  };

  const removeBenefit = (benefit: string) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.filter(b => b !== benefit)
    }));
  };

  const addOtherRequirement = () => {
    if (otherRequirementInput.trim() && !formData.requirements.other.includes(otherRequirementInput.trim())) {
      setFormData(prev => ({
        ...prev,
        requirements: {
          ...prev.requirements,
          other: [...prev.requirements.other, otherRequirementInput.trim()]
        }
      }));
      setOtherRequirementInput("");
    }
  };

  const removeOtherRequirement = (requirement: string) => {
    setFormData(prev => ({
      ...prev,
      requirements: {
        ...prev.requirements,
        other: prev.requirements.other.filter(r => r !== requirement)
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || user.role !== 'recruiter') {
      toast.error('Only recruiters can create job postings');
      return;
    }

    // Validation
    if (!formData.title.trim() || !formData.description.trim() || !formData.location.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const jobData = {
        ...formData,
        salary: {
          min: formData.salary.min ? parseInt(formData.salary.min) : undefined,
          max: formData.salary.max ? parseInt(formData.salary.max) : undefined,
          period: formData.salary.period
        },
        requirements: {
          ...formData.requirements,
          experience: {
            min: formData.requirements.experience.min ? parseInt(formData.requirements.experience.min) : undefined,
            max: formData.requirements.experience.max ? parseInt(formData.requirements.experience.max) : undefined
          }
        },
        applicationDeadline: formData.applicationDeadline ? new Date(formData.applicationDeadline).toISOString() : undefined,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined
      };

      await api.createJob(jobData);
      toast.success('Job posted successfully!');
      onJobCreated?.();
      onClose();
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        company: user?.recruiterProfile?.company || "",
        location: "",
        jobType: "Full-time",
        department: "",
        salary: { min: "", max: "", period: "year" },
        requirements: { skills: [], experience: { min: "", max: "" }, education: "", other: [] },
        benefits: [],
        applicationDeadline: "",
        startDate: "",
        isRemote: false,
        isUrgent: false
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to create job posting');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Job Posting</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g. Senior React Developer"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company *</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  placeholder="Company name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="e.g. San Francisco, CA"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  placeholder="e.g. Engineering"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jobType">Job Type</Label>
                <Select value={formData.jobType} onValueChange={(value) => handleInputChange('jobType', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Internship">Internship</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                    <SelectItem value="Remote">Remote</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Job Options</Label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.isRemote}
                      onChange={(e) => handleInputChange('isRemote', e.target.checked)}
                    />
                    <span>Remote Work</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.isUrgent}
                      onChange={(e) => handleInputChange('isUrgent', e.target.checked)}
                    />
                    <span>Urgent Hiring</span>
                  </label>
                </div>
              </div>
            </div>
          </Card>

          {/* Job Description */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Job Description</h3>
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the role, responsibilities, and what makes this opportunity exciting..."
                rows={6}
                required
              />
            </div>
          </Card>

          {/* Salary Information */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Salary Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salaryMin">Minimum Salary</Label>
                <Input
                  id="salaryMin"
                  type="number"
                  value={formData.salary.min}
                  onChange={(e) => handleInputChange('salary.min', e.target.value)}
                  placeholder="50000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salaryMax">Maximum Salary</Label>
                <Input
                  id="salaryMax"
                  type="number"
                  value={formData.salary.max}
                  onChange={(e) => handleInputChange('salary.max', e.target.value)}
                  placeholder="80000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salaryPeriod">Period</Label>
                <Select value={formData.salary.period} onValueChange={(value) => handleInputChange('salary.period', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hour">Per Hour</SelectItem>
                    <SelectItem value="month">Per Month</SelectItem>
                    <SelectItem value="year">Per Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Requirements */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Requirements</h3>
            <div className="space-y-4">
              {/* Skills */}
              <div className="space-y-2">
                <Label>Required Skills</Label>
                <div className="flex space-x-2">
                  <Input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    placeholder="Add a skill"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  />
                  <Button type="button" onClick={addSkill} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.requirements.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Experience */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expMin">Minimum Experience (years)</Label>
                  <Input
                    id="expMin"
                    type="number"
                    value={formData.requirements.experience.min}
                    onChange={(e) => handleInputChange('requirements.experience.min', e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expMax">Maximum Experience (years)</Label>
                  <Input
                    id="expMax"
                    type="number"
                    value={formData.requirements.experience.max}
                    onChange={(e) => handleInputChange('requirements.experience.max', e.target.value)}
                    placeholder="5"
                  />
                </div>
              </div>

              {/* Education */}
              <div className="space-y-2">
                <Label htmlFor="education">Education Requirements</Label>
                <Input
                  id="education"
                  value={formData.requirements.education}
                  onChange={(e) => handleInputChange('requirements.education', e.target.value)}
                  placeholder="e.g. Bachelor's degree in Computer Science or related field"
                />
              </div>

              {/* Other Requirements */}
              <div className="space-y-2">
                <Label>Additional Requirements</Label>
                <div className="flex space-x-2">
                  <Input
                    value={otherRequirementInput}
                    onChange={(e) => setOtherRequirementInput(e.target.value)}
                    placeholder="Add a requirement"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addOtherRequirement())}
                  />
                  <Button type="button" onClick={addOtherRequirement} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-1">
                  {formData.requirements.other.map((req, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="text-sm">{req}</span>
                      <button
                        type="button"
                        onClick={() => removeOtherRequirement(req)}
                        className="text-destructive hover:text-destructive/80"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Benefits */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Benefits</h3>
            <div className="space-y-2">
              <div className="flex space-x-2">
                <Input
                  value={benefitInput}
                  onChange={(e) => setBenefitInput(e.target.value)}
                  placeholder="Add a benefit"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                />
                <Button type="button" onClick={addBenefit} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-1">
                {formData.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm">{benefit}</span>
                    <button
                      type="button"
                      onClick={() => removeBenefit(benefit)}
                      className="text-destructive hover:text-destructive/80"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Important Dates */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Important Dates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="applicationDeadline">Application Deadline</Label>
                <Input
                  id="applicationDeadline"
                  type="date"
                  value={formData.applicationDeadline}
                  onChange={(e) => handleInputChange('applicationDeadline', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">Expected Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                />
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Post Job
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}