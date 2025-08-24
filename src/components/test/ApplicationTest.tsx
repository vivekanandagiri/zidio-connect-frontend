import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message?: string;
}

export default function ApplicationTest() {
  const { user } = useAuth();
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const runTests = async () => {
    if (!user) {
      toast.error('Please login to run tests');
      return;
    }

    setTesting(true);
    setResults([]);

    const tests: TestResult[] = [
      { name: 'API Health Check', status: 'pending' },
      { name: 'User Authentication', status: 'pending' },
      { name: 'Jobs Fetching', status: 'pending' },
      { name: 'Applications Fetching', status: 'pending' },
    ];

    if (user.role === 'recruiter') {
      tests.push({ name: 'Job Creation', status: 'pending' });
      tests.push({ name: 'Recruiter Jobs', status: 'pending' });
    }

    if (user.role === 'student') {
      tests.push({ name: 'Resume Upload Test', status: 'pending' });
    }

    setResults([...tests]);

    // Test 1: API Health Check
    try {
      const response = await fetch('http://localhost:5000/api/health');
      const data = await response.json();
      if (data.status === 'OK') {
        updateTestResult('API Health Check', 'success', 'API is healthy');
      } else {
        updateTestResult('API Health Check', 'error', 'API health check failed');
      }
    } catch (error) {
      updateTestResult('API Health Check', 'error', 'Cannot connect to API');
    }

    // Test 2: User Authentication
    try {
      const response = await api.getCurrentUser();
      if (response.success && response.user) {
        updateTestResult('User Authentication', 'success', `Logged in as ${response.user.name}`);
      } else {
        updateTestResult('User Authentication', 'error', 'Authentication failed');
      }
    } catch (error: any) {
      updateTestResult('User Authentication', 'error', error.message);
    }

    // Test 3: Jobs Fetching
    try {
      const response = await api.getJobs({ limit: 5 });
      if (response.success && response.jobs) {
        updateTestResult('Jobs Fetching', 'success', `Found ${response.jobs.length} jobs`);
      } else {
        updateTestResult('Jobs Fetching', 'error', 'No jobs found');
      }
    } catch (error: any) {
      updateTestResult('Jobs Fetching', 'error', error.message);
    }

    // Test 4: Applications Fetching
    if (user.role === 'student') {
      try {
        const response = await api.getMyApplications({ limit: 5 });
        if (response.success) {
          updateTestResult('Applications Fetching', 'success', `Found ${response.applications?.length || 0} applications`);
        } else {
          updateTestResult('Applications Fetching', 'error', 'Failed to fetch applications');
        }
      } catch (error: any) {
        updateTestResult('Applications Fetching', 'error', error.message);
      }
    } else if (user.role === 'recruiter') {
      try {
        const response = await api.getReceivedApplications({ limit: 5 });
        if (response.success) {
          updateTestResult('Applications Fetching', 'success', `Found ${response.applications?.length || 0} applications`);
        } else {
          updateTestResult('Applications Fetching', 'error', 'Failed to fetch applications');
        }
      } catch (error: any) {
        updateTestResult('Applications Fetching', 'error', error.message);
      }
    }

    // Test 5: Job Creation (Recruiters only)
    if (user.role === 'recruiter') {
      try {
        const testJob = {
          title: "Test Job - " + Date.now(),
          description: "This is a test job created by the application test suite.",
          company: user.recruiterProfile?.company || "Test Company",
          location: "Remote",
          jobType: "Full-time" as const,
          department: "Testing",
          salary: { min: 50000, max: 70000, period: "year" as const },
          requirements: { skills: ["Testing"], experience: { min: 0, max: 2 }, education: "", other: [] },
          benefits: ["Test Benefits"],
          isRemote: true,
          isUrgent: false
        };

        const response = await api.createJob(testJob);
        if (response.success) {
          updateTestResult('Job Creation', 'success', 'Test job created successfully');
          // Clean up - delete the test job
          try {
            await api.deleteJob(response.job._id);
          } catch (e) {
            // Ignore cleanup errors
          }
        } else {
          updateTestResult('Job Creation', 'error', 'Failed to create test job');
        }
      } catch (error: any) {
        updateTestResult('Job Creation', 'error', error.message);
      }

      // Test 6: Recruiter Jobs
      try {
        const response = await api.getRecruiterJobs(user._id, { limit: 5 });
        if (response.success) {
          updateTestResult('Recruiter Jobs', 'success', `Found ${response.jobs?.length || 0} recruiter jobs`);
        } else {
          updateTestResult('Recruiter Jobs', 'error', 'Failed to fetch recruiter jobs');
        }
      } catch (error: any) {
        updateTestResult('Recruiter Jobs', 'error', error.message);
      }
    }

    // Test 7: Resume Upload Test (Students only)
    if (user.role === 'student') {
      if (user.studentProfile?.resume) {
        updateTestResult('Resume Upload Test', 'success', 'Resume already uploaded');
      } else {
        updateTestResult('Resume Upload Test', 'error', 'No resume uploaded - please upload a resume to test');
      }
    }

    setTesting(false);
  };

  const updateTestResult = (testName: string, status: 'success' | 'error', message?: string) => {
    setResults(prev => prev.map(test => 
      test.name === testName 
        ? { ...test, status, message }
        : test
    ));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending': return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'success';
      case 'error': return 'destructive';
      case 'pending': return 'warning';
      default: return 'secondary';
    }
  };

  if (!user) {
    return (
      <Card className="p-6 mb-6 border-dashed border-2 border-yellow-300">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
          <p className="text-yellow-800">Please login to run application tests</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 mb-6 border-dashed border-2 border-blue-300">
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-blue-800">Application Testing Panel</h3>
          <p className="text-sm text-blue-600">
            Test all application functionality for {user.role} role
          </p>
        </div>

        <div className="flex justify-center">
          <Button 
            onClick={runTests} 
            disabled={testing}
            variant="outline"
            className="border-blue-300"
          >
            {testing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {testing ? 'Running Tests...' : 'Run All Tests'}
          </Button>
        </div>

        {results.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Test Results:</h4>
            {results.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(result.status)}
                  <span className="text-sm font-medium">{result.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={getStatusColor(result.status) as any}>
                    {result.status}
                  </Badge>
                  {result.message && (
                    <span className="text-xs text-gray-600">{result.message}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-xs text-gray-500 text-center">
          This panel will be removed in production
        </div>
      </div>
    </Card>
  );
}

export { ApplicationTest };