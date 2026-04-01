import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  MessageSquare, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  FileText, 
  User, 
  ArrowRight,
  Download,
  Share2,
  Bookmark,

  Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ConversationHistory = () => {
  const navigate = useNavigate();
  const { requireAuth } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  // Real conversation data - will be fetched from backend
  const [conversations, setConversations] = useState([]);
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

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
    
        // const response = await aiAPI.getConversations();
        // setConversations(response.data);
        
        // For now, set empty state
        setConversations([]);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  const filteredConversations = conversations.filter(conversation => {
    const matchesSearch = 
      conversation.policyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conversation.lastMessage.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conversation.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterType === 'all' || conversation.status === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const sortedConversations = [...filteredConversations].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return b.timestamp - a.timestamp;
      case 'oldest':
        return a.timestamp - b.timestamp;
      case 'messages':
        return b.messageCount - a.messageCount;
      case 'policy':
        return a.policyName.localeCompare(b.policyName);
      default:
        return 0;
    }
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'archived':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPolicyTypeColor = (type) => {
    switch (type) {
      case 'Insurance':
        return 'bg-blue-100 text-blue-800';
      case 'Privacy':
        return 'bg-purple-100 text-purple-800';
      case 'HR':
        return 'bg-orange-100 text-orange-800';
      case 'Finance':
        return 'bg-green-100 text-green-800';
      case 'Security':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (hours < 24) {
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else {
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
  };

  const handleContinueConversation = (conversationId, policyId) => {
    navigate(`/chat/${policyId}?conversation=${conversationId}`);
  };

  const handleDeleteConversation = (conversationId) => {
    // Handle delete logic here

  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-primary-50 via-white to-accent1-50 flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-secondary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading conversations...</p>
        </div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="bg-gradient-to-br from-primary-50 via-white to-accent1-50 flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare size={24} className="text-blue-500" />
          </div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">No Conversations Yet</h2>
          <p className="text-text-secondary mb-6">Start chatting with AI about your policies to see conversation history here.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-primary"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-primary-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Conversation History
          </h1>
          <p className="text-text-secondary">
            Review and continue your past AI conversations about policies
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-xl shadow-soft p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10 w-full"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter size={20} className="text-text-muted" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Clock size={20} className="text-text-muted" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
                >
                  <option value="recent">Most Recent</option>
                  <option value="oldest">Oldest First</option>
                  <option value="messages">Most Messages</option>
                  <option value="policy">Policy Name</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Conversations List */}
        <div className="space-y-4">
          {sortedConversations.map((conversation, index) => (
            <motion.div
              key={conversation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ y: -2 }}
              className="bg-white rounded-xl shadow-soft p-6 border border-gray-100 hover:shadow-glow transition-all duration-300"
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                {/* Main Content */}
                <div className="flex-1">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-accent1-500 to-accent2-500 rounded-xl flex items-center justify-center">
                      <MessageSquare size={24} className="text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-text-primary text-lg">
                          {conversation.policyName}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(conversation.status)}`}>
                          {conversation.status}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPolicyTypeColor(conversation.policyType)}`}>
                          {conversation.policyType}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-text-secondary mb-3">
                        <span className="flex items-center">
                          <Calendar size={16} className="mr-1" />
                          {formatTimestamp(conversation.timestamp)}
                        </span>
                        <span className="flex items-center">
                          <MessageSquare size={16} className="mr-1" />
                          {conversation.messageCount} messages
                        </span>
                        <span className="flex items-center">
                          <User size={16} className="mr-1" />
                          {conversation.participants[0]}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm text-text-secondary">Last question:</p>
                          <p className="text-text-primary font-medium">{conversation.lastMessage}</p>
                        </div>
                        <div>
                          <p className="text-sm text-text-secondary">AI response:</p>
                          <p className="text-text-primary line-clamp-2">{conversation.lastResponse}</p>
                        </div>
                      </div>
                      
                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {conversation.tags.map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="px-2 py-1 bg-primary-100 text-primary-800 rounded-full text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center space-x-2 lg:flex-col lg:items-end lg:space-y-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleContinueConversation(conversation.id, conversation.policyId)}
                    className="btn-primary"
                  >
                    Continue
                    <ArrowRight size={18} className="ml-2" />
                  </motion.button>
                  
                  <div className="flex items-center space-x-1">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 text-text-secondary hover:text-secondary-500 hover:bg-secondary-50 rounded-lg transition-colors duration-200"
                      title="Download"
                    >
                      <Download size={18} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 text-text-secondary hover:text-accent1-500 hover:bg-accent1-50 rounded-lg transition-colors duration-200"
                      title="Share"
                    >
                      <Share2 size={18} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 text-text-secondary hover:text-accent2-500 hover:bg-accent2-50 rounded-lg transition-colors duration-200"
                      title="Bookmark"
                    >
                      <Bookmark size={18} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 text-text-secondary hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      title="Delete"
                      onClick={() => handleDeleteConversation(conversation.id)}
                    >
                      <Trash2 size={18} />
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {sortedConversations.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <MessageSquare size={64} className="text-text-muted mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              {searchTerm || filterType !== 'all' ? 'No conversations found' : 'No conversations yet'}
            </h3>
            <p className="text-text-secondary mb-6">
              {searchTerm || filterType !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Start your first conversation by asking questions about your policies'
              }
            </p>
            {!searchTerm && filterType === 'all' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/dashboard')}
                className="btn-primary inline-flex items-center"
              >
                <FileText size={20} className="mr-2" />
                Browse Policies
              </motion.button>
            )}
          </motion.div>
        )}

        {/* Statistics */}
        {sortedConversations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="bg-white rounded-xl shadow-soft p-6 mt-8"
          >
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Conversation Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-text-primary">{conversations.length}</div>
                <div className="text-sm text-text-secondary">Total Conversations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {conversations.filter(c => c.status === 'active').length}
                </div>
                <div className="text-sm text-text-secondary">Active</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {conversations.reduce((sum, c) => sum + c.messageCount, 0)}
                </div>
                <div className="text-sm text-text-secondary">Total Messages</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent2-600">
                  {conversations.filter(c => c.policyType === 'Insurance').length}
                </div>
                <div className="text-sm text-text-secondary">Insurance Policies</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ConversationHistory;
