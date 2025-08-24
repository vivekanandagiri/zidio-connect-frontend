import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Clock, 
  Download, 
  CheckCircle, 
  XCircle,
  MessageSquare,
  Loader2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { api, Application } from "@/lib/api";
import { toast } from "sonner";

interface ApplicationManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string | null;
  onStatusUpdate?: () => void;
}

export default function ApplicationManagementModal({ 
  isOpen, 
  onClose, 
  applicationId,
  onStatusUpdate 
}: ApplicationManagementModalProps) {
  const { user } = useAuth();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [interviewData, setInterviewData] = useState({
    date: "",
    time: "",
    location: "",
    type: "video" as const,
    notes: ""
  });

  useEffect(() => {
    if (isOpen && applicationId) {
      fetchApplication();
    }
  }, [isOpen, applicationId]);

  const fetchApplication = async () => {
    if (!applicationId) return;
    
    setLoading(true);
    try {
      const response = await api.getApplication(applicationId);
      setApplication(response.application);
      setNewStatus(response.application.status);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load application');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!application || !newStatus) return;

    setUpdating(true);
    try {
      await api.updateApplicationStatus(application._id, newStatus, statusNote.trim() || undefined);
      toast.success('Application status updated successfully');
      onStatusUpdate?.();
      fetchApplication(); // Refresh data
      setStatusNote("");
    } catch (error: any) {
      toast.error(error.message || 'Failed to update application status');
    } finally {
      setUpdating(false);
    }
  };

  const handleScheduleInterview = async () => {
    if (!application || !interviewData.date || !interviewData.time) {
      toast.error('Please fill in all interview details');
      return;
    }

    setUpdating(true);
    try {
      await api.scheduleInterview(application._id, interviewData);
      toast.success('Interview scheduled successfully');
      onStatusUpdate?.();
      fetchApplication(); // Refresh data
      setInterviewData({
        date: "",
        time: "",
        location: "",
        type: "video",
        notes: ""
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to schedule interview');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'under_review': return 'default';
      case 'interview': return 'default';
      case 'approved': return 'success';
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
      month: 'long',
      day: 'numeric'
    });
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

  if (!application) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Application Management</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Application Header */}
          <Card className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div>
                <h3 className="text-xl font-semibold">{application.job.title}</h3>
                <p className="text-muted-foreground">{application.job.company}</p>
                <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>Applied: {formatDate(application.createdAt)}</span>
                  </div>
                  <Badge variant={getStatusColor(application.status) as any}>
                    {getStatusLabel(application.status)}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>

          <Tabs defaultValue="candidate" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="candidate">Candidate Info</TabsTrigger>
              <TabsTrigger value="application">Application</TabsTrigger>
              <TabsTrigger value="status">Update Status</TabsTrigger>
              <TabsTrigger value="interview">Interview</TabsTrigger>
            </TabsList>

            {/* Candidate Information */}
            <TabsContent value="candidate" className="space-y-4">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Candidate Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{application.student.name}</p>
                        <p className="text-sm text-muted-foreground">Full Name</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{application.student.email}</p>
                        <p className="text-sm text-muted-foreground">Email Address</p>
                      </div>
                    </div>
                    {application.student.profile?.phone && (
                      <div className="flex items-center space-x-3">
                        <Phone className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{application.student.profile.phone}</p>
                          <p className="text-sm text-muted-foreground">Phone Number</p>
                        </div>
                      </div>
                    )}
                    {application.student.profile?.location && (
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{application.student.profile.location}</p>
                          <p className="text-sm text-muted-foreground">Location</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    {application.student.studentProfile?.university && (
                      <div>
                        <p className="font-medium">Education</p>
                        <p className="text-sm text-muted-foreground">
                          {application.student.studentProfile.degree} at {application.student.studentProfile.university}
                        </p>
                        {application.student.studentProfile.graduationYear && (
                          <p className="text-sm text-muted-foreground">
                            Graduating: {application.student.studentProfile.graduationYear}
                          </p>
                        )}
                      </div>
                    )}

                    {application.student.studentProfile?.skills && application.student.studentProfile.skills.length > 0 && (
                      <div>
                        <p className="font-medium mb-2">Skills</p>
                        <div className="flex flex-wrap gap-1">
                          {application.student.studentProfile.skills.map((skill, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {application.student.studentProfile?.resume && (
                      <div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(application.student.studentProfile?.resume, '_blank')}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download Resume
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Application Details */}
            <TabsContent value="application" className="space-y-4">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Application Details</h3>
                
                {application.coverLetter && (
                  <div className="mb-6">
                    <h4 className="font-medium mb-2">Cover Letter</h4>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="whitespace-pre-wrap text-sm">{application.coverLetter}</p>
                    </div>
                  </div>
                )}

                {application.answers && application.answers.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium mb-2">Additional Questions</h4>
                    <div className="space-y-3">
                      {application.answers.map((qa, index) => (
                        <div key={index} className="p-4 bg-muted rounded-lg">
                          <p className="font-medium text-sm mb-1">{qa.question}</p>
                          <p className="text-sm">{qa.answer}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-medium mb-2">Application Timeline</h4>
                  <div className="space-y-2">
                    {application.timeline.map((event, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{event.note}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(event.date)}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {getStatusLabel(event.status)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Status Update */}
            <TabsContent value="status" className="space-y-4">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Update Application Status</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>New Status</Label>
                    <Select value={newStatus} onValueChange={setNewStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="under_review">Under Review</SelectItem>
                        <SelectItem value="interview">Interview</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Note (Optional)</Label>
                    <Textarea
                      value={statusNote}
                      onChange={(e) => setStatusNote(e.target.value)}
                      placeholder="Add a note about this status change..."
                      rows={3}
                    />
                  </div>

                  <div className="flex space-x-2">
                    <Button 
                      onClick={handleStatusUpdate} 
                      disabled={updating || newStatus === application.status}
                    >
                      {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Update Status
                    </Button>
                    {newStatus === 'approved' && (
                      <Button variant="outline">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Send Offer
                      </Button>
                    )}
                    {newStatus === 'rejected' && (
                      <Button variant="outline">
                        <XCircle className="w-4 h-4 mr-2" />
                        Send Rejection
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Interview Scheduling */}
            <TabsContent value="interview" className="space-y-4">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Interview Management</h3>
                
                {application.interview?.scheduled && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">Interview Scheduled</h4>
                    <div className="text-sm text-green-700 space-y-1">
                      <p><strong>Date:</strong> {formatDate(application.interview.date!)}</p>
                      <p><strong>Time:</strong> {application.interview.time}</p>
                      <p><strong>Type:</strong> {application.interview.type}</p>
                      <p><strong>Location:</strong> {application.interview.location}</p>
                      {application.interview.notes && (
                        <p><strong>Notes:</strong> {application.interview.notes}</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Interview Date</Label>
                      <Input
                        type="date"
                        value={interviewData.date}
                        onChange={(e) => setInterviewData(prev => ({ ...prev, date: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Interview Time</Label>
                      <Input
                        type="time"
                        value={interviewData.time}
                        onChange={(e) => setInterviewData(prev => ({ ...prev, time: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Interview Type</Label>
                      <Select 
                        value={interviewData.type} 
                        onValueChange={(value: any) => setInterviewData(prev => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="phone">Phone Interview</SelectItem>
                          <SelectItem value="video">Video Interview</SelectItem>
                          <SelectItem value="in-person">In-Person Interview</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Location/Link</Label>
                      <Input
                        value={interviewData.location}
                        onChange={(e) => setInterviewData(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="Meeting room or video call link"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Interview Notes</Label>
                    <Textarea
                      value={interviewData.notes}
                      onChange={(e) => setInterviewData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Additional notes for the interview..."
                      rows={3}
                    />
                  </div>

                  <Button onClick={handleScheduleInterview} disabled={updating}>
                    {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Interview
                  </Button>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}