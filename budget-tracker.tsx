import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Clock, Users, Briefcase, Calendar, Play, Square, Timer, Loader2, Settings, FileText, AlertTriangle, CheckCircle, XCircle, Download, Edit, Save, X, TrendingUp, TrendingDown, BarChart3, PieChart, User, DollarSign, LogOut, Mail, Lock, Eye, EyeOff } from 'lucide-react';

// Supabase configuration
const SUPABASE_URL = 'https://atlnnhkgxshsncocpjzi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0bG5uaGtneHNoc25jb2NwanppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMjYwMzAsImV4cCI6MjA3MTcwMjAzMH0.o4ln7c731L8GcxupkHHjysqOzfMl0jIkLQF5ZM_iWtU';

// Simple Supabase Auth Client
const createSupabaseAuthClient = () => {
  let currentUser = null;
  let currentSession = null;

  return {
    auth: {
      signUp: async ({ email, password, options = {} }) => {
        try {
          const response = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
            method: 'POST',
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email,
              password,
              data: options.data || {}
            })
          });
          const data = await response.json();
          return { data: data.user ? { user: data.user, session: data.session } : null, error: data.error || (!response.ok ? data : null) };
        } catch (error) {
          return { data: null, error };
        }
      },

      signInWithPassword: async ({ email, password }) => {
        try {
          const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
            method: 'POST',
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
          });
          const data = await response.json();
          if (data.access_token) {
            currentUser = data.user;
            currentSession = { access_token: data.access_token, user: data.user };
            localStorage.setItem('supabase_session', JSON.stringify(currentSession));
          }
          return { data: data.access_token ? { user: data.user, session: currentSession } : null, error: data.error || (!response.ok ? data : null) };
        } catch (error) {
          return { data: null, error };
        }
      },

      signOut: async () => {
        try {
          currentUser = null;
          currentSession = null;
          localStorage.removeItem('supabase_session');
          return { error: null };
        } catch (error) {
          return { error };
        }
      },

      getSession: async () => {
        const stored = localStorage.getItem('supabase_session');
        if (stored) {
          currentSession = JSON.parse(stored);
          currentUser = currentSession?.user;
        }
        return { data: { session: currentSession }, error: null };
      },

      getUser: async () => {
        return { data: { user: currentUser }, error: null };
      },

      resetPasswordForEmail: async (email) => {
        try {
          const response = await fetch(`${SUPABASE_URL}/auth/v1/recover`, {
            method: 'POST',
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email })
          });
          const data = await response.json();
          return { data: response.ok ? {} : null, error: data.error || (!response.ok ? data : null) };
        } catch (error) {
          return { data: null, error };
        }
      }
    }
  };
};

const supabase = createSupabaseAuthClient();

const ProjectTimeTracker = () => {
  // Auth states
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authView, setAuthView] = useState('signin'); // 'signin', 'signup', 'forgot'
  const [authLoading, setAuthLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [authForm, setAuthForm] = useState({
    email: '',
    password: '',
    fullName: '',
    company: ''
  });

  // App states (same as before)
  const [projects, setProjects] = useState([]);
  const [personnel, setPersonnel] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [projectAssignments, setProjectAssignments] = useState([]);
  const [currentView, setCurrentView] = useState('overview');

  // Other states (keeping existing ones)
  const [activeTimer, setActiveTimer] = useState(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [newTimeEntry, setNewTimeEntry] = useState({
    projectId: '',
    personnelId: '',
    hours: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [newProject, setNewProject] = useState({
    name: '',
    client: '',
    description: '',
    budgetType: 'hours',
    budgetHours: '',
    budgetCost: '',
    initialHoursUsed: '',
    initialCostUsed: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    status: 'active',
    color: '#3B82F6',
    assignedPersonnel: []
  });
  const [newPersonnel, setNewPersonnel] = useState({
    name: '',
    role: '',
    rate: '',
    email: '',
    department: ''
  });
  const [showAddProject, setShowAddProject] = useState(false);
  const [showAddPersonnel, setShowAddPersonnel] = useState(false);
  const [showProjectSetup, setShowProjectSetup] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  // Check authentication on app load
  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await loadUserProfile(session.user.id);
        await loadData();
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async (userId) => {
    // In a real app, you'd fetch from user_profiles table
    // For now, we'll create a mock profile
    const mockProfile = {
      id: userId,
      email: user?.email,
      full_name: 'Demo User',
      role: user?.email === 'mmills@consulex.com' ? 'admin' : 'user',
      company: user?.email === 'mmills@consulex.com' ? 'Consulex' : 'Demo Company'
    };
    setUserProfile(mockProfile);
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setAuthLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: authForm.email,
        password: authForm.password,
      });

      if (error) {
        alert('Error signing in: ' + error.message);
      } else if (data.user) {
        setUser(data.user);
        await loadUserProfile(data.user.id);
        await loadData();
      }
    } catch (error) {
      alert('Error signing in: ' + error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setAuthLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: authForm.email,
        password: authForm.password,
        options: {
          data: {
            full_name: authForm.fullName,
            company: authForm.company
          }
        }
      });

      if (error) {
        alert('Error creating account: ' + error.message);
      } else {
        alert('Account created! Please check your email to verify your account before signing in.');
        setAuthView('signin');
      }
    } catch (error) {
      alert('Error creating account: ' + error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setAuthLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(authForm.email);
      if (error) {
        alert('Error sending reset email: ' + error.message);
      } else {
        alert('Password reset email sent! Check your inbox.');
        setAuthView('signin');
      }
    } catch (error) {
      alert('Error sending reset email: ' + error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUserProfile(null);
      setProjects([]);
      setPersonnel([]);
      setTimeEntries([]);
      setProjectAssignments([]);
      setCurrentView('overview');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Load sample data (same as before but filtered by organization)
  const loadSampleData = () => {
    const sampleProjects = [
      { 
        id: 1, 
        name: 'E-commerce Platform Redesign', 
        client: 'Acme Corp',
        description: 'Complete redesign of the e-commerce platform with modern UI/UX and mobile optimization',
        budget_type: 'both',
        budget_hours: 120, 
        budget_cost: 15000,
        initial_hours_used: 8,
        initial_cost_used: 800,
        start_date: '2024-01-15',
        end_date: '2024-03-15',
        color: '#10B981', 
        status: 'active' 
      },
      { 
        id: 2, 
        name: 'Mobile App Development', 
        client: 'TechStart Inc',
        description: 'Native iOS and Android app development for customer engagement platform',
        budget_type: 'cost',
        budget_hours: null,
        budget_cost: 25000,
        initial_hours_used: 15,
        initial_cost_used: 2500,
        start_date: '2024-02-01',
        end_date: '2024-05-01',
        color: '#3B82F6', 
        status: 'active' 
      },
      { 
        id: 3, 
        name: 'Database Migration', 
        client: 'Enterprise Solutions',
        description: 'Legacy database migration to cloud infrastructure with performance optimization',
        budget_type: 'hours',
        budget_hours: 80,
        budget_cost: null,
        initial_hours_used: 12,
        initial_cost_used: 0,
        start_date: '2024-01-01',
        end_date: '2024-02-15',
        color: '#8B5CF6', 
        status: 'active' 
      },
      { 
        id: 4, 
        name: 'Marketing Website', 
        client: 'StartupCo',
        description: 'Modern marketing website with CMS integration and SEO optimization',
        budget_type: 'both',
        budget_hours: 60,
        budget_cost: 8000,
        initial_hours_used: 45,
        initial_cost_used: 6200,
        start_date: '2023-12-01',
        end_date: '2024-01-31',
        color: '#F59E0B', 
        status: 'completed' 
      }
    ];

    const samplePersonnel = [
      { id: 1, name: 'John Smith', role: 'Senior Developer', rate: 85, email: 'john@company.com', department: 'Engineering' },
      { id: 2, name: 'Sarah Johnson', role: 'UI/UX Designer', rate: 75, email: 'sarah@company.com', department: 'Design' },
      { id: 3, name: 'Mike Wilson', role: 'Project Manager', rate: 95, email: 'mike@company.com', department: 'Management' },
      { id: 4, name: 'Lisa Chen', role: 'Junior Developer', rate: 60, email: 'lisa@company.com', department: 'Engineering' },
      { id: 5, name: 'Tom Anderson', role: 'QA Tester', rate: 55, email: 'tom@company.com', department: 'Quality Assurance' },
      { id: 6, name: 'Emma Davis', role: 'DevOps Engineer', rate: 90, email: 'emma@company.com', department: 'Engineering' }
    ];

    const sampleAssignments = [
      { id: 1, project_id: 1, personnel_id: 1, role: 'Lead Developer', hourly_rate: 85 },
      { id: 2, project_id: 1, personnel_id: 2, role: 'UI/UX Designer', hourly_rate: 75 },
      { id: 3, project_id: 1, personnel_id: 3, role: 'Project Manager', hourly_rate: 95 },
      { id: 4, project_id: 2, personnel_id: 1, role: 'Mobile Developer', hourly_rate: 90 },
      { id: 5, project_id: 2, personnel_id: 4, role: 'Junior Developer', hourly_rate: 65 },
      { id: 6, project_id: 3, personnel_id: 3, role: 'Migration Lead', hourly_rate: 95 },
      { id: 7, project_id: 3, personnel_id: 6, role: 'DevOps Engineer', hourly_rate: 90 },
      { id: 8, project_id: 4, personnel_id: 2, role: 'Designer', hourly_rate: 75 },
      { id: 9, project_id: 4, personnel_id: 4, role: 'Frontend Developer', hourly_rate: 60 }
    ];

    const sampleTimeEntries = [
      { id: 1, project_id: 1, personnel_id: 1, hours: 6.5, description: 'Frontend component development', date: '2024-08-24', created_at: '2024-08-24T09:00:00Z' },
      { id: 2, project_id: 1, personnel_id: 2, hours: 4.0, description: 'UI mockup revisions', date: '2024-08-24', created_at: '2024-08-24T10:00:00Z' },
      { id: 3, project_id: 2, personnel_id: 1, hours: 8.0, description: 'API integration', date: '2024-08-23', created_at: '2024-08-23T08:00:00Z' },
      { id: 4, project_id: 3, personnel_id: 6, hours: 5.5, description: 'Server configuration', date: '2024-08-23', created_at: '2024-08-23T14:00:00Z' },
      { id: 5, project_id: 1, personnel_id: 3, hours: 2.0, description: 'Client meeting and planning', date: '2024-08-22', created_at: '2024-08-22T11:00:00Z' },
      { id: 6, project_id: 2, personnel_id: 4, hours: 7.5, description: 'Mobile UI implementation', date: '2024-08-22', created_at: '2024-08-22T09:00:00Z' }
    ];

    setProjects(sampleProjects);
    setPersonnel(samplePersonnel);
    setProjectAssignments(sampleAssignments);
    setTimeEntries(sampleTimeEntries);
    setLoading(false);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      // In production, this would fetch data filtered by organization
      loadSampleData();
    } catch (error) {
      console.error('Error loading data:', error);
      loadSampleData();
    } finally {
      setLoading(false);
    }
  };

  // All the existing functions (timer, calculations, etc.) remain the same
  useEffect(() => {
    let interval = null;
    if (activeTimer) {
      interval = setInterval(() => {
        setTimerSeconds(seconds => seconds + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTimer]);

  const getProjectStats = () => {
    return projects.map(project => {
      const projectEntries = timeEntries.filter(entry => entry.project_id === project.id);
      const assignments = projectAssignments.filter(a => a.project_id === project.id);
      
      const actualHours = projectEntries.reduce((sum, entry) => sum + parseFloat(entry.hours || 0), 0);
      const totalHours = actualHours + (project.initial_hours_used || 0);
      
      const actualCost = projectEntries.reduce((sum, entry) => {
        const assignment = assignments.find(a => a.personnel_id === entry.personnel_id);
        const rate = assignment?.hourly_rate || personnel.find(p => p.id === entry.personnel_id)?.rate || 0;
        return sum + (parseFloat(entry.hours || 0) * rate);
      }, 0);
      const totalCost = actualCost + (project.initial_cost_used || 0);

      const hoursProgress = project.budget_hours ? (totalHours / project.budget_hours) * 100 : 0;
      const costProgress = project.budget_cost ? (totalCost / project.budget_cost) * 100 : 0;
      
      const hoursRemaining = project.budget_hours ? project.budget_hours - totalHours : null;
      const costRemaining = project.budget_cost ? project.budget_cost - totalCost : null;

      const daysElapsed = project.start_date ? Math.ceil((new Date() - new Date(project.start_date)) / (1000 * 60 * 60 * 24)) : 0;
      const totalProjectDays = project.end_date && project.start_date ? 
        Math.ceil((new Date(project.end_date) - new Date(project.start_date)) / (1000 * 60 * 60 * 24)) : 0;
      
      const timeProgress = totalProjectDays > 0 ? (daysElapsed / totalProjectDays) * 100 : 0;
      
      const dailyBurnRate = daysElapsed > 0 ? totalCost / daysElapsed : 0;
      const hourlyBurnRate = totalHours > 0 ? totalCost / totalHours : 0;
      
      const completionProgress = Math.max(hoursProgress, costProgress);
      const estimatedTotalDays = completionProgress > 0 ? (daysElapsed / completionProgress) * 100 : totalProjectDays;
      const estimatedCompletionDate = project.start_date && estimatedTotalDays ? 
        new Date(new Date(project.start_date).getTime() + estimatedTotalDays * 24 * 60 * 60 * 1000) : null;
      
      let healthStatus = 'healthy';
      const maxProgress = Math.max(hoursProgress, costProgress, timeProgress);
      if (project.status === 'completed') {
        healthStatus = 'completed';
      } else if (maxProgress > 90) {
        healthStatus = 'critical';
      } else if (maxProgress > 75) {
        healthStatus = 'warning';
      }

      return {
        ...project,
        budgetHours: project.budget_hours,
        budgetCost: project.budget_cost,
        totalHours,
        totalCost,
        actualHours,
        actualCost,
        hoursProgress,
        costProgress,
        timeProgress,
        hoursRemaining,
        costRemaining,
        healthStatus,
        assignedPersonnel: assignments.length,
        daysElapsed,
        totalProjectDays,
        dailyBurnRate,
        hourlyBurnRate,
        estimatedTotalDays,
        estimatedCompletionDate,
        assignments
      };
    });
  };

  const getAdvancedAnalytics = () => {
    const stats = getProjectStats();
    const activeProjects = stats.filter(p => p.status === 'active');
    
    const totalBudgetValue = stats.reduce((sum, p) => sum + (p.budgetCost || 0), 0);
    const totalSpentValue = stats.reduce((sum, p) => sum + p.totalCost, 0);
    const portfolioUtilization = totalBudgetValue > 0 ? (totalSpentValue / totalBudgetValue) * 100 : 0;
    
    const personnelUtilization = personnel.map(person => {
      const personEntries = timeEntries.filter(e => e.personnel_id === person.id);
      const totalHours = personEntries.reduce((sum, e) => sum + parseFloat(e.hours || 0), 0);
      const assignedProjects = projectAssignments.filter(a => a.personnel_id === person.id).length;
      const avgHourlyRate = projectAssignments
        .filter(a => a.personnel_id === person.id)
        .reduce((sum, a, _, arr) => sum + a.hourly_rate / arr.length, 0) || person.rate;
      
      return {
        ...person,
        totalHours,
        assignedProjects,
        avgHourlyRate,
        totalEarned: totalHours * avgHourlyRate,
        utilization: totalHours > 0 ? 'active' : 'idle'
      };
    });

    const departmentStats = [...new Set(personnel.map(p => p.department))].map(dept => {
      const deptPersonnel = personnel.filter(p => p.department === dept);
      const deptEntries = timeEntries.filter(e => 
        deptPersonnel.some(p => p.id === e.personnel_id)
      );
      const totalHours = deptEntries.reduce((sum, e) => sum + parseFloat(e.hours || 0), 0);
      const totalCost = deptEntries.reduce((sum, entry) => {
        const person = deptPersonnel.find(p => p.id === entry.personnel_id);
        const assignment = projectAssignments.find(a => 
          a.personnel_id === entry.personnel_id && a.project_id === entry.project_id
        );
        const rate = assignment?.hourly_rate || person?.rate || 0;
        return sum + (parseFloat(entry.hours || 0) * rate);
      }, 0);

      return {
        department: dept,
        personnel: deptPersonnel.length,
        totalHours,
        totalCost,
        avgRate: totalHours > 0 ? totalCost / totalHours : 0
      };
    });

    return {
      portfolioValue: totalBudgetValue,
      portfolioSpent: totalSpentValue,
      portfolioUtilization,
      activeProjectsCount: activeProjects.length,
      completedProjectsCount: stats.filter(p => p.status === 'completed').length,
      criticalProjectsCount: activeProjects.filter(p => p.healthStatus === 'critical').length,
      personnelUtilization,
      departmentStats,
      totalPersonnel: personnel.length,
      totalProjects: stats.length
    };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getHealthColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      case 'completed': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getHealthIcon = (status) => {
    switch (status) {
      case 'healthy': return <CheckCircle size={16} className="text-green-600" />;
      case 'warning': return <AlertTriangle size={16} className="text-yellow-600" />;