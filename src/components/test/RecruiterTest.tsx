import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function RecruiterTest() {
  const { user } = useAuth();
  const [testing, setTesting] = useState(false);

  const testJobCreation = async () => {
    if (!user || user.role !== 'recruiter') {
      toast.error('Please login as a recruiter to test job creation');
      return;
    }

    setTesting(true);
    try {
      const testJob = {
        title: "Test Frontend Developer",
        description: "This is a test job posting created to verify the system is working correctly.",
        company: user.recruiterProfile?.company || "Test Company",
        location: "Remote",
        jobType: "Full-time" as const,
        department: "Engineering",
        salary: {
          min: 60000,
          max: 80000,
          period: "year" as const
        },
        requirements: {
          skills: ["React", "TypeScript", "JavaScript"],
          experience: { min: 2, max: 5 },
          education: "Bachelor's degree in Computer Science or related field",
          other: ["Strong problem-solving skills", "Team player"]
        },
        benefits: ["Health insurance", "Remote work", "Professional development"],
        isRemote: true,
        isUrgent: false
      };

      await api.createJob(testJob);
      toast.success('Test job created successfully! Check the Jobs tab.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create test job');
    } finally {
      setTesting(false);
    }
  };

  if (!user || user.role !== 'recruiter') {
    return null;
  }

  return (
    <Card className="p-6 mb-6 border-dashed border-2 border-primary/20">
      <div className="text-center space-y-4">
        <h3 className="text-lg font-semibold text-primary">Recruiter Testing Panel</h3>
        <p className="text-sm text-muted-foreground">
          Test the job creation functionality to make sure everything is working correctly.
        </p>
        <Button 
          onClick={testJobCreation} 
          disabled={testing}
          variant="outline"
        >
          {testing ? 'Creating Test Job...' : 'Create Test Job'}
        </Button>
      </div>
    </Card>
  );
}