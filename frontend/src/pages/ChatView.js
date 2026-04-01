import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { policyAPI, aiAPI } from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { 
  Send, 
  ArrowLeft, 
  FileText, 
  User, 
  Bot, 
  Copy, 
  Download,
  Share2,
  MessageCircle,
  BarChart3
} from 'lucide-react';

const ChatView = () => {
  const { policyId } = useParams();
  const navigate = useNavigate();
  const { user, requireAuth } = useAuth();
  const messagesEndRef = useRef(null);
  const prevMessagesLength = useRef(0);
  const chatContainerRef = useRef(null);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Real policy data - will be fetched from backend
  const [policy, setPolicy] = useState(null);
  const [messages, setMessages] = useState([]);
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

  // Check if user is authenticated
  useEffect(() => {
    if (!user && !loading) {
      toast.error('Please log in to access AI chat');
      navigate('/login');
      return;
    }
  }, [user, loading, navigate]);



  // Load saved messages from backend or localStorage
  useEffect(() => {
    if (user) {
      const loadMessages = async () => {
        try {
          // Try to load from backend first
          const chatKey = policyId ? `chat_${policyId}` : 'general_chat';
          const savedMessages = localStorage.getItem(chatKey);
          
          if (savedMessages) {
            try {
              const parsedMessages = JSON.parse(savedMessages);
              // Convert timestamp strings back to Date objects
              const messagesWithDates = parsedMessages.map(msg => ({
                ...msg,
                timestamp: new Date(msg.timestamp)
              }));
              setMessages(messagesWithDates);
            } catch (error) {
              console.error('Error parsing saved messages:', error);
              localStorage.removeItem(chatKey);
            }
          } else {
            // Add welcome message for new chats
            const welcomeMessage = {
              id: Date.now(),
              type: 'ai',
              content: policyId 
                ? `Welcome! I'm here to help you understand your ${policy?.name || 'policy'}. Ask me anything about coverage, exclusions, claims, or any other policy-related questions.`
                : "Hello! I'm PolicyBridge AI, your insurance assistant. I can help you understand different types of insurance, explain policy terms, and answer your questions about coverage, claims, and more. How can I help you today?",
              timestamp: new Date(),
              citations: [],
              mlInsights: {}
            };
            setMessages([welcomeMessage]);
          }
        } catch (error) {
          console.error('Error loading messages:', error);
          // Fallback to welcome message
          const welcomeMessage = {
            id: Date.now(),
            type: 'ai',
            content: policyId 
              ? `Welcome! I'm here to help you understand your ${policy?.name || 'policy'}. Ask me anything about coverage, exclusions, claims, or any other policy-related questions.`
              : "Hello! I'm PolicyBridge AI, your insurance assistant. I can help you understand different types of insurance, explain policy terms, and answer your questions about coverage, claims, and more. How can I help you today?",
            timestamp: new Date(),
            citations: [],
            mlInsights: {}
          };
          setMessages([welcomeMessage]);
        }
      };
      
      loadMessages();
    }
  }, [user, policyId, policy?.name]);

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    if (user && messages.length > 0) {
      const chatKey = policyId ? `chat_${policyId}` : 'general_chat';
      localStorage.setItem(chatKey, JSON.stringify(messages));
    }
  }, [messages, user, policyId]);

  // Fetch policy data and conversation history
  useEffect(() => {
    if (!user) return; // Don't fetch if not authenticated
    
    const fetchPolicyData = async () => {
      try {
        setLoading(true);
        
        if (policyId) {
          // Fetch specific policy data from backend
          const policyResponse = await policyAPI.getPolicy(policyId);
          setPolicy(policyResponse.data);
        } else {
          // General policy chat - no specific policy
          setPolicy({
            name: 'General Policy Assistant',
            description: 'Ask me anything about insurance policies, coverage, claims, and more!'
          });
        }
        
        // Don't reset messages here - they're loaded from localStorage
      } catch (error) {
        console.error('Error fetching policy data:', error);
        if (policyId) {
          toast.error('Failed to load policy data');
        }
        // For general chat, set a default policy object
        setPolicy({
          name: 'General Policy Assistant',
          description: 'Ask me anything about insurance policies, coverage, claims, and more!'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPolicyData();
  }, [policyId, user]);

  useEffect(() => {
    // Only scroll to bottom when new messages are added, not on initial load
    if (messages.length > 0 && !isInitialLoad && messages.length > prevMessagesLength.current) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        forceScrollToBottom();
      }, 150);
    }
    prevMessagesLength.current = messages.length;
  }, [messages, isInitialLoad]);

  // Set initial load to false after messages are loaded
  useEffect(() => {
    if (messages.length > 0 && isInitialLoad) {
      setIsInitialLoad(false);
    }
  }, [messages, isInitialLoad]);

  // Ensure chat starts at top on initial load
  useEffect(() => {
    if (!loading && messages.length > 0 && isInitialLoad) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        scrollToTop();
      }, 100);
    }
  }, [loading, messages.length, isInitialLoad]);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      // Only auto-scroll if user is already near the bottom (within 200px)
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 200;
      
      if (isNearBottom) {
        chatContainerRef.current.scrollTo({ 
          top: chatContainerRef.current.scrollHeight, 
          behavior: 'smooth' 
        });
      }
    }
  };

  const forceScrollToBottom = () => {
    if (chatContainerRef.current) {
      // Use immediate scroll for better reliability
      chatContainerRef.current.scrollTo({ 
        top: chatContainerRef.current.scrollHeight, 
        behavior: 'auto' 
      });
      
      // Also try using scrollIntoView as a fallback
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'auto', block: 'end' });
      }
    }
  };

  const scrollToTop = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const clearChatHistory = () => {
    const chatKey = policyId ? `chat_${policyId}` : 'general_chat';
    localStorage.removeItem(chatKey);
    setMessages([]);
    setIsInitialLoad(true); // Reset initial load state
    toast.success('Chat history cleared');
  };

  const exportChatHistory = () => {
    if (messages.length === 0) {
      toast.error('No messages to export');
      return;
    }

    const chatData = {
      policy: policyId ? policy?.name : 'General Chat',
      timestamp: new Date().toISOString(),
      messages: messages.map(msg => ({
        type: msg.type,
        content: msg.content,
        timestamp: msg.timestamp.toISOString()
      }))
    };

    const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-history-${policyId || 'general'}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Chat history exported successfully');
  };

  const importChatHistory = () => {
    // Instead of importing chat history, show available policies
    // This will help users start conversations about specific policies
    const showPolicySelection = () => {
      // Create a modal-like overlay to show policy selection
      const modal = document.createElement('div');
      modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
      modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">Select a Policy to Chat About</h3>
            <button id="closeModal" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <div id="policyList" class="space-y-3">
            <div class="text-center py-4">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p class="text-gray-500 mt-2">Loading policies...</p>
            </div>
          </div>
          <div class="mt-4 text-center">
            <p class="text-sm text-gray-500">Select a policy to start a new conversation about it</p>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      // Close modal functionality
      const closeModal = () => {
        document.body.removeChild(modal);
      };
      
      modal.querySelector('#closeModal').addEventListener('click', closeModal);
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
      });
      
      // Load policies from the dashboard
      const loadPolicies = async () => {
        try {
          const response = await policyAPI.getPolicies();
          const policies = response.data.results || response.data || [];
          
          const policyList = modal.querySelector('#policyList');
          
          if (policies.length === 0) {
            policyList.innerHTML = `
              <div class="text-center py-6">
                <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </div>
                <p class="text-gray-600 font-medium">No policies found</p>
                <p class="text-gray-500 text-sm">Upload a policy document first to start chatting about it</p>
                <button onclick="window.location.href='/upload-policy'" class="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  Upload Policy
                </button>
              </div>
            `;
            return;
          }
          
          policyList.innerHTML = policies.map(policy => `
            <div class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer policy-item ${policy.id === policyId ? 'ring-2 ring-blue-500 bg-blue-50' : ''}" data-policy-id="${policy.id}">
              <div class="flex items-start space-x-3">
                <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center space-x-2">
                    <h4 class="text-sm font-medium text-gray-900 truncate">${policy.name || 'Untitled Policy'}</h4>
                    ${policy.id === policyId ? '<span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">Current</span>' : ''}
                  </div>
                  <p class="text-xs text-gray-500 mt-1">
                    ${policy.policy_type || 'Insurance'} • ${policy.provider || 'Unknown Provider'}
                  </p>
                  <p class="text-xs text-gray-400 mt-1">
                    Uploaded: ${new Date(policy.created_at || policy.upload_date).toLocaleDateString()}
                  </p>
                </div>
                <div class="flex-shrink-0">
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </div>
              </div>
            </div>
          `).join('');
          
          // Add click handlers to policy items
          policyList.querySelectorAll('.policy-item').forEach(item => {
            item.addEventListener('click', () => {
              const selectedPolicyId = item.dataset.policyId;
              closeModal();
              
              // Navigate to the policy-specific chat
              if (selectedPolicyId !== policyId) {
                navigate(`/chat/${selectedPolicyId}`);
                toast.success('Switched to policy chat!');
              } else {
                toast.info('You are already in this policy\'s chat');
              }
            });
          });
          
        } catch (error) {
          console.error('Error loading policies:', error);
          const policyList = modal.querySelector('#policyList');
          policyList.innerHTML = `
            <div class="text-center py-6">
              <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
              </div>
              <p class="text-red-600 font-medium">Failed to load policies</p>
              <p class="text-gray-500 text-sm">Please try again or check your connection</p>
              <button onclick="location.reload()" class="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                Retry
              </button>
            </div>
          `;
        }
      };
      
      // Load policies after modal is shown
      setTimeout(loadPolicies, 100);
    };
    
    showPolicySelection();
  };

  const handleSendMessage = async (customMessage = null) => {
    const messageToSend = customMessage || message.trim();
    if (!messageToSend) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: messageToSend,
      timestamp: new Date(),
      citations: []
    };

    setMessages(prev => [...prev, userMessage]);
    if (!customMessage) {
      setMessage('');
    }
    setIsTyping(true);
    
    // Ensure scroll to bottom after adding user message
    setTimeout(() => {
      forceScrollToBottom();
    }, 50);

    try {

      
      let response;
      
      if (policyId) {
        // Policy-specific chat

        response = await aiAPI.queryPolicy({
          policy_id: policyId,
          question: messageToSend,
          analysis_type: 'general'
        });
      } else {
        // General policy chat - use the new general chat endpoint

        response = await aiAPI.generalChat(messageToSend);
      }

      

      const aiResponse = {
        id: Date.now() + 1,
        type: 'ai',
        content: response.response || response.message || 'No response content received',
        timestamp: new Date(),
        citations: response.citations || [],
        mlInsights: response.ml_insights || {},
        conversationId: response.conversation_id,
        messageId: response.message_id
      };

      setMessages(prev => [...prev, aiResponse]);
      
      // Ensure scroll to bottom after AI response
      setTimeout(() => {
        forceScrollToBottom();
      }, 100);
      
      // Store conversation in backend (already done by the API)
      
    } catch (error) {
      console.error('❌ Error getting AI response:', error);
      console.error('❌ Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
      
      let errorMessage = 'Sorry, I encountered an error while processing your request. Please try again.';
      
      // Provide more specific error messages
      if (error.response?.status === 401) {
        errorMessage = 'Authentication error. Please log in again.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Access denied. You may not have permission to use this feature.';
      } else if (error.response?.status === 404) {
        errorMessage = 'AI service endpoint not found. Please contact support.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. The AI service is temporarily unavailable.';
      } else if (error.response?.status === 503) {
        errorMessage = 'AI service is currently unavailable. Please try again later.';
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Network error. Please check your internet connection.';
      }
      
      toast.error(errorMessage);
      
      // Add error message
      const errorResponse = {
        id: Date.now() + 1,
        type: 'ai',
        content: errorMessage,
        timestamp: new Date(),
        citations: []
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };



  const copyMessage = (content) => {
    navigator.clipboard.writeText(content);
    // You could add a toast notification here
  };

  const formatTimestamp = (timestamp) => {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4 shadow-lg"></div>
          <p className="text-gray-600">
            {policyId ? 'Loading policy data...' : 'Starting policy assistant...'}
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <User size={24} className="text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please log in to access AI chat functionality.</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (!policy) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <FileText size={24} className="text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Policy Not Found</h2>
          <p className="text-gray-600 mb-4">The policy you're looking for doesn't exist or you don't have access to it.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(-1)}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </motion.button>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <MessageCircle size={20} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    {policyId ? `Policy Chat - ${policy?.name || 'Unknown Policy'}` : 'AI Insurance Assistant'}
                  </h1>
                  <p className="text-sm text-gray-600">
                    {policyId ? 'Ask questions about your specific policy' : 'Get help with general insurance questions'}
                    {messages.length > 0 && (
                      <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        {messages.length} message{messages.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {policyId && (
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{policy?.policy_type || 'Policy Type'}</p>
                  <p className="text-xs text-gray-500">{policy?.provider || 'Provider'}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                  <FileText size={20} className="text-white" />
                </div>
              </div>
            )}
            
            {/* Manual Scroll to Bottom Button */}
            {messages.length > 0 && (
              <div className="absolute top-4 right-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={scrollToBottom}
                  className="bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg border border-blue-200 px-3 py-2 transition-colors duration-200"
                  title="Scroll to bottom"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Chat Messages */}
          <div className="min-h-[600px] h-[600px] overflow-y-auto p-6 bg-gradient-to-b from-gray-50 to-white" ref={chatContainerRef}>
            {/* Chat Header with Counter */}
            {messages.length > 0 && (
              <div className="mb-6 pb-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-lg font-semibold text-gray-800">
                    Conversation History
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600">
                      Total Messages: <span className="font-semibold text-blue-600">{messages.length}</span>
                    </span>
                    <span className="text-sm text-gray-600">
                      AI Responses: <span className="font-semibold text-emerald-600">{messages.filter(m => m.type === 'ai').length}</span>
                    </span>
                    <span className="text-sm text-gray-600">
                      Your Messages: <span className="font-semibold text-indigo-600">{messages.filter(m => m.type === 'user').length}</span>
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={importChatHistory}
                      className="px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 text-xs font-medium rounded-lg transition-colors duration-200 border border-purple-200"
                      title="Select a policy to chat about"
                    >
                      Select Policy
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={exportChatHistory}
                      className="px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 text-xs font-medium rounded-lg transition-colors duration-200 border border-green-200"
                      title="Export chat history"
                    >
                      Export
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={clearChatHistory}
                      className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-medium rounded-lg transition-colors duration-200 border border-red-200"
                      title="Clear chat history"
                    >
                      Clear Chat
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={scrollToTop}
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition-colors duration-200 border border-gray-200"
                      title="Scroll to top"
                    >
                      ↑ Top
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={forceScrollToBottom}
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition-colors duration-200 border border-gray-200"
                      title="Scroll to bottom"
                    >
                      ↓ Bottom
                    </motion.button>
                  </div>
                </div>
              </div>
            )}
            
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full space-y-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center">
                  <Bot size={32} className="text-blue-600" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {policyId ? 'Start chatting about your policy' : 'Welcome to PolicyBridge AI'}
                  </h3>
                  <p className="text-gray-600 max-w-md mb-6">
                    {policyId 
                      ? 'Ask me anything about your policy document. I can help explain coverage, exclusions, claims process, and more.'
                      : 'I\'m here to help with all your insurance questions. Ask me about different types of coverage, policy terms, or general insurance advice.'
                    }
                  </p>
                  
                </div>
                
                                  {/* Quick Start Questions */}
                <div className="w-full max-w-2xl">
                  <div className="text-lg font-medium text-gray-800 mb-4 text-center">Quick Start Questions</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {policyId ? (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSendMessage('What is covered under this policy?')}
                        className="p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors duration-200"
                      >
                        <p className="text-sm font-medium text-blue-900">What is covered?</p>
                        <p className="text-xs text-blue-700">Understand your coverage details</p>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSendMessage('What are the exclusions?')}
                        className="p-3 text-left bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 transition-colors duration-200"
                      >
                        <p className="text-sm font-medium text-orange-900">What\'s excluded?</p>
                        <p className="text-xs text-orange-700">Know what\'s not covered</p>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSendMessage('How do I file a claim?')}
                        className="p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors duration-200"
                      >
                        <p className="text-sm font-medium text-green-900">Claims process</p>
                        <p className="text-xs text-green-700">Step-by-step guide</p>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSendMessage('What is the premium and sum assured?')}
                        className="p-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors duration-200"
                      >
                        <p className="text-sm font-medium text-purple-900">Cost & benefits</p>
                        <p className="text-xs text-purple-700">Premium and coverage amounts</p>
                      </motion.button>
                    </>
                  ) : (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSendMessage('What is term life insurance?')}
                        className="p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors duration-200"
                      >
                        <p className="text-sm font-medium text-blue-900">Term Life Insurance</p>
                        <p className="text-xs text-blue-700">Basic coverage explanation</p>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSendMessage('What is the difference between health and life insurance?')}
                        className="p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors duration-200"
                      >
                        <p className="text-sm font-medium text-green-900">Insurance Types</p>
                        <p className="text-xs text-green-700">Compare different policies</p>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSendMessage('How do I choose the right insurance policy?')}
                        className="p-3 text-left bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 transition-colors duration-200"
                      >
                        <p className="text-sm font-medium text-orange-900">Policy Selection</p>
                        <p className="text-xs text-orange-700">Tips for choosing wisely</p>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSendMessage('What are common insurance terms I should know?')}
                        className="p-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors duration-200"
                      >
                        <p className="text-sm font-medium text-purple-900">Insurance Terms</p>
                        <p className="text-xs text-purple-700">Key terminology explained</p>
                      </motion.button>
                    </>
                  )}
                  </div>
                  

                </div>
              </div>
            ) : (
              messages.map((msg, index) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`mb-6 flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-3 max-w-4xl ${msg.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    {/* Avatar */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.type === 'user' 
                        ? 'bg-gradient-to-br from-blue-500 to-indigo-600' 
                        : 'bg-gradient-to-br from-emerald-500 to-teal-600'
                    }`}>
                      {msg.type === 'user' ? (
                        <User size={20} className="text-white" />
                      ) : (
                        <Bot size={20} className="text-white" />
                      )}
                    </div>

                    {/* Message Content */}
                    <div className={`flex-1 ${msg.type === 'user' ? 'text-right' : 'text-left'}`}>
                      <div className={`inline-block rounded-2xl px-6 py-4 shadow-lg ${
                        msg.type === 'user'
                          ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white'
                          : 'bg-white border border-gray-200 text-gray-900'
                      }`}>
                        <div className="prose prose-sm max-w-none">
                          {msg.content.split('\n').map((line, lineIndex) => (
                            <p key={lineIndex} className={lineIndex > 0 ? 'mt-2' : ''}>
                              {line}
                            </p>
                          ))}
                        </div>
                      </div>

                      {/* ML Insights */}
                      {msg.mlInsights && Object.keys(msg.mlInsights).length > 0 && (
                        <div className="mt-3 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
                          <div className="text-sm font-semibold text-emerald-800 mb-2 flex items-center">
                            <BarChart3 size={16} className="mr-2" />
                            AI Insights
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {msg.mlInsights.risk_level && (
                              <div className="text-xs bg-emerald-100 rounded-lg px-3 py-2">
                                <span className="font-medium text-emerald-800">Risk:</span> {msg.mlInsights.risk_level}
                              </div>
                            )}
                            {msg.mlInsights.coverage_score && (
                              <div className="text-xs bg-teal-100 rounded-lg px-3 py-2">
                                <span className="font-medium text-teal-800">Coverage Score:</span> {msg.mlInsights.coverage_score}
                              </div>
                            )}
                            {msg.mlInsights.recommendations && (
                              <div className="text-xs bg-blue-100 rounded-lg px-3 py-2 col-span-full">
                                <span className="font-medium text-blue-800">Recommendations:</span> {msg.mlInsights.recommendations}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Message Actions */}
                      <div className={`flex items-center justify-between mt-3 ${
                        msg.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        <span className="text-xs">{formatTimestamp(msg.timestamp)}</span>
                        {msg.type === 'ai' && (
                          <div className="flex items-center space-x-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => copyMessage(msg.content)}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                              title="Copy message"
                            >
                              <Copy size={14} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                const blob = new Blob([msg.content], { type: 'text/plain' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `policy-chat-${new Date().toISOString().split('T')[0]}.txt`;
                                a.click();
                                URL.revokeObjectURL(url);
                                toast.success('Chat downloaded!');
                              }}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                              title="Download message"
                            >
                              <Download size={14} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                if (navigator.share) {
                                  navigator.share({
                                    title: 'Policy Chat',
                                    text: msg.content.substring(0, 100) + '...',
                                    url: window.location.href
                                  });
                                } else {
                                  copyMessage(msg.content);
                                  toast.success('Message copied to clipboard!');
                                }
                              }}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                              title="Share message"
                            >
                              <Share2 size={14} />
                            </motion.button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
            
            {/* Typing Indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 flex justify-start"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <Bot size={20} className="text-white" />
                  </div>
                  <div className="bg-white shadow-lg border border-gray-200 rounded-2xl px-6 py-4">
                    <div className="flex space-x-2">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                        className="w-3 h-3 bg-emerald-500 rounded-full"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                        className="w-3 h-3 bg-emerald-500 rounded-full"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                        className="w-3 h-3 bg-emerald-500 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 bg-white p-6">
            <div className="flex items-end space-x-4">
              <div className="flex-1">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                      // Ensure scroll to bottom after sending message
                      setTimeout(() => {
                        forceScrollToBottom();
                      }, 50);
                    }
                  }}
                  placeholder={policyId 
                    ? "Ask me anything about your policy..." 
                    : "Ask me about insurance..."
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
                  rows={3}
                  disabled={isTyping}
                />
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSendMessage()}
                disabled={!message.trim() || isTyping}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 ${
                  !message.trim() || isTyping
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl'
                }`}
              >
                <Send size={18} />
                <span>Send</span>
              </motion.button>
            </div>
            
            {/* Character count and tips */}
            <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
              <span>{message.length}/1000 characters</span>
              <span>Press Enter to send, Shift+Enter for new line</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatView;
