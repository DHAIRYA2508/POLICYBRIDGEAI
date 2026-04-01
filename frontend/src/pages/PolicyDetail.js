import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { policyAPI, aiAPI } from '../services/api';
import { 
  ArrowLeft, 
  FileText, 
  Download, 
  Share2, 
  MessageSquare, 
  BarChart3, 
  Calendar,
  Clock,
  MoreHorizontal
} from 'lucide-react';

const PolicyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { requireAuth } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Real policy data - will be fetched from backend
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      if (!await requireAuth()) {
        return; // Will redirect to login if not authenticated
      }
    };
    checkAuth();
  }, [requireAuth]);

  // Fetch policy data
  useEffect(() => {
    const fetchPolicyData = async () => {
      try {
        setLoading(true);
        // Fetch policy data from backend
        try {
          const response = await policyAPI.getPolicy(id);
          const policyData = response.data;
          
          // Extract real policy details from the document using AI
          try {
            const extractedDetails = await aiAPI.extractPolicyDetails(policyData.id);

            
            setPolicy({
              ...policyData,
              ...extractedDetails.data
            });
          } catch (extractError) {
            // Use policy data without extraction
            setPolicy(policyData);
          }
        } catch (error) {
          // Set fallback data if API fails
          setPolicy({
            id,
            name: 'Policy Document',
            type: 'Document',
            status: 'active',
            uploadDate: new Date().toISOString().split('T')[0],
            lastModified: new Date().toISOString().split('T')[0],
            size: '0 MB',
            pages: 0,
            conversations: 0,
            fileType: 'PDF',
            description: 'Policy document uploaded by user.',
            tags: [],
            metadata: {
              effectiveDate: 'N/A',
              expiryDate: 'N/A',
              department: 'N/A',
              coverage: 'N/A',
              deductible: 'N/A',
              maxOutOfPocket: 'N/A'
            },
            recentActivity: []
          });
        }
      } catch (error) {
        // Error handled silently
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPolicyData();
    }
  }, [id]);

  const quickActions = [
    {
      icon: MessageSquare,
      title: 'Start Chat',
      description: 'Ask AI questions about this policy',
      action: () => navigate(`/chat/${id}`),
      color: 'from-accent1-500 to-accent1-600'
    },
    {
      icon: BarChart3,
      title: 'Compare',
      description: 'Compare with other policies',
      action: () => navigate('/compare'),
      color: 'from-accent2-500 to-accent2-600'
    },
    {
      icon: Download,
      title: 'Download',
      description: 'Download policy document',
      action: () => {
        if (policy?.document) {
          const link = document.createElement('a');
          link.href = policy.document;
          link.download = policy.name || 'policy-document';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      },
      color: 'from-secondary-500 to-secondary-600'
    },
    {
      icon: Share2,
      title: 'Share',
      description: 'Share with team members',
              action: () => {},
      color: 'from-secondary-600 to-secondary-700'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'archived':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getFileTypeColor = (fileType) => {
    switch (fileType) {
      case 'PDF':
        return 'bg-red-100 text-red-800';
      case 'DOCX':
        return 'bg-blue-100 text-blue-800';
      case 'TXT':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDelete = () => {
    // Handle delete logic here
    setShowDeleteModal(false);
    navigate('/dashboard');
  };

  // Add safe access functions to prevent undefined errors
  const getMetadataValue = (key, fallback = 'N/A') => {
    return policy?.metadata?.[key] || fallback;
  };

  const getPolicyValue = (key, fallback = 'N/A') => {
    return policy?.[key] || fallback;
  };

  const getArrayValue = (key, fallback = []) => {
    return policy?.[key] || fallback;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#EDE8F5] via-[#D8D0E8] to-[#ADBBDDA] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#3D52A0] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#8697C4]">Loading policy details...</p>
        </div>
      </div>
    );
  }

  if (!policy) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#EDE8F5] via-[#D8D0E8] to-[#ADBBDDA] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText size={24} className="text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-[#3D52A0] mb-2">Policy Not Found</h2>
          <p className="text-[#8697C4] mb-4">The policy you're looking for doesn't exist or you don't have access to it.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EDE8F5] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-text-secondary hover:text-secondary-500 mb-6 transition-colors duration-200"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back
          </button>
          
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-secondary-500 to-accent1-500 rounded-2xl flex items-center justify-center">
                  <FileText size={32} className="text-white" />
                </div>
                <div className="flex-1">
                                     <h1 className="text-3xl font-bold text-text-primary mb-2">
                     {getPolicyValue('name', 'Policy Document')}
                   </h1>
                   <p className="text-lg text-text-secondary mb-4">
                     {getPolicyValue('description', 'Policy document uploaded by user.')}
                   </p>
                   <div className="flex flex-wrap items-center gap-3">
                     <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(getPolicyValue('status', 'active'))}`}>
                       {getPolicyValue('status', 'active')}
                     </span>
                     <span className={`px-3 py-1 rounded-full text-sm font-medium ${getFileTypeColor(getPolicyValue('fileType', 'PDF'))}`}>
                       {getPolicyValue('fileType', 'PDF')}
                     </span>
                     <span className="px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                       {getPolicyValue('type', 'Document')}
                     </span>
                   </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(`/chat/${id}`)}
                className="btn-primary"
              >
                <MessageSquare size={18} className="mr-2" />
                Start Chat
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-outline"
              >
                <MoreHorizontal size={18} />
              </motion.button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-xl shadow-soft p-6"
            >
              <h3 className="text-lg font-semibold text-text-primary mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <motion.button
                      key={action.title}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={action.action}
                      className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg text-left transition-colors duration-200 group"
                    >
                      <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200`}>
                        <Icon size={24} className="text-white" />
                      </div>
                      <h4 className="font-medium text-text-primary mb-1">
                        {action.title}
                      </h4>
                      <p className="text-sm text-text-secondary">
                        {action.description}
                      </p>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            {/* Policy Metadata */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white rounded-xl shadow-soft p-6"
            >
              <h3 className="text-lg font-semibold text-text-primary mb-4">
                Policy Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                                     <div className="flex items-center space-x-3">
                     <Calendar size={20} className="text-text-muted" />
                     <div>
                       <p className="text-sm text-text-secondary">Effective Date</p>
                       <p className="font-medium text-text-primary">{getMetadataValue('effectiveDate')}</p>
                     </div>
                   </div>
                   <div className="flex items-center space-x-3">
                     <Clock size={20} className="text-text-muted" />
                     <div>
                       <p className="text-sm text-text-secondary">Expiry Date</p>
                       <p className="font-medium text-text-primary">{getMetadataValue('expiryDate')}</p>
                     </div>
                   </div>

                </div>
                <div className="space-y-4">
                                     <div>
                     <p className="text-sm text-text-secondary mb-1">Department</p>
                     <p className="font-medium text-text-primary">{getMetadataValue('department')}</p>
                   </div>

                   <div>
                     <p className="text-sm text-text-secondary mb-1">Coverage</p>
                     <p className="font-medium text-text-primary">{getMetadataValue('coverage')}</p>
                   </div>
                </div>
              </div>
            </motion.div>

            {/* Coverage Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-white rounded-xl shadow-soft p-6"
            >
              <h3 className="text-lg font-semibold text-text-primary mb-4">
                Coverage Summary
              </h3>
              <div className="space-y-4">
                                 <div className="flex justify-between items-center py-3 border-b border-gray-100">
                   <span className="text-text-secondary">Deductible</span>
                   <span className="font-medium text-text-primary">{getMetadataValue('deductible')}</span>
                 </div>
                 <div className="flex justify-between items-center py-3 border-b border-gray-100">
                   <span className="text-text-secondary">Max Out of Pocket</span>
                   <span className="font-medium text-text-primary">{getMetadataValue('maxOutOfPocket')}</span>
                 </div>
                 <div className="flex justify-between items-center py-3">
                   <span className="text-text-secondary">File Size</span>
                   <span className="font-medium text-text-primary">
                     {(() => {
                       const fileSize = getPolicyValue('file_size', 0);
                       if (fileSize > 0) {
                         if (fileSize < 1024) return `${fileSize} B`;
                         if (fileSize < 1024 * 1024) return `${(fileSize / 1024).toFixed(1)} KB`;
                         return `${(fileSize / (1024 * 1024)).toFixed(1)} MB`;
                       }
                       // Show file type if size is not available
                       const fileType = getPolicyValue('file_type', 'PDF');
                       return fileType ? `${fileType.toUpperCase()}` : 'PDF';
                     })()}
                   </span>
                 </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* File Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-xl shadow-soft p-6"
            >
              <h3 className="text-lg font-semibold text-text-primary mb-4">
                File Information
              </h3>
              <div className="space-y-4">
                                 <div className="flex justify-between items-center">
                   <span className="text-text-secondary">Pages</span>
                   <span className="font-medium text-text-primary">{getPolicyValue('pages', 0)}</span>
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="text-text-secondary">Size</span>
                   <span className="font-medium text-text-primary">
                     {(() => {
                       const fileSize = getPolicyValue('file_size', 0);
                       if (fileSize > 0) {
                         if (fileSize < 1024) return `${fileSize} B`;
                         if (fileSize < 1024 * 1024) return `${(fileSize / 1024).toFixed(1)} KB`;
                         return `${(fileSize / (1024 * 1024)).toFixed(1)} MB`;
                       }
                       // Show file type if size is not available
                       const fileType = getPolicyValue('file_type', 'PDF');
                       return fileType ? `${fileType.toUpperCase()}` : 'PDF';
                     })()}
                   </span>
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="text-text-secondary">Type</span>
                   <span className="font-medium text-text-primary">{getPolicyValue('fileType', 'PDF')}</span>
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="text-text-secondary">Conversations</span>
                   <span className="font-medium text-text-primary">{getPolicyValue('conversations', 0)}</span>
                 </div>
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white rounded-xl shadow-soft p-6"
            >
              <h3 className="text-lg font-semibold text-text-primary mb-4">
                Recent Activity
              </h3>
                             <div className="space-y-4">
                 {getArrayValue('recentActivity', []).map((activity, index) => (
                   <motion.div
                     key={activity?.id || index}
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                     className="flex items-start space-x-3"
                   >
                     <div className="w-2 h-2 bg-secondary-500 rounded-full mt-2 flex-shrink-0"></div>
                     <div className="flex-1">
                       <p className="text-sm text-text-primary">{activity?.description || 'Activity'}</p>
                       <p className="text-xs text-text-secondary">
                         {activity?.timestamp || 'Recent'} by {activity?.user || 'User'}
                       </p>
                     </div>
                   </motion.div>
                 ))}
               </div>
            </motion.div>

            {/* Tags */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-white rounded-xl shadow-soft p-6"
            >
              <h3 className="text-lg font-semibold text-text-primary mb-4">
                Tags
              </h3>
                             <div className="flex flex-wrap gap-2">
                 {getArrayValue('tags', []).map((tag, index) => (
                   <motion.span
                     key={tag || index}
                     initial={{ opacity: 0, scale: 0.8 }}
                     animate={{ opacity: 1, scale: 1 }}
                     transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
                     className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
                   >
                     {tag || 'Tag'}
                   </motion.span>
                 ))}
               </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      <AnimatePresence>
        {showDeleteModal && (
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
              className="bg-white rounded-xl p-6 max-w-md w-full"
            >
              <h3 className="text-lg font-semibold text-text-primary mb-4">
                Delete Policy
              </h3>
                             <p className="text-text-secondary mb-6">
                 Are you sure you want to delete "{getPolicyValue('name', 'this policy')}"? This action cannot be undone.
               </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="btn-outline flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex-1"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PolicyDetail;
