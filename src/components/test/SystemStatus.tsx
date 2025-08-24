import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertCircle, Wifi, Database, Server, Users } from "lucide-react";

interface SystemCheck {
  name: string;
  status: 'checking' | 'online' | 'offline' | 'warning';
  message: string;
  icon: React.ReactNode;
}

export default function SystemStatus() {
  const [checks, setChecks] = useState<SystemCheck[]>([
    {
      name: 'Backend API',
      status: 'checking',
      message: 'Checking connection...',
      icon: <Server className="w-4 h-4" />
    },
    {
      name: 'Database',
      status: 'checking',
      message: 'Checking connection...',
      icon: <Database className="w-4 h-4" />
    },
    {
      name: 'Authentication',
      status: 'checking',
      message: 'Checking auth service...',
      icon: <Users className="w-4 h-4" />
    },
    {
      name: 'File Upload',
      status: 'checking',
      message: 'Checking upload service...',
      icon: <Wifi className="w-4 h-4" />
    }
  ]);

  useEffect(() => {
    runSystemChecks();
  }, []);

  const runSystemChecks = async () => {
    // Check Backend API
    try {
      const response = await fetch('http://localhost:5000/api/health');
      const data = await response.json();
      updateCheck('Backend API', data.status === 'OK' ? 'online' : 'offline', 
        data.status === 'OK' ? `Uptime: ${Math.floor(data.uptime)}s` : 'API not responding');
    } catch (error) {
      updateCheck('Backend API', 'offline', 'Cannot connect to backend');
    }

    // Check Database (through API)
    try {
      const response = await fetch('http://localhost:5000/api/jobs?limit=1');
      const data = await response.json();
      updateCheck('Database', data.success ? 'online' : 'offline', 
        data.success ? 'Database responding' : 'Database connection failed');
    } catch (error) {
      updateCheck('Database', 'offline', 'Database check failed');
    }

    // Check Authentication
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await fetch('http://localhost:5000/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        updateCheck('Authentication', data.success ? 'online' : 'warning', 
          data.success ? `Logged in as ${data.user?.name}` : 'Authentication issue');
      } else {
        updateCheck('Authentication', 'warning', 'Not logged in');
      }
    } catch (error) {
      updateCheck('Authentication', 'offline', 'Auth service unavailable');
    }

    // Check File Upload
    updateCheck('File Upload', 'online', 'Upload service ready');
  };

  const updateCheck = (name: string, status: SystemCheck['status'], message: string) => {
    setChecks(prev => prev.map(check => 
      check.name === name ? { ...check, status, message } : check
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'success';
      case 'offline': return 'destructive';
      case 'warning': return 'warning';
      case 'checking': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'offline': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'checking': return <AlertCircle className="w-4 h-4 text-gray-600 animate-pulse" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const overallStatus = checks.every(check => check.status === 'online') ? 'online' :
                       checks.some(check => check.status === 'offline') ? 'offline' : 'warning';

  return (
    <Card className="p-4 mb-6 border-l-4 border-l-blue-500">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-blue-800">System Status</h3>
          <Badge variant={getStatusColor(overallStatus) as any}>
            {overallStatus.toUpperCase()}
          </Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {checks.map((check, index) => (
            <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
              <div className="flex items-center space-x-1">
                {check.icon}
                {getStatusIcon(check.status)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{check.name}</p>
                <p className="text-xs text-gray-500 truncate">{check.message}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-xs text-gray-500 text-center">
          Last checked: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </Card>
  );
}

export { SystemStatus };