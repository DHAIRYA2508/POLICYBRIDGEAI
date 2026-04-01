import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import UploadPolicy from './pages/UploadPolicy';
import PolicyDetail from './pages/PolicyDetail';
import ChatView from './pages/ChatView';
import ComparePolicies from './pages/ComparePolicies';
import ConversationHistory from './pages/ConversationHistory';


// Context
import { AuthProvider } from './context/AuthContext';
import ToastProvider from './components/ToastProvider';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <div className="min-h-screen bg-bg-primary">
            <Navbar />
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/upload" element={<UploadPolicy />} />
                <Route path="/policy/:id" element={<PolicyDetail />} />
                <Route path="/chat/:policyId" element={<ChatView />} />
                <Route path="/chat" element={<ChatView />} />
                <Route path="/compare" element={<ComparePolicies />} />
                <Route path="/history" element={<ConversationHistory />} />

              </Routes>
            </AnimatePresence>
            <Footer />
          </div>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
