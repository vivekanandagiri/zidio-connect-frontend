import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, File, X, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface ResumeUploadProps {
  onUploadSuccess?: (fileUrl: string) => void;
  currentResume?: string;
}

export default function ResumeUpload({ onUploadSuccess, currentResume }: ResumeUploadProps) {
  const { user, updateUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PDF, DOC, or DOCX file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const response = await api.uploadResume(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Update user profile with new resume URL
      if (user) {
        await updateUser({
          studentProfile: {
            ...user.studentProfile,
            resume: response.file.url
          }
        });
      }

      toast.success('Resume uploaded successfully!');
      onUploadSuccess?.(response.file.url);
      
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload resume');
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const removeResume = async () => {
    if (!user || !currentResume) return;

    try {
      await updateUser({
        studentProfile: {
          ...user.studentProfile,
          resume: undefined
        }
      });
      toast.success('Resume removed successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove resume');
    }
  };

  if (currentResume && !uploading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium">Resume uploaded</p>
              <p className="text-sm text-muted-foreground">Your resume is ready</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(currentResume, '_blank')}
            >
              <File className="w-4 h-4 mr-2" />
              View
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={openFileDialog}
            >
              Replace
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={removeResume}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {uploading ? (
          <div className="space-y-4">
            <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto">
              <Upload className="w-6 h-6 text-blue-600 animate-pulse" />
            </div>
            <div>
              <p className="font-medium">Uploading resume...</p>
              <Progress value={uploadProgress} className="mt-2" />
              <p className="text-sm text-muted-foreground mt-1">{uploadProgress}%</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-medium">Upload your resume</p>
              <p className="text-sm text-muted-foreground">
                Drag and drop your resume here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Supports PDF, DOC, DOCX (max 5MB)
              </p>
            </div>
            <Button onClick={openFileDialog} className="mt-4">
              <Upload className="w-4 h-4 mr-2" />
              Choose File
            </Button>
          </div>
        )}
      </div>

      {user?.role !== 'student' && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          <p className="text-sm text-amber-800">
            Resume upload is only available for student accounts
          </p>
        </div>
      )}
    </Card>
  );
}