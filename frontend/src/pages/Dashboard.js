import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { policyAPI, aiAPI } from '../services/api';
import toast from 'react-hot-toast';
import { 
  Search, 
  Plus, 
  Download, 
  MessageSquare, 
  Eye, 
  Trash2, 
  FileText,
  BarChart3,
  Upload,
  RefreshCw,
  X,
  Bot,
  FileText as FileTextIcon,
  Calendar as CalendarIcon,
  Edit,
  Brain,
  Shield,
  Tag
} from 'lucide-react';

// Add ocean theme CSS animations
const oceanAnimationStyles = `
  @keyframes oceanWave {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
  
  @keyframes waveFlow {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
`;

// Inject styles
if (!document.getElementById('ocean-theme-styles')) {
  const style = document.createElement('style');
  style.id = 'ocean-theme-styles';
  style.textContent = oceanAnimationStyles;
  document.head.appendChild(style);
}

// Function to format policy summary text into structured sections
const formatPolicySummary = (summaryText) => {
  if (!summaryText || typeof summaryText !== 'string') {
    return <p className="text-gray-600">No summary available</p>;
  }

  // Clean the text from any formatting symbols and remove introductory text
  const cleanText = summaryText
    .replace(/[•◦▪▫★☆♦◆■□▲△▼▽]/g, '') // Remove bullet symbols
    .replace(/^\s*[*\-+•]\s*/gm, '') // Remove bullet prefixes at line start
    .replace(/#{1,6}\s*/g, '') // Remove markdown headers
    .replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1') // Remove bold/italic markdown
    .replace(/^\s*[*\-+]\s*/gm, '') // Remove list markers
    .replace(/\s*\*\s*/g, ' ') // Remove any remaining asterisks with spaces
    .replace(/\s*\+\s*/g, ' ') // Remove any remaining plus signs with spaces
    .replace(/\s*-\s*/g, ' ') // Remove any remaining minus signs with spaces
    .replace(/\s{2,}/g, ' ') // Replace multiple spaces with single space
    .replace(/^Here's a comprehensive and detailed analysis of the .* policy document:\s*/i, '') // Remove intro text
    .replace(/^.*comprehensive.*analysis.*document:\s*/i, '') // Remove any variation of intro text
    .trim();

  // Split the text into sections based on headers (both all caps and mixed case)
  const sections = cleanText.split(/(?=^[A-Z][A-Z\s:]+:?$|^[A-Z][a-z]+(?:\s+[A-Z][a-z]*)*:?$)/m);
  
  return sections.map((section, index) => {
    if (!section.trim()) return null;
    
    const lines = section.trim().split('\n');
    const header = lines[0].trim();
    const content = lines.slice(1).filter(line => line.trim()).join('\n');
    
    if (!content) return null;
    
    // Get color scheme based on section type
    const getColorScheme = (headerText) => {
      const text = headerText.toUpperCase();
      
      // Primary categories with light, sober colors
      if (text.includes('SUMMARY') || text.includes('OVERVIEW')) {
        return {
          container: 'border border-blue-200 bg-blue-25 shadow-sm',
          header: 'bg-blue-100 text-blue-800 font-semibold text-lg',
          bullet: 'bg-blue-300',
          text: 'text-blue-700'
        };
      }
      if (text.includes('COVERAGE') || text.includes('DETAILS')) {
        return {
          container: 'border border-green-200 bg-green-25 shadow-sm',
          header: 'bg-green-100 text-green-800 font-semibold text-lg',
          bullet: 'bg-green-300',
          text: 'text-green-700'
        };
      }
      if (text.includes('KEY DATES') || text.includes('DATES') || text.includes('VALIDITY') || text.includes('PERIOD')) {
        return {
          container: 'border border-purple-200 bg-purple-25 shadow-sm',
          header: 'bg-purple-100 text-purple-800 font-semibold text-lg',
          bullet: 'bg-purple-300',
          text: 'text-purple-700'
        };
      }
      if (text.includes('FINANCIAL') || text.includes('TERMS') || text.includes('PREMIUM') || text.includes('DEDUCTIBLE')) {
        return {
          container: 'border border-orange-200 bg-orange-25 shadow-sm',
          header: 'bg-orange-100 text-orange-800 font-semibold text-lg',
          bullet: 'bg-orange-300',
          text: 'text-orange-700'
        };
      }
      if (text.includes('POLICY TYPE') || text.includes('PROVIDER') || text.includes('INSURER')) {
        return {
          container: 'border border-indigo-200 bg-indigo-25 shadow-sm',
          header: 'bg-indigo-100 text-indigo-800 font-semibold text-lg',
          bullet: 'bg-indigo-300',
          text: 'text-indigo-700'
        };
      }
      if (text.includes('RISK') || text.includes('ASSESSMENT')) {
        return {
          container: 'border border-red-200 bg-red-25 shadow-sm',
          header: 'bg-red-100 text-red-800 font-semibold text-lg',
          bullet: 'bg-red-300',
          text: 'text-red-700'
        };
      }
      if (text.includes('TIPS') || text.includes('OPTIMIZATION')) {
        return {
          container: 'border border-amber-200 bg-amber-25 shadow-sm',
          header: 'bg-amber-100 text-amber-800 font-semibold text-lg',
          bullet: 'bg-amber-300',
          text: 'text-amber-700'
        };
      }
      if (text.includes('MARKET') || text.includes('COMPARISON')) {
        return {
          container: 'border border-teal-200 bg-teal-25 shadow-sm',
          header: 'bg-teal-100 text-teal-800 font-semibold text-lg',
          bullet: 'bg-teal-300',
          text: 'text-teal-700'
        };
      }
      
      // Specific subcategories with light, sober colors
      if (text.includes('CLAIM TIMELINES') || text.includes('CLAIM') || text.includes('TIMELINES')) {
        return {
          container: 'border border-pink-200 bg-pink-25 shadow-sm',
          header: 'bg-pink-100 text-pink-800 font-semibold text-lg',
          bullet: 'bg-pink-300',
          text: 'text-pink-700'
        };
      }
      if (text.includes('PLANNED HOSPITALIZATION') || text.includes('HOSPITALIZATION') || text.includes('PLANNED')) {
        return {
          container: 'border border-cyan-200 bg-cyan-25 shadow-sm',
          header: 'bg-cyan-100 text-cyan-800 font-semibold text-lg',
          bullet: 'bg-cyan-300',
          text: 'text-cyan-700'
        };
      }
      if (text.includes('EMERGENCY') || text.includes('URGENT')) {
        return {
          container: 'border border-rose-200 bg-rose-25 shadow-sm',
          header: 'bg-rose-100 text-rose-800 font-semibold text-lg',
          bullet: 'bg-rose-300',
          text: 'text-rose-700'
        };
      }
      if (text.includes('WAITING PERIODS') || text.includes('WAITING') || text.includes('PERIODS')) {
        return {
          container: 'border border-yellow-200 bg-yellow-25 shadow-sm',
          header: 'bg-yellow-100 text-yellow-800 font-semibold text-lg',
          bullet: 'bg-yellow-300',
          text: 'text-yellow-700'
        };
      }
      if (text.includes('EXCLUSIONS') || text.includes('NOT COVERED')) {
        return {
          container: 'border border-slate-200 bg-slate-25 shadow-sm',
          header: 'bg-slate-100 text-slate-800 font-semibold text-lg',
          bullet: 'bg-slate-300',
          text: 'text-slate-700'
        };
      }
      if (text.includes('WELLNESS') || text.includes('BENEFITS') || text.includes('PREVENTIVE')) {
        return {
          container: 'border border-emerald-200 bg-emerald-25 shadow-sm',
          header: 'bg-emerald-100 text-emerald-800 font-semibold text-lg',
          bullet: 'bg-emerald-300',
          text: 'text-emerald-700'
        };
      }
      if (text.includes('NETWORK') || text.includes('HOSPITALS') || text.includes('CASHLESS')) {
        return {
          container: 'border border-sky-200 bg-sky-25 shadow-sm',
          header: 'bg-sky-100 text-sky-800 font-semibold text-lg',
          bullet: 'bg-sky-300',
          text: 'text-sky-700'
        };
      }
      if (text.includes('BONUS') || text.includes('NO-CLAIM') || text.includes('REWARDS')) {
        return {
          container: 'border border-violet-200 bg-violet-25 shadow-sm',
          header: 'bg-violet-100 text-violet-800 font-semibold text-lg',
          bullet: 'bg-violet-300',
          text: 'text-violet-700'
        };
      }
      if (text.includes('PORTABILITY') || text.includes('RENEWAL') || text.includes('TRANSFER')) {
        return {
          container: 'border border-lime-200 bg-lime-25 shadow-sm',
          header: 'bg-lime-100 text-lime-800 font-semibold text-lg',
          bullet: 'bg-lime-300',
          text: 'text-lime-700'
        };
      }
      
      // Additional light, sober colors for any other categories
      const colorSchemes = [
        {
          container: 'border border-zinc-200 bg-zinc-25 shadow-sm',
          header: 'bg-zinc-100 text-zinc-800 font-semibold text-lg',
          bullet: 'bg-zinc-300',
          text: 'text-zinc-700'
        },
        {
          container: 'border border-stone-200 bg-stone-25 shadow-sm',
          header: 'bg-stone-100 text-stone-800 font-semibold text-lg',
          bullet: 'bg-stone-300',
          text: 'text-stone-700'
        },
        {
          container: 'border border-neutral-200 bg-neutral-25 shadow-sm',
          header: 'bg-neutral-100 text-neutral-800 font-semibold text-lg',
          bullet: 'bg-neutral-300',
          text: 'text-neutral-700'
        }
      ];
      
      // Use hash of header text to consistently assign colors
      const hash = headerText.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0);
      
      return colorSchemes[Math.abs(hash) % colorSchemes.length] || {
        container: 'border border-gray-200 bg-gray-25 shadow-sm',
        header: 'bg-gray-100 text-gray-800 font-semibold text-lg',
        bullet: 'bg-gray-300',
        text: 'text-gray-700'
      };
    };

    const colors = getColorScheme(header);

    // Process content to determine if it should be paragraph or bullet points
    const contentLines = content.split('\n').filter(line => line.trim());
    const cleanLines = contentLines.map(line => 
      line
        .replace(/^[\s*\-+•◦▪▫★☆♦◆■□▲△▼▽]+/, '') // Remove leading symbols
        .replace(/\s*\*\s*/g, ' ') // Remove any remaining asterisks
        .replace(/\s*\+\s*/g, ' ') // Remove any remaining plus signs
        .replace(/\s*-\s*/g, ' ') // Remove any remaining minus signs
        .replace(/\s{2,}/g, ' ') // Replace multiple spaces with single space
        .trim()
    );
    
    // If content is short paragraph-style, show as paragraph
    if (contentLines.length <= 2 && !contentLines.some(line => line.length < 100)) {
      return (
        <div key={index} className={`rounded-lg ${colors.container} overflow-hidden mb-4`}>
          <div className={`px-4 py-3 ${colors.header}`}>
            {header}
          </div>
          <div className="p-4">
            <p className={`${colors.text} leading-relaxed`}>{content}</p>
          </div>
        </div>
      );
    }
    
    // Otherwise, show as bullet points
    return (
      <div key={index} className={`rounded-lg ${colors.container} overflow-hidden mb-4`}>
        <div className={`px-4 py-3 ${colors.header}`}>
          {header}
        </div>
        <div className="p-4">
          <ul className="space-y-3">
            {cleanLines.map((point, pointIndex) => (
              <li key={pointIndex} className="flex items-start gap-3">
                <span className={`w-3 h-3 ${colors.bullet} rounded-full mt-1 flex-shrink-0`}></span>
                <span className={`${colors.text} leading-relaxed`}>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }).filter(Boolean);
};

const DashboardEnhanced = () => {
  const { user, requireAuth } = useAuth();
  const navigate = useNavigate();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showExtractionModal, setShowExtractionModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    name: '',
    provider: '',
    policy_type: '',
    file: null
  });
  const [editForm, setEditForm] = useState({
    id: null,
    name: '',
    provider: '',
    policy_type: ''
  });
  const [uploading, setUploading] = useState(false);
  const [extractedDetails, setExtractedDetails] = useState(null);
  const [extracting, setExtracting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [policies, setPolicies] = useState([]);
  const [, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [, setRefreshing] = useState(false);
  const [conversationCount, setConversationCount] = useState(0);

  // Fetch dashboard data function
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Validate authentication before fetching data
      if (!await requireAuth()) {
        return; // Will redirect to login if not authenticated
      }
      
      // Fetch policies
      const policiesResponse = await policyAPI.getPolicies();
      if (policiesResponse?.data?.results) {
        const policiesData = Array.isArray(policiesResponse.data.results) ? policiesResponse.data.results : [];
        setPolicies(policiesData);
        
        // Calculate total conversation count from policies
        const totalConversations = policiesData.reduce((total, policy) => {
          return total + (parseInt(policy.conversation_count) || 0);
        }, 0);
        setConversationCount(totalConversations);
      } else {
        setPolicies([]);
        setConversationCount(0);
      }
      
      // Fetch stats
      try {
        const statsResponse = await policyAPI.getPolicyStats();
        // stats variable removed as it was unused in JSX
        setStats(statsResponse?.data || {});
      } catch (statsError) {
        console.warn('Could not fetch stats:', statsError);
        setStats({});
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
      setPolicies([]);
      setConversationCount(0);
    } finally {
      setLoading(false);
    }
  }, [requireAuth]);

  // Filter and search policies
  const filteredPolicies = useMemo(() => {
    let filtered = policies || [];
    
    // Apply search filter
    if (searchTerm && searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(policy => 
        (policy.name && policy.name.toLowerCase().includes(searchLower)) ||
        (policy.provider && policy.provider.toLowerCase().includes(searchLower)) ||
        (policy.policy_type && policy.policy_type.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply type filter
    if (selectedFilter && selectedFilter !== 'all') {
      filtered = filtered.filter(policy => 
        policy.policy_type && policy.policy_type.toLowerCase() === selectedFilter.toLowerCase()
      );
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'name':
        filtered = [...filtered].sort((a, b) => {
          const nameA = (a.name || '').toLowerCase();
          const nameB = (b.name || '').toLowerCase();
          return nameA.localeCompare(nameB);
        });
        break;
      case 'size':
        filtered = [...filtered].sort((a, b) => {
          const sizeA = parseInt(a.file_size) || 0;
          const sizeB = parseInt(b.file_size) || 0;
          return sizeA - sizeB;
        });
        break;
      case 'recent':
      default:
        filtered = [...filtered].sort((a, b) => {
          const dateA = new Date(a.created_at || 0);
          const dateB = new Date(b.created_at || 0);
          return dateB - dateA;
        });
        break;
    }
    
    return filtered;
  }, [policies, searchTerm, selectedFilter, sortBy]);

  // Fetch data from backend
  useEffect(() => {
    fetchDashboardData();
    
    // Add focus event listener to refresh data when user returns to dashboard
    const handleFocus = () => {
      fetchDashboardData();
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [user, requireAuth, fetchDashboardData]);

  // Refresh dashboard data
  const refreshDashboardData = useCallback(async () => {
    try {
      setRefreshing(true);
      await fetchDashboardData();
      toast.success('Dashboard refreshed successfully!');
    } catch (error) {
      toast.error('Failed to refresh dashboard');
    } finally {
      setRefreshing(false);
    }
  }, [fetchDashboardData]);

  const handleRefreshDashboard = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchDashboardData();
      toast.success('Dashboard refreshed!');
    } catch (error) {
      toast.error('Failed to refresh dashboard');
    } finally {
      setRefreshing(false);
    }
  }, [fetchDashboardData]);

  const handleExtractPolicyDetails = useCallback(async (policyId) => {
    if (!policyId) {
      toast.error('Policy ID is required');
      return;
    }

    setExtracting(true);
    setShowExtractionModal(true);
    
    // Find the policy object to get provider information
    const currentPolicy = filteredPolicies.find(p => p.id === policyId);
    
    try {
      const response = await aiAPI.extractPolicyDetails(policyId);
      
      if (response) {
        // Add policy provider/company information to the response
        setExtractedDetails({
          ...response,
          provider: currentPolicy?.provider || 'Unknown Provider',
          policy_type: currentPolicy?.policy_type || 'Insurance'
        });
        toast.success('Policy analysis completed!');
      } else {
        toast.error('Failed to analyze policy');
      }
    } catch (error) {
      console.error('Error extracting policy details:', error);
      toast.error('Failed to analyze policy. Please try again.');
    } finally {
      setExtracting(false);
    }
  }, [filteredPolicies]);

  // Real user data - no mock data
  const userStats = [
    {
      title: 'Total Policies',
      value: (policies || []).length || '0',
      change: '+0%',
      trend: 'neutral',
      icon: FileText,
      color: 'from-primary-500 to-primary-600'
    },
    {
      title: 'AI Conversations',
      value: conversationCount.toString(),
      change: '+0%',
      trend: 'neutral',
      icon: MessageSquare,
      color: 'from-secondary-500 to-secondary-600'
    },
    {
      title: 'Files Uploaded',
      value: (policies || []).length || '0',
      change: '+0%',
      trend: 'neutral',
      icon: Upload,
      color: 'from-accent1-500 to-accent1-600'
    },
    {
      title: 'Storage Used',
      value: policies.length > 0 ? `${Math.round(policies.reduce((total, policy) => total + (parseInt(policy.file_size) || 0), 0) / 1024 / 1024 * 100) / 100} MB` : '0 MB',
      change: '+0%',
      trend: 'neutral',
      icon: BarChart3,
      color: 'from-accent2-500 to-accent2-600'
    }
  ];

  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please select a valid file (PDF, DOCX, or DOC)');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }

      setUploadForm(prev => ({ ...prev, file }));
      toast.success(`File "${file.name}" selected successfully!`);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please select a valid file (PDF, DOCX, or DOC)');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }

      setUploadForm(prev => ({ ...prev, file }));
      toast.success(`File "${file.name}" dropped successfully!`);
    }
  }, []);

  const handleUpload = useCallback(async () => {
    if (!uploadForm.name || !uploadForm.provider || !uploadForm.policy_type || !uploadForm.file) {
      toast.error('Please fill in all fields and select a file');
      return;
    }

    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('name', uploadForm.name);
      formData.append('provider', uploadForm.provider);
      formData.append('policy_type', uploadForm.policy_type);
      formData.append('document', uploadForm.file);
      
      const response = await policyAPI.uploadPolicy(formData);
      
      if (response.data) {
        toast.success('Policy uploaded successfully!');
        setShowUploadModal(false);
        setUploadForm({ name: '', provider: '', policy_type: '', file: null });
        
        // Refresh the policies list
        await fetchDashboardData();
      }
    } catch (error) {
      console.error('Upload error:', error);
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('Failed to upload policy. Please try again.');
      }
    } finally {
      setUploading(false);
    }
  }, [uploadForm, fetchDashboardData]);

  const resetUploadForm = useCallback(() => {
    setUploadForm({ name: '', provider: '', policy_type: '', file: null });
    setShowUploadModal(false);
  }, []);

  // Add delete policy function
  const handleDeletePolicy = useCallback(async (policyId, policyName) => {
    if (!policyId) {
      toast.error('Policy ID is required');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete "${policyName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await policyAPI.deletePolicy(policyId);
      
      if (response.status === 204 || response.status === 200) {
        toast.success(`Policy "${policyName}" deleted successfully!`);
        
        // Remove the deleted policy from the local state
        setPolicies(prevPolicies => prevPolicies.filter(policy => policy.id !== policyId));
        
        // Refresh dashboard data to update stats
        await fetchDashboardData();
      } else {
        toast.error('Failed to delete policy');
      }
    } catch (error) {
      
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else if (error.response?.status === 404) {
        toast.error('Policy not found or already deleted');
      } else if (error.response?.status === 403) {
        toast.error('You do not have permission to delete this policy');
      } else if (error.response?.status === 500) {
        toast.error('Server error. Please try again later');
      } else {
        toast.error(`Failed to delete policy: ${error.message || 'Unknown error'}`);
      }
    }
  }, [fetchDashboardData]);

  const handleDownloadPolicy = useCallback(async (policy) => {
    if (!policy.document) {
      toast.error('No document available for download');
      return;
    }

    try {
      // Create a download link for the document
      const link = document.createElement('a');
      link.href = policy.document;
      link.download = policy.name || 'policy-document';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Policy document download started!');
    } catch (error) {
      toast.error('Failed to download policy document');
    }
  }, []);

  const handleEditPolicy = useCallback((policy) => {
    setEditForm({
      id: policy.id,
      name: policy.name || '',
      provider: policy.provider || '',
      policy_type: policy.policy_type || ''
    });
    setShowEditModal(true);
  }, []);

  const handleUpdatePolicy = useCallback(async () => {
    if (!editForm.name || !editForm.provider || !editForm.policy_type) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const response = await policyAPI.updatePolicy(editForm.id, {
        name: editForm.name,
        provider: editForm.provider,
        policy_type: editForm.policy_type
      });

      if (response.data) {
        toast.success('Policy updated successfully!');
        setShowEditModal(false);
        setEditForm({ id: null, name: '', provider: '', policy_type: '' });
        
        // Update the policy in local state
        setPolicies(prevPolicies => 
          prevPolicies.map(policy => 
            policy.id === editForm.id 
              ? { ...policy, name: editForm.name, provider: editForm.provider, policy_type: editForm.policy_type }
              : policy
          )
        );
        
        // Refresh conversation count
        await refreshDashboardData();
      }
    } catch (error) {
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('Failed to update policy. Please try again.');
      }
    }
  }, [editForm, refreshDashboardData]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                          <p className="text-gray-800">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Dashboard
              </h1>
              <p className="text-gray-600">
                {(policies || []).length === 0 
                  ? `Welcome, ${user?.first_name || user?.name || 'User'}! Start building your policy library by uploading your first document.`
                  : `Welcome back, ${user?.first_name || user?.name || 'User'}! You have ${(policies || []).length} policy document${(policies || []).length === 1 ? '' : 's'}.`
                }
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowUploadModal(true)}
                className="btn-primary flex items-center gap-2 px-6 py-3"
              >
                <Plus size={20} />
                Upload Policy
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefreshDashboard}
                className="btn-outline flex items-center gap-2 px-6 py-3"
                title="Refresh Dashboard"
              >
                <RefreshCw size={20} />
                Refresh
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (policies.length > 0) {
                    navigate(`/chat/${policies[0].id}`);
                  } else {
                    navigate('/chat');
                  }
                }}
                className="btn-outline flex items-center gap-2 px-6 py-3 relative"
                title="Start Policy Chat"
              >
                <MessageSquare size={20} />
                {policies.length > 0 ? 'Start Chat' : 'General Chat'}
                {/* Total Conversation Count Badge */}
                {conversationCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {conversationCount}
                  </span>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {userStats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="card card-hover p-6"
            >
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}>
                  <stat.icon size={28} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-2xl font-bold text-gray-800 mb-1">
                    {stat.value || '0'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {stat.title || 'Stat'}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        

        <div className="space-y-8">
          {/* Main Content */}
          <div>
            {/* Search and Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="card p-6 mb-6"
            >
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search policies by name, provider, or type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-field pl-10 h-12"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
                
                <div className="flex gap-3">
                  <select
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    className="input-field h-12 min-w-[140px]"
                  >
                    <option value="all">All Types</option>
                    <option value="health">Health Insurance</option>
                    <option value="auto">Auto Insurance</option>
                    <option value="home">Home Insurance</option>
                    <option value="life">Life Insurance</option>
                    <option value="business">Business Insurance</option>
                    <option value="other">Other</option>
                  </select>
                  
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="input-field h-12 min-w-[140px]"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="name">Name A-Z</option>
                    <option value="size">File Size</option>
                  </select>
                </div>
              </div>
            </motion.div>

            {/* Policies List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="card overflow-hidden"
            >
              <div className="p-6 border-b border-primary-200">
                <h3 className="text-lg font-semibold text-gray-800">
                  Your Policies ({filteredPolicies.length})
                </h3>
              </div>
              
              {(policies || []).length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-accent3-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow">
                    <FileText size={28} className="text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">No policies uploaded yet</h3>
                  <p className="text-gray-500 mb-8 text-lg">Start by uploading your first policy document to get started with Gemini 2.5 Flash AI analysis.</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowUploadModal(true)}
                    className="btn-primary flex items-center gap-3 mx-auto px-8 py-4 text-lg"
                  >
                    <Plus size={24} />
                    Upload Your First Policy
                  </motion.button>
                </div>
              ) : filteredPolicies.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Search size={28} className="text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">No policies found</h3>
                    <p className="text-gray-500 mb-8 text-lg">
                      {searchTerm || selectedFilter !== 'all' 
                        ? 'Try adjusting your search or filters'
                        : 'Start by uploading your first policy document'
                      }
                    </p>
                    {searchTerm || selectedFilter !== 'all' ? (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setSearchTerm('');
                          setSelectedFilter('all');
                        }}
                        className="btn-outline px-8 py-3 text-lg"
                      >
                        Clear Filters
                      </motion.button>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowUploadModal(true)}
                        className="btn-primary px-8 py-3 text-lg"
                      >
                        Upload Policy
                      </motion.button>
                    )}
                  </div>
                ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {filteredPolicies.map((policy, index) => {
                    return (
                    <motion.div
                      key={policy.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      whileHover={{ y: -5, scale: 1.02 }}
                      className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden min-h-[280px]"
                    >
                      {/* Policy Header */}
                      <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-800 text-xl mb-3 leading-tight">
                              {policy.name || 'Unnamed Policy'}
                            </h4>
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className="px-4 py-2 rounded-full text-sm font-semibold bg-primary-500 text-white shadow-md">
                                {policy.policy_type || 'Insurance'}
                              </span>
                              {policy.provider && (
                                <span className="px-4 py-2 bg-secondary-500 text-white rounded-full text-sm font-semibold shadow-md">
                                  {policy.provider}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Policy Details */}
                      <div className="p-8">
                        <div className="space-y-4 mb-8">
                          <div className="flex items-center gap-3 text-base text-gray-700">
                            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                              <FileText size={20} className="text-primary-600" />
                            </div>
                            <div>
                              <span className="font-medium text-gray-800">File Size:</span>
                              <span className="ml-2">
                                {policy.file_size ? (() => {
                                  const sizeInBytes = parseInt(policy.file_size) || 0;
                                  if (sizeInBytes === 0) return '0 B';
                                  const k = 1024;
                                  const sizes = ['B', 'KB', 'MB', 'GB'];
                                  const i = Math.floor(Math.log(sizeInBytes) / Math.log(k));
                                  return parseFloat((sizeInBytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
                                })() : 'Unknown size'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 text-base text-gray-700">
                            <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center">
                              <CalendarIcon size={20} className="text-secondary-600" />
                            </div>
                            <div>
                              <span className="font-medium text-gray-800">Uploaded:</span>
                              <span className="ml-2">
                                {policy.created_at ? new Date(policy.created_at).toLocaleDateString() : 'Unknown date'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 text-base text-gray-700">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                              <Shield size={20} className="text-green-600" />
                            </div>
                            <div>
                              <span className="font-medium text-gray-800">Status:</span>
                              <span className="ml-2 text-green-600 font-semibold">Active</span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleExtractPolicyDetails(policy.id)}
                              className="w-12 h-12 text-primary-500 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-colors duration-200 flex items-center justify-center border border-primary-200"
                              title="Analyze Policy with Gemini 2.5 Flash AI"
                            >
                              <Eye size={20} />
                            </motion.button>
                            
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => navigate(`/chat/${policy.id}`)}
                              className="w-12 h-12 text-secondary-500 hover:text-secondary-600 hover:bg-secondary-50 rounded-xl transition-colors duration-200 flex items-center justify-center relative border border-secondary-200"
                              title="Start Chat"
                            >
                              <MessageSquare size={20} />
                              {/* Conversation Count Badge */}
                              <span className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                                {policy.conversation_count || 0}
                              </span>
                            </motion.button>
                            
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDownloadPolicy(policy)}
                              className="w-12 h-12 text-green-500 hover:text-green-600 hover:bg-green-50 rounded-xl transition-colors duration-200 flex items-center justify-center border border-green-200"
                              title="Download Policy"
                            >
                              <Download size={20} />
                            </motion.button>
                          </div>

                          <div className="flex items-center gap-3">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleEditPolicy(policy)}
                              className="w-12 h-12 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors duration-200 flex items-center justify-center border border-blue-200"
                              title="Edit Policy Details"
                            >
                              <Edit size={20} />
                            </motion.button>
                            
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDeletePolicy(policy.id, policy.name)}
                              className="w-12 h-12 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors duration-200 flex items-center justify-center border border-red-200"
                              title="Delete Policy"
                            >
                              <Trash2 size={20} />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )})}
                </div>
              )}
            </motion.div>
          </div>

          {/* Additional Sections Below Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Welcome Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-gradient-to-br from-secondary-600 to-secondary-800 rounded-2xl p-8 text-white shadow-lg"
            >
              <h3 className="text-2xl font-bold mb-6">
                Welcome to PolicyBridge AI! 🎉
              </h3>
              <p className="text-lg text-secondary-100 mb-8 leading-relaxed">
                You're all set to start analyzing policies with Gemini 2.5 Flash AI. Upload your first document to get started.
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowUploadModal(true)}
                className="w-full bg-white/20 hover:bg-white/30 text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-200 border border-white/30 text-lg"
              >
                Get Started
              </motion.button>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-gradient-to-br from-accent1-600 to-accent1-800 rounded-2xl p-8 text-white shadow-lg"
            >
              <h3 className="text-2xl font-bold mb-6">Quick Actions</h3>
              <div className="space-y-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowUploadModal(true)}
                  className="w-full bg-white/20 hover:bg-white/30 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 border border-white/30"
                >
                  Upload New Policy
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-lg"
            >
              <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
                Upload New Policy
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    Policy Name
                  </label>
                  <input
                    type="text"
                    value={uploadForm.name}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, name: e.target.value }))}
                    className="input-field"
                    placeholder="Enter policy name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    Insurance Provider
                  </label>
                  <input
                    type="text"
                    value={uploadForm.provider || ''}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, provider: e.target.value }))}
                    className="input-field"
                    placeholder="Enter insurance provider name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    Policy Type
                  </label>
                  <select 
                    value={uploadForm.policy_type || ''}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, policy_type: e.target.value }))}
                    className="input-field"
                  >
                    <option value="">Select type</option>
                    <option value="health">Health Insurance</option>
                    <option value="auto">Auto Insurance</option>
                    <option value="home">Home Insurance</option>
                    <option value="life">Life Insurance</option>
                    <option value="business">Business Insurance</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    Policy Document
                  </label>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`w-full px-4 py-3 border-2 border-dashed rounded-xl transition-all duration-200 ${
                      dragActive ? 'border-primary-500 bg-primary-50' : 'border-primary-300'
                    }`}
                  >
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.docx,.doc"
                      className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-500 file:text-white hover:file:bg-primary-600"
                    />
                    <div className="text-center mt-2">
                      <p className="text-sm text-gray-800">Drag and drop your file here, or click to browse</p>
                      <p className="text-xs text-gray-500 mt-1">Supported formats: PDF, DOCX, DOC</p>
                    </div>
                    {uploadForm.file && (
                      <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800">✓ {uploadForm.file.name} selected</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4 mt-8">
                <button
                  onClick={resetUploadForm}
                  className="flex-1 btn-outline py-3 text-lg"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUpload}
                  disabled={uploading}
                  className="flex-1 btn-primary flex items-center justify-center gap-3 py-3 text-lg"
                >
                  {uploading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Uploading...
                    </>
                  ) : (
                    'Upload Policy'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Policy Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-lg"
            >
              <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
                Edit Policy Details
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    Policy Name
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    className="input-field"
                    placeholder="Enter policy name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    Insurance Provider
                  </label>
                  <input
                    type="text"
                    value={editForm.provider || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, provider: e.target.value }))}
                    className="input-field"
                    placeholder="Enter insurance provider name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    Policy Type
                  </label>
                  <select 
                    value={editForm.policy_type || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, policy_type: e.target.value }))}
                    className="input-field"
                  >
                    <option value="">Select type</option>
                    <option value="health">Health Insurance</option>
                    <option value="auto">Auto Insurance</option>
                    <option value="home">Home Insurance</option>
                    <option value="life">Life Insurance</option>
                    <option value="business">Business Insurance</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditForm({ id: null, name: '', provider: '', policy_type: '' });
                  }}
                  className="flex-1 btn-outline py-3 text-lg"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUpdatePolicy}
                  className="flex-1 btn-primary flex items-center justify-center gap-3 py-3 text-lg"
                >
                  Update Policy
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Policy Details Extraction Modal - Sunlit Ocean Theme */}
      <AnimatePresence>
        {showExtractionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            style={{ zIndex: 9999 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              style={{ zIndex: 10000 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#D3D8D1' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #E8E5E0, #D3D8D1)' }}>
                    <Bot size={20} className="text-gray-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">AI Policy Analysis</h2>
                    <p className="text-sm text-gray-600">Powered by Gemini 2.5 Flash</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowExtractionModal(false)}
                  className="p-2 text-gray-500 hover:text-gray-800 rounded-lg transition-colors duration-200" 
                  style={{ '&:hover': { backgroundColor: '#F5F3F0' } }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#F5F3F0'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                {/* Helpful Message - Only show when no data */}
                {!extractedDetails ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <div className="absolute inset-0" style={{
                        background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.3"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") repeat'
                      }} />
                    </div>
                    <div className="relative flex items-start gap-4">
                      <div 
                        className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                        style={{ 
                          background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                          boxShadow: '0 8px 16px rgba(59, 130, 246, 0.3)'
                        }}
                      >
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-blue-900 mb-2">Getting Better Results</h4>
                        <p className="text-blue-800 mb-4 leading-relaxed">
                          For more accurate AI analysis, ensure your policy document meets these requirements:
                        </p>
                        <div className="grid gap-3">
                          {[
                            'Contains clear, readable text (not just images)',
                            'Includes policy dates, coverage amounts, and terms',
                            'Is in PDF, DOCX, or DOC format',
                            'Has been properly uploaded and processed'
                          ].map((item, index) => (
                            <motion.div 
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.1 * index }}
                              className="flex items-center gap-3"
                            >
                              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                              <span className="text-blue-800 font-medium">{item}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
                
                {extracting ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 border-4 rounded-full animate-spin mx-auto mb-4" style={{ borderColor: '#E8E5E0', borderTopColor: 'transparent' }}></div>
                    <p className="text-gray-600">Gemini 2.5 Flash is analyzing your policy document...</p>
                  </div>
                ) : extractedDetails ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                  >
                    
                    {/* Policy Name - Ocean Header */}
                    <motion.div 
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center py-8 relative overflow-hidden rounded-2xl"
                      style={{ 
                        background: 'linear-gradient(135deg, #e0f2fe 0%, #b3e5fc 50%, #81d4fa 100%)',
                        border: '1px solid rgba(3, 169, 244, 0.2)'
                      }}
                    >
                      <div className="absolute inset-0 opacity-20">
                        <div className="absolute inset-0" style={{
                          background: 'url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%23ffffff" fill-opacity="0.4"%3E%3Cpath d="M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z"/%3E%3C/g%3E%3C/svg%3E") repeat'
                        }} />
                      </div>
                      <div className="relative">
                        <motion.h2 
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.2 }}
                          className="text-3xl font-bold text-blue-900 mb-4"
                        >
                          {extractedDetails.name || 'Policy Analysis'}
                        </motion.h2>
                        {extractedDetails.provider && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="mb-4 flex flex-wrap justify-center gap-3"
                          >
                            <span 
                              className="inline-flex items-center px-6 py-3 rounded-full text-sm font-semibold backdrop-blur-sm"
                              style={{ 
                                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(240, 249, 255, 0.9))',
                                color: '#0369a1',
                                border: '1px solid rgba(3, 105, 161, 0.3)',
                                boxShadow: '0 4px 12px rgba(3, 105, 161, 0.1)'
                              }}
                            >
                              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                              {extractedDetails.provider}
                            </span>
                            {extractedDetails.policy_type && (
                              <span 
                                className="inline-flex items-center px-6 py-3 rounded-full text-sm font-semibold backdrop-blur-sm"
                                style={{ 
                                  background: 'linear-gradient(135deg, rgba(191, 219, 254, 0.9), rgba(147, 197, 253, 0.9))',
                                  color: '#1e40af',
                                  border: '1px solid rgba(30, 64, 175, 0.3)',
                                  boxShadow: '0 4px 12px rgba(30, 64, 175, 0.1)'
                                }}
                              >
                                <Shield size={16} className="mr-2" />
                                {extractedDetails.policy_type}
                              </span>
                            )}
                          </motion.div>
                        )}
                        <motion.p 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.4 }}
                          className="text-blue-700 text-base font-medium"
                        >
                          🌊 AI-Powered Ocean Analysis
                        </motion.p>
                      </div>
                    </motion.div>
                    
                    {/* Summary - Ocean Theme */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="relative overflow-hidden rounded-2xl"
                      style={{ 
                        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #bae6fd 100%)',
                        border: '1px solid rgba(14, 165, 233, 0.2)',
                        boxShadow: '0 10px 25px -5px rgba(14, 165, 233, 0.1)'
                      }}
                    >
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0" style={{
                          background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.6"%3E%3Cpath d="M30 30c0-8.3-6.7-15-15-15s-15 6.7-15 15 6.7 15 15 15 15-6.7 15-15zm15 0c0-8.3-6.7-15-15-15s-15 6.7-15 15 6.7 15 15 15 15-6.7 15-15z"/%3E%3C/g%3E%3C/svg%3E") repeat'
                        }} />
                      </div>
                      
                      <div className="relative p-8">
                        <div className="flex items-center gap-3 mb-6">
                          <div 
                            className="w-12 h-12 rounded-2xl flex items-center justify-center"
                            style={{ 
                              background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                              boxShadow: '0 8px 16px rgba(14, 165, 233, 0.3)'
                            }}
                          >
                            <FileTextIcon size={24} className="text-white" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-blue-900">Policy Summary</h3>
                            <p className="text-blue-700 text-sm">Deep dive analysis results</p>
                          </div>
                        </div>
                        
                        {/* Format and display the summary text */}
                        {extractedDetails.summary ? (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="space-y-4"
                          >
                            {formatPolicySummary(extractedDetails.summary)}
                          </motion.div>
                        ) : (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white/60 backdrop-blur-sm rounded-xl p-6"
                            style={{ border: '1px solid rgba(14, 165, 233, 0.2)' }}
                          >
                            <p className="text-blue-800 leading-relaxed">
                              🌊 Policy analysis summary will be generated here. Please ensure your policy document is properly uploaded and contains readable text.
                            </p>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>

                    {/* ML Insights - Ocean Theme */}
                    {extractedDetails.mlInsights && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="relative overflow-hidden rounded-2xl"
                        style={{ 
                          background: 'linear-gradient(135deg, #ecfeff 0%, #cffafe 50%, #a5f3fc 100%)',
                          border: '1px solid rgba(6, 182, 212, 0.2)',
                          boxShadow: '0 10px 25px -5px rgba(6, 182, 212, 0.1)'
                        }}
                      >
                        <div className="absolute inset-0 opacity-10">
                          <div className="absolute inset-0" style={{
                            background: 'url("data:image/svg+xml,%3Csvg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%23ffffff" fill-opacity="0.5"%3E%3Cpath d="M25 25c0-6.9-5.6-12.5-12.5-12.5S0 18.1 0 25s5.6 12.5 12.5 12.5S25 31.9 25 25zm12.5 0c0-6.9-5.6-12.5-12.5-12.5S12.5 18.1 12.5 25s5.6 12.5 12.5 12.5S37.5 31.9 37.5 25z"/%3E%3C/g%3E%3C/svg%3E") repeat'
                          }} />
                        </div>
                        
                        <div className="relative p-8">
                          <div className="flex items-center gap-3 mb-6">
                            <div 
                              className="w-12 h-12 rounded-2xl flex items-center justify-center"
                              style={{ 
                                background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                                boxShadow: '0 8px 16px rgba(6, 182, 212, 0.3)'
                              }}
                            >
                              <Brain size={24} className="text-white" />
                            </div>
                            <div>
                              <h3 className="text-2xl font-bold text-cyan-900">AI Insights</h3>
                              <p className="text-cyan-700 text-sm">Machine learning analysis</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <motion.div 
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.4 }}
                              className="space-y-4"
                            >
                              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4" style={{ border: '1px solid rgba(6, 182, 212, 0.2)' }}>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-semibold text-cyan-800">Risk Assessment:</span>
                                  <span className={`px-3 py-2 rounded-full text-xs font-bold ${
                                    extractedDetails.mlInsights?.riskAssessment === 'Low' ? 'text-emerald-800' :
                                    extractedDetails.mlInsights?.riskAssessment === 'Medium' ? 'text-amber-800' :
                                    extractedDetails.mlInsights?.riskAssessment === 'High' ? 'text-rose-800' :
                                    'text-cyan-700'
                                  }`}
                                  style={{
                                    background: extractedDetails.mlInsights?.riskAssessment === 'Low' ? 'linear-gradient(135deg, #d1fae5, #a7f3d0)' :
                                    extractedDetails.mlInsights?.riskAssessment === 'Medium' ? 'linear-gradient(135deg, #fef3c7, #fde68a)' :
                                    extractedDetails.mlInsights?.riskAssessment === 'High' ? 'linear-gradient(135deg, #fecaca, #f87171)' :
                                    'linear-gradient(135deg, #cffafe, #a5f3fc)'
                                  }}>
                                    {extractedDetails.mlInsights?.riskAssessment || 'Analysis pending'}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4" style={{ border: '1px solid rgba(6, 182, 212, 0.2)' }}>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-semibold text-cyan-800">Coverage Score:</span>
                                  <div className="flex items-center gap-2">
                                    <div className="w-16 h-2 bg-cyan-100 rounded-full overflow-hidden">
                                      <div 
                                        className="h-full bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-full transition-all duration-1000"
                                        style={{ width: `${extractedDetails.mlInsights?.coverageScore || 0}%` }}
                                      />
                                    </div>
                                    <span className="text-cyan-900 font-bold text-sm">
                                      {extractedDetails.mlInsights?.coverageScore || '--'}/100
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4" style={{ border: '1px solid rgba(6, 182, 212, 0.2)' }}>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-semibold text-cyan-800">Cost Efficiency:</span>
                                  <span className="text-cyan-900 font-bold">
                                    {extractedDetails.mlInsights?.costEfficiency || 'Analysis pending'}
                                  </span>
                                </div>
                              </div>
                            </motion.div>
                            
                            <motion.div 
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.5 }}
                              className="space-y-4"
                            >
                              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4" style={{ border: '1px solid rgba(6, 182, 212, 0.2)' }}>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-semibold text-cyan-800">Market Comparison:</span>
                                  <span className="text-cyan-900 font-bold">
                                    {extractedDetails.mlInsights?.marketComparison || 'Analysis pending'}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4" style={{ border: '1px solid rgba(6, 182, 212, 0.2)' }}>
                                <span className="text-sm font-semibold text-cyan-800 block mb-3">🌊 Optimization Tips:</span>
                                <ul className="space-y-2">
                                  {extractedDetails.mlInsights?.optimizationTips && extractedDetails.mlInsights.optimizationTips.length > 0 ? (
                                    extractedDetails.mlInsights.optimizationTips.map((tip, index) => (
                                      <motion.li 
                                        key={index} 
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.6 + (index * 0.1) }}
                                        className="text-sm text-cyan-800 flex items-start gap-2"
                                      >
                                        <span className="w-2 h-2 bg-cyan-500 rounded-full mt-2 flex-shrink-0"></span>
                                        {tip}
                                      </motion.li>
                                    ))
                                  ) : (
                                    <li className="text-sm text-cyan-600">AI analysis will generate personalized tips based on your policy content</li>
                                  )}
                                </ul>
                              </div>
                            </motion.div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Tags */}
                    {extractedDetails.tags && extractedDetails.tags.length > 0 ? (
                      <div className="bg-white p-6 rounded-xl border border-primary-200">
                        <h3 className="text-sm font-medium text-gray-600 mb-3 flex items-center gap-2">
                          <Tag size={16} className="text-accent3-500" />
                          Tags
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {extractedDetails.tags.map((tag, index) => (
                            <span key={index} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                              {tag || 'Unknown'}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white p-6 rounded-xl border border-primary-200">
                        <h3 className="text-sm font-medium text-gray-600 mb-3 flex items-center gap-2">
                          <Tag size={16} className="text-accent3-500" />
                          Tags
                        </h3>
                        <p className="text-gray-500 text-sm">AI analysis will automatically generate relevant tags based on your policy content</p>
                      </div>
                    )}

                    {/* Download Summary Report */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-100 border border-blue-200 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-blue-800 flex items-center gap-2">
                          <Download className="w-5 h-5" />
                          Download Summary Report
                        </h4>
                      </div>
                      <p className="text-blue-700 mb-4 text-sm">
                        Generate a comprehensive PDF report of your policy analysis with AI insights and recommendations.
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          try {
                            if (!extractedDetails) {
                              toast.error('No analysis data available for download');
                              return;
                            }

                            // Create formatted HTML with categorized sections like the UI
                            const formatPDFSummary = (summaryText) => {
                              if (!summaryText || typeof summaryText !== 'string') {
                                return '<p>No summary available</p>';
                              }

                              // Clean the text from any formatting symbols and remove introductory text
                              const cleanText = summaryText
                                .replace(/[•◦▪▫★☆♦◆■□▲△▼▽]/g, '')
                                .replace(/^\s*[*\-+•]\s*/gm, '')
                                .replace(/#{1,6}\s*/g, '')
                                .replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1')
                                .replace(/^\s*[*\-+]\s*/gm, '')
                                .replace(/^Here's a comprehensive and detailed analysis of the .* policy document:\s*/i, '') // Remove intro text
                                .replace(/^.*comprehensive.*analysis.*document:\s*/i, '') // Remove any variation of intro text
                                .trim();

                              // Split into sections
                              const sections = cleanText.split(/(?=^[A-Z][A-Z\s:]+:?$|^[A-Z][a-z]+(?:\s+[A-Z][a-z]*)*:?$)/m);
                              
                              return sections.map(section => {
                                if (!section.trim()) return '';
                                
                                const lines = section.trim().split('\n');
                                const header = lines[0].trim();
                                const content = lines.slice(1).filter(line => line.trim()).join('\n');
                                
                                if (!content) return '';

                                // Get colors for different categories
                                const getCategoryColor = (headerText) => {
                                  const text = headerText.toUpperCase();
                                  if (text.includes('SUMMARY') || text.includes('OVERVIEW')) return { bg: '#dbeafe', border: '#bfdbfe', text: '#1e40af' };
                                  if (text.includes('COVERAGE') || text.includes('DETAILS')) return { bg: '#dcfce7', border: '#bbf7d0', text: '#166534' };
                                  if (text.includes('KEY DATES') || text.includes('DATES')) return { bg: '#f3e8ff', border: '#e9d5ff', text: '#7c3aed' };
                                  if (text.includes('FINANCIAL') || text.includes('TERMS')) return { bg: '#fed7aa', border: '#fdba74', text: '#ea580c' };
                                  if (text.includes('POLICY TYPE') || text.includes('PROVIDER')) return { bg: '#e0e7ff', border: '#c7d2fe', text: '#4338ca' };
                                  if (text.includes('RISK') || text.includes('ASSESSMENT')) return { bg: '#fecaca', border: '#fca5a5', text: '#dc2626' };
                                  if (text.includes('TIPS') || text.includes('OPTIMIZATION')) return { bg: '#fef3c7', border: '#fde68a', text: '#d97706' };
                                  if (text.includes('MARKET') || text.includes('COMPARISON')) return { bg: '#ccfbf1', border: '#99f6e4', text: '#0f766e' };
                                  if (text.includes('CLAIM') || text.includes('TIMELINES')) return { bg: '#fce7f3', border: '#fbcfe8', text: '#be185d' };
                                  if (text.includes('HOSPITALIZATION') || text.includes('PLANNED')) return { bg: '#cffafe', border: '#a5f3fc', text: '#0891b2' };
                                  if (text.includes('EMERGENCY') || text.includes('URGENT')) return { bg: '#ffe4e6', border: '#fecdd3', text: '#e11d48' };
                                  if (text.includes('WAITING') || text.includes('PERIODS')) return { bg: '#fef9c3', border: '#fef08a', text: '#ca8a04' };
                                  return { bg: '#f1f5f9', border: '#e2e8f0', text: '#475569' };
                                };

                                const colors = getCategoryColor(header);
                                const contentLines = content.split('\n').filter(line => line.trim());
                                const cleanLines = contentLines.map(line => line.replace(/^[\s*\-+•◦▪▫★☆♦◆■□▲△▼▽]+/, '').trim());

                                return `
                                  <div style="border: 1px solid ${colors.border}; background: ${colors.bg}; border-radius: 8px; margin-bottom: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                                    <div style="background: ${colors.border}; color: ${colors.text}; font-weight: 600; font-size: 16px; padding: 12px 16px;">
                                      ${header}
                                    </div>
                                    <div style="padding: 16px;">
                                      ${cleanLines.length <= 2 && !cleanLines.some(line => line.length < 100) ? 
                                        `<p style="color: ${colors.text}; line-height: 1.6; margin: 0;">${content}</p>` :
                                        `<ul style="list-style: none; padding: 0; margin: 0;">
                                          ${cleanLines.map(point => `
                                            <li style="margin: 8px 0; padding-left: 20px; position: relative; color: ${colors.text}; line-height: 1.5;">
                                              <span style="position: absolute; left: 0; color: ${colors.text}; font-weight: bold;">•</span>
                                              ${point}
                                            </li>
                                          `).join('')}
                                        </ul>`
                                      }
                                    </div>
                                  </div>
                                `;
                              }).filter(Boolean).join('');
                            };

                            const summaryContent = `
                              <!DOCTYPE html>
                              <html>
                              <head>
                                <meta charset="utf-8">
                                <title>PolicyBridge AI - Policy Analysis Summary</title>
                                <style>
                                  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background: #f8fafc; line-height: 1.6; }
                                  .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
                                  .header { text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #e5e7eb; }
                                  .logo { font-size: 28px; font-weight: bold; color: #f59e0b; margin-bottom: 8px; }
                                  .subtitle { color: #6b7280; font-size: 16px; }
                                  .policy-info { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 24px; text-align: center; }
                                  .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
                                  .insights-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin: 24px 0; }
                                  .insight-item { background: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; padding: 16px; text-align: center; }
                                  .insight-label { font-weight: 500; color: #92400e; margin-bottom: 8px; font-size: 14px; }
                                  .insight-value { font-size: 18px; font-weight: 600; color: #78350f; }
                                </style>
                              </head>
                              <body>
                                <div class="container">
                                  <div class="header">
                                    <div class="logo">PolicyBridge AI</div>
                                    <div class="subtitle">Policy Analysis Summary Report</div>
                                    <div style="color: #6b7280; margin-top: 8px;">Generated on: ${new Date().toLocaleDateString()}</div>
                                  </div>
                                  
                                  <div class="policy-info">
                                    <h2 style="margin: 0 0 12px 0; color: #1f2937; font-size: 24px; font-weight: bold;">${extractedDetails.name || 'Policy Analysis'}</h2>
                                    ${extractedDetails.provider ? `
                                      <div style="margin: 8px 0; display: flex; align-items: center; flex-wrap: wrap; gap: 8px;">
                                        <span style="display: inline-flex; align-items: center; padding: 4px 12px; background-color: #F5F3F0; color: #374151; border: 1px solid #D3D8D1; border-radius: 20px; font-size: 12px; font-weight: 500;">
                                          ${extractedDetails.provider}
                                        </span>
                                        ${extractedDetails.policy_type ? `
                                          <span style="display: inline-flex; align-items: center; padding: 4px 12px; background-color: #E8E5E0; color: #374151; border: 1px solid #D3D8D1; border-radius: 20px; font-size: 12px; font-weight: 500;">
                                            ${extractedDetails.policy_type}
                                          </span>
                                        ` : ''}
                                      </div>
                                    ` : ''}
                                    <p style="margin: 0; color: #6b7280; font-size: 14px;">AI-Powered Policy Analysis Report</p>
                                  </div>

                                  <div style="margin-bottom: 32px;">
                                    ${formatPDFSummary(extractedDetails.summary)}
                                  </div>
                                  ${extractedDetails.mlInsights ? `
                                  <div style="border: 1px solid #fde68a; background: #fef3c7; border-radius: 8px; margin-bottom: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                                    <div style="background: #fde68a; color: #d97706; font-weight: 600; font-size: 16px; padding: 12px 16px;">
                                      🧠 AI Insights
                                    </div>
                                    <div style="padding: 16px;">
                                      <div class="insights-grid">
                                        <div class="insight-item">
                                          <div class="insight-label">Risk Assessment</div>
                                          <div class="insight-value">${extractedDetails.mlInsights?.riskAssessment || 'Analysis pending'}</div>
                                        </div>
                                        <div class="insight-item">
                                          <div class="insight-label">Coverage Score</div>
                                          <div class="insight-value">${extractedDetails.mlInsights?.coverageScore || '--'}/100</div>
                                        </div>
                                        <div class="insight-item">
                                          <div class="insight-label">Cost Efficiency</div>
                                          <div class="insight-value">${extractedDetails.mlInsights?.costEfficiency || 'Analysis pending'}</div>
                                        </div>
                                        <div class="insight-item">
                                          <div class="insight-label">Market Comparison</div>
                                          <div class="insight-value">${extractedDetails.mlInsights?.marketComparison || 'Analysis pending'}</div>
                                        </div>
                                      </div>
                                      
                                      <div style="background: #dcfce7; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin-top: 16px;">
                                        <div style="font-weight: 600; color: #166534; margin-bottom: 12px;">💡 Optimization Tips:</div>
                                        ${extractedDetails.mlInsights?.optimizationTips && extractedDetails.mlInsights.optimizationTips.length > 0 ? 
                                          extractedDetails.mlInsights.optimizationTips.map((tip, index) => `
                                            <div style="margin: 8px 0; padding-left: 20px; position: relative; color: #166534; line-height: 1.5;">
                                              <span style="position: absolute; left: 0; color: #22c55e; font-weight: bold;">•</span>
                                              ${tip}
                                            </div>
                                          `).join('') : 
                                          '<div style="color: #166534;">No optimization tips available</div>'
                                        }
                                      </div>
                                    </div>
                                  </div>
                                  ` : ''}
                                  
                                  ${extractedDetails.tags && extractedDetails.tags.length > 0 ? `
                                  <div style="border: 1px solid #e2e8f0; background: #f1f5f9; border-radius: 8px; margin-bottom: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                                    <div style="background: #e2e8f0; color: #475569; font-weight: 600; font-size: 16px; padding: 12px 16px;">
                                      🏷️ Policy Tags
                                    </div>
                                    <div style="padding: 16px;">
                                      <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                                        ${extractedDetails.tags.map(tag => `
                                          <span style="background: #e2e8f0; color: #475569; padding: 6px 12px; border-radius: 16px; font-size: 12px; font-weight: 500;">
                                            ${tag || 'Unknown'}
                                          </span>
                                        `).join('')}
                                      </div>
                                    </div>
                                  </div>
                                  ` : ''}
                                  <div class="footer">
                                    <div style="margin-bottom: 8px;">Generated by PolicyBridge AI</div>
                                    <div>Powered by Gemini 2.5 Flash</div>
                                    <div style="margin-top: 8px;">
                                      <a href="https://policybridge.ai" style="color: #f59e0b; text-decoration: none;">policybridge.ai</a>
                                    </div>
                                  </div>
                                </div>
                              </body>
                              </html>
                            `;
                            const blob = new Blob([summaryContent], { type: 'text/html' });
                            const url = URL.createObjectURL(blob);
                            const newWindow = window.open(url, '_blank');
                            if (newWindow) {
                              newWindow.document.title = 'PolicyBridge AI - Policy Analysis Summary';
                              setTimeout(() => {
                                newWindow.print();
                              }, 800);
                            }
                            toast.success('Summary report opened. Use Print to save as PDF.');
                          } catch (error) {
                            console.error('Download error:', error);
                            toast.error('Failed to generate summary PDF');
                          }
                        }}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg border border-blue-500 whitespace-nowrap"
                      >
                        <Download size={18} className="mr-2" />
                        Download Summary Report
                      </motion.button>
                    </div>
                  </motion.div>
                ) : null}
              </div>

              {/* Footer */}
              <div className="flex gap-3 p-6 border-t" style={{ borderColor: '#D3D8D1', backgroundColor: '#F9F8F7' }}>
                <button
                  onClick={() => setShowExtractionModal(false)}
                  className="flex-1 btn-outline"
                >
                  Close
                </button>
                <button
                  onClick={() => navigate(`/policy/${extractedDetails?.id || 'new'}`)}
                  className="flex-1 btn-primary"
                >
                  View Full Policy
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardEnhanced;
