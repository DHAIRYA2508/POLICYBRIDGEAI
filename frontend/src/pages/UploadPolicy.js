import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { policyAPI } from '../services/api';
import toast from 'react-hot-toast';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  ArrowLeft,
  File,
  FileType,
  Trash2
} from 'lucide-react';

const UploadPolicy = () => {
  const navigate = useNavigate();
  const { requireAuth } = useAuth();
  const [files, setFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadErrors, setUploadErrors] = useState({});

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      if (!await requireAuth()) {
        return; // Will redirect to login if not authenticated
      }
    };
    checkAuth();
  }, [requireAuth]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = droppedFiles.filter(file => 
      file.type === 'application/pdf' || 
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.type === 'text/plain'
    );
    
    if (validFiles.length > 0) {
      addFiles(validFiles);
    }
  }, []);

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    addFiles(selectedFiles);
  };

  const addFiles = (newFiles) => {
    const filesWithIds = newFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'pending'
    }));
    
    setFiles(prev => [...prev, ...filesWithIds]);
  };

  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileId];
      return newProgress;
    });
    setUploadErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fileId];
      return newErrors;
    });
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'application/pdf':
        return <FileText size={24} className="text-red-500" />;
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return <File size={24} className="text-blue-500" />;
      case 'text/plain':
        return <FileType size={24} className="text-gray-500" />;
      default:
        return <File size={24} className="text-gray-500" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    
    // Upload files one by one
    for (const file of files) {
      if (file.status === 'pending') {
        try {
          setUploadProgress(prev => ({ ...prev, [file.id]: 0 }));
          
          // Create policy data
          const policyData = {
            name: file.name.replace(/\.[^/.]+$/, ''), // Remove file extension
            document: file.file,
            policy_type: 'other', // Default type, can be updated later
            provider: 'Unknown', // Default provider, can be updated later
            description: `Uploaded document: ${file.name}`,
            is_active: true
          };
          
          // Upload to backend
          const response = await policyAPI.createPolicy(policyData);
          
          if (response.data) {
            // Update file status
            setFiles(prev => prev.map(f => 
              f.id === file.id ? { ...f, status: 'completed' } : f
            ));
            
            setUploadProgress(prev => ({ ...prev, [file.id]: 100 }));
            toast.success(`${file.name} uploaded successfully!`);
          }
          
        } catch (error) {
          console.error('Upload error:', error);
          setUploadErrors(prev => ({ 
            ...prev, 
            [file.id]: error.response?.data?.detail || 'Upload failed' 
          }));
          setFiles(prev => prev.map(f => 
            f.id === file.id ? { ...f, status: 'error' } : f
          ));
          toast.error(`Failed to upload ${file.name}`);
        }
      }
    }
    
    setUploading(false);
    
    // Navigate to dashboard after successful upload
    setTimeout(() => {
      navigate('/dashboard');
    }, 2000);
  };

  const pendingFiles = files.filter(f => f.status === 'pending');
  const completedFiles = files.filter(f => f.status === 'completed');
  const errorFiles = files.filter(f => f.status === 'error');

  return (
    <div className="min-h-screen bg-primary-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
          
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Upload Policy Documents
          </h1>
          <p className="text-text-secondary">
            Upload your PDF, DOCX, or TXT files to start analyzing them with AI
          </p>
        </motion.div>

        {/* Upload Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div
            className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
              isDragOver
                ? 'border-secondary-500 bg-secondary-50 scale-105'
                : 'border-gray-300 hover:border-secondary-400 hover:bg-gray-50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <motion.div
              animate={{ scale: isDragOver ? 1.1 : 1 }}
              transition={{ duration: 0.2 }}
            >
              <Upload size={48} className="mx-auto text-text-muted mb-4" />
            </motion.div>
            
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              {isDragOver ? 'Drop files here' : 'Drag and drop files here'}
            </h3>
            <p className="text-text-secondary mb-6">
              or click to browse your computer
            </p>
            
            <label className="btn-primary inline-flex items-center cursor-pointer">
              <input
                type="file"
                multiple
                accept=".pdf,.docx,.txt"
                onChange={handleFileSelect}
                className="hidden"
              />
              Choose Files
            </label>
            
            <p className="text-sm text-text-muted mt-4">
              Supports PDF, DOCX, and TXT files up to 50MB each
            </p>
          </div>
        </motion.div>

        {/* File List */}
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-8"
          >
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Files to Upload ({files.length})
            </h3>
            
            <div className="space-y-4">
              {files.map((file, index) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-soft p-4 border border-gray-100"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {getFileIcon(file.type)}
                      <div className="flex-1">
                        <h4 className="font-medium text-text-primary">{file.name}</h4>
                        <p className="text-sm text-text-secondary">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {/* Progress Bar */}
                      {file.status === 'pending' && uploadProgress[file.id] !== undefined && (
                        <div className="w-24">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <motion.div
                              className="bg-secondary-500 h-2 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${uploadProgress[file.id]}%` }}
                              transition={{ duration: 0.3 }}
                            />
                          </div>
                          <p className="text-xs text-text-secondary mt-1">
                            {uploadProgress[file.id]}%
                          </p>
                        </div>
                      )}
                      
                      {/* Status Icons */}
                      {file.status === 'completed' && (
                        <CheckCircle size={20} className="text-green-500" />
                      )}
                      {file.status === 'error' && (
                        <AlertCircle size={20} className="text-red-500" />
                      )}
                      
                      {/* Remove Button */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removeFile(file.id)}
                        className="p-2 text-text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      >
                        <Trash2 size={18} />
                      </motion.button>
                    </div>
                  </div>
                  
                  {/* Error Message */}
                  {uploadErrors[file.id] && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-600 mt-2 flex items-center"
                    >
                      <AlertCircle size={16} className="mr-1" />
                      {uploadErrors[file.id]}
                    </motion.p>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Upload Summary */}
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-white rounded-xl shadow-soft p-6 mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-text-primary">{pendingFiles.length}</div>
                <div className="text-sm text-text-secondary">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{completedFiles.length}</div>
                <div className="text-sm text-text-secondary">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{errorFiles.length}</div>
                <div className="text-sm text-text-secondary">Errors</div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.button
                onClick={handleUpload}
                disabled={uploading || pendingFiles.length === 0}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <div className="flex items-center justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                    />
                    Uploading...
                  </div>
                ) : (
                  `Upload ${pendingFiles.length} File${pendingFiles.length !== 1 ? 's' : ''}`
                )}
              </motion.button>
              
              <motion.button
                onClick={() => setFiles([])}
                disabled={files.length === 0}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear All
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="bg-gradient-to-r from-accent2-50 to-accent1-50 rounded-xl p-6 border border-accent2-200"
        >
          <h3 className="text-lg font-semibold text-text-primary mb-3">
            💡 Upload Tips
          </h3>
          <ul className="space-y-2 text-text-secondary">
            <li className="flex items-start">
              <CheckCircle size={16} className="text-accent2-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>Ensure your documents are clear and readable for better AI analysis</span>
            </li>
            <li className="flex items-start">
              <CheckCircle size={16} className="text-accent2-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>PDF files provide the best text extraction quality</span>
            </li>
            <li className="flex items-start">
              <CheckCircle size={16} className="text-accent2-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>Large files may take longer to process</span>
            </li>
            <li className="flex items-start">
              <CheckCircle size={16} className="text-accent2-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>You can upload multiple files at once</span>
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

export default UploadPolicy;
