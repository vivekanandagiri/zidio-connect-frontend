const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// User types
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'recruiter' | 'admin';
  status: 'active' | 'pending' | 'suspended';
  profile?: {
    phone?: string;
    location?: string;
    bio?: string;
    website?: string;
    linkedin?: string;
    github?: string;
    avatar?: string;
  };
  studentProfile?: {
    university?: string;
    degree?: string;
    graduationYear?: number;
    gpa?: number;
    skills?: string[];
    resume?: string;
    experience?: Array<{
      title: string;
      company: string;
      startDate: string;
      endDate?: string;
      description: string;
      current: boolean;
    }>;
    education?: Array<{
      institution: string;
      degree: string;
      field: string;
      startDate: string;
      endDate?: string;
      gpa?: number;
    }>;
    projects?: Array<{
      title: string;
      description: string;
      technologies: string[];
      url?: string;
      github?: string;
    }>;
  };
  recruiterProfile?: {
    company?: string;
    position?: string;
    companySize?: string;
    industry?: string;
    companyDescription?: string;
    companyWebsite?: string;
    verified?: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

// Job types
export interface Job {
  _id: string;
  title: string;
  description: string;
  company: string;
  recruiter: User;
  location: string;
  jobType: 'Full-time' | 'Part-time' | 'Internship' | 'Contract' | 'Remote';
  department: string;
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
    period?: 'hour' | 'month' | 'year';
  };
  requirements: {
    skills: string[];
    experience?: {
      min?: number;
      max?: number;
    };
    education?: string;
    other?: string[];
  };
  benefits?: string[];
  status: 'draft' | 'active' | 'paused' | 'closed' | 'pending' | 'approved' | 'rejected';
  applicationDeadline?: string;
  startDate?: string;
  isRemote: boolean;
  isUrgent: boolean;
  applicationCount: number;
  viewCount: number;
  bookmarkCount: number;
  tags: string[];
  flagged: boolean;
  flagReason?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

// Application types
export interface Application {
  _id: string;
  job: Job;
  student: User;
  recruiter: User;
  status: 'pending' | 'under_review' | 'interview' | 'approved' | 'rejected' | 'withdrawn';
  coverLetter?: string;
  resume?: {
    filename: string;
    originalName: string;
    path: string;
    size: number;
    mimetype: string;
  };
  answers?: Array<{
    question: string;
    answer: string;
  }>;
  notes?: {
    recruiter?: string;
    student?: string;
    admin?: string;
  };
  timeline: Array<{
    status: string;
    date: string;
    note: string;
    updatedBy?: string;
  }>;
  interview?: {
    scheduled: boolean;
    date?: string;
    time?: string;
    location?: string;
    type?: 'phone' | 'video' | 'in-person';
    notes?: string;
  };
  feedback?: {
    rating?: number;
    comments?: string;
    strengths?: string[];
    improvements?: string[];
  };
  createdAt: string;
  updatedAt: string;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // Auth methods
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  async register(userData: {
    name: string;
    email: string;
    password: string;
    role?: 'student' | 'recruiter';
  }) {
    return this.request<{ success: boolean; token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: { email: string; password: string }) {
    return this.request<{ success: boolean; token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getCurrentUser() {
    return this.request<{ success: boolean; user: User }>('/auth/me');
  }

  async logout() {
    return this.request<{ success: boolean; message: string }>('/auth/logout', {
      method: 'POST',
    });
  }

  // Job methods
  async getJobs(params?: {
    q?: string;
    location?: string;
    jobType?: string;
    company?: string;
    skills?: string;
    salaryMin?: number;
    salaryMax?: number;
    isRemote?: boolean;
    page?: number;
    limit?: number;
    sort?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    return this.request<PaginatedResponse<Job>>(`/jobs?${searchParams.toString()}`);
  }

  async getJob(id: string) {
    return this.request<{ success: boolean; job: Job }>(`/jobs/${id}`);
  }

  async createJob(jobData: Partial<Job>) {
    return this.request<{ success: boolean; job: Job; message: string }>('/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
  }

  async updateJob(id: string, jobData: Partial<Job>) {
    return this.request<{ success: boolean; job: Job; message: string }>(`/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(jobData),
    });
  }

  async deleteJob(id: string) {
    return this.request<{ success: boolean; message: string }>(`/jobs/${id}`, {
      method: 'DELETE',
    });
  }

  async getRecruiterJobs(recruiterId: string, params?: { page?: number; limit?: number; status?: string }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    return this.request<PaginatedResponse<Job>>(`/jobs/recruiter/${recruiterId}?${searchParams.toString()}`);
  }

  async bookmarkJob(jobId: string) {
    return this.request<{ success: boolean; message: string }>(`/jobs/${jobId}/bookmark`, {
      method: 'POST',
    });
  }

  // Application methods
  async applyForJob(applicationData: {
    jobId: string;
    coverLetter?: string;
    answers?: Array<{ question: string; answer: string }>;
  }) {
    return this.request<{ success: boolean; application: Application; message: string }>('/applications', {
      method: 'POST',
      body: JSON.stringify(applicationData),
    });
  }

  async getMyApplications(params?: { page?: number; limit?: number; status?: string }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    return this.request<PaginatedResponse<Application>>(`/applications/my?${searchParams.toString()}`);
  }

  async getReceivedApplications(params?: { page?: number; limit?: number; status?: string; jobId?: string }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    return this.request<PaginatedResponse<Application>>(`/applications/received?${searchParams.toString()}`);
  }

  async getApplication(id: string) {
    return this.request<{ success: boolean; application: Application }>(`/applications/${id}`);
  }

  async updateApplicationStatus(id: string, status: string, note?: string) {
    return this.request<{ success: boolean; application: Application; message: string }>(`/applications/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, note }),
    });
  }

  async scheduleInterview(id: string, interviewData: {
    date: string;
    time: string;
    location: string;
    type: 'phone' | 'video' | 'in-person';
    notes?: string;
  }) {
    return this.request<{ success: boolean; application: Application; message: string }>(`/applications/${id}/interview`, {
      method: 'PUT',
      body: JSON.stringify(interviewData),
    });
  }

  async withdrawApplication(id: string) {
    return this.request<{ success: boolean; message: string }>(`/applications/${id}/withdraw`, {
      method: 'PUT',
    });
  }

  // User methods
  async getUser(id: string) {
    return this.request<{ success: boolean; user: User }>(`/users/${id}`);
  }

  async updateUser(id: string, userData: Partial<User>) {
    return this.request<{ success: boolean; user: User; message: string }>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async searchUsers(params: {
    q?: string;
    skills?: string;
    location?: string;
    university?: string;
    graduationYear?: number;
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });
    
    return this.request<PaginatedResponse<User>>(`/users/search/profiles?${searchParams.toString()}`);
  }

  async getUserStats(id: string) {
    return this.request<{ success: boolean; stats: any }>(`/users/${id}/stats`);
  }

  // File upload methods
  async uploadResume(file: File) {
    const formData = new FormData();
    formData.append('resume', file);

    return this.request<{ success: boolean; file: any; message: string }>('/upload/resume', {
      method: 'POST',
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: formData,
    });
  }

  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('avatar', file);

    return this.request<{ success: boolean; file: any; user: User; message: string }>('/upload/avatar', {
      method: 'POST',
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: formData,
    });
  }

  // Admin methods
  async getAdminStats() {
    return this.request<{ success: boolean; stats: any }>('/admin/stats');
  }

  async getAdminUsers(params?: {
    role?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
    sort?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    return this.request<PaginatedResponse<User>>(`/admin/users?${searchParams.toString()}`);
  }

  async updateUserStatus(id: string, status: string) {
    return this.request<{ success: boolean; user: User; message: string }>(`/admin/users/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async getAdminJobs(params?: {
    status?: string;
    flagged?: boolean;
    search?: string;
    page?: number;
    limit?: number;
    sort?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    return this.request<PaginatedResponse<Job>>(`/admin/jobs?${searchParams.toString()}`);
  }

  async updateJobStatus(id: string, status: string, adminNotes?: string) {
    return this.request<{ success: boolean; job: Job; message: string }>(`/admin/jobs/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, adminNotes }),
    });
  }

  async flagJob(id: string, flagged: boolean, flagReason?: string) {
    return this.request<{ success: boolean; job: Job; message: string }>(`/admin/jobs/${id}/flag`, {
      method: 'PUT',
      body: JSON.stringify({ flagged, flagReason }),
    });
  }
}

export const api = new ApiClient(API_BASE_URL);
export default api;