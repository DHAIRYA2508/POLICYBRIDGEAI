# 🚀 PolicyBridge AI

**AI-powered insurance policy analysis and comparison platform with intelligent chat capabilities**

[![React](https://img.shields.io/badge/React-18.0+-blue.svg)](https://reactjs.org/)
[![Django](https://img.shields.io/badge/Django-4.2+-green.svg)](https://www.djangoproject.com/)
[![Python](https://img.shields.io/badge/Python-3.8+-yellow.svg)](https://www.python.org/)
[![AI](https://img.shields.io/badge/AI-Gemini%202.5%20Flash-orange.svg)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 📖 Table of Contents

- [Overview](#-overview)
- [✨ Features](#-features)
- [🏗️ Architecture](#️-architecture)
- [🚀 Getting Started](#-getting-started)
- [📱 Screenshots](#-screenshots)
- [🔧 API Documentation](#-api-documentation)
- [🤖 AI Integration](#-ai-integration)
- [📊 Database Schema](#-database-schema)
- [🔐 Security Features](#-security-features)
- [📈 Project Evolution](#-project-evolution)
- [🤝 Contributing](#-contributing)
- [📝 License](#-license)

---

## 🌟 Overview

PolicyBridge AI is a comprehensive insurance policy management platform that leverages artificial intelligence to provide intelligent policy analysis, comparison, and interactive chat capabilities. Built with modern web technologies, it offers a seamless user experience for insurance professionals and policyholders alike.

### 🎯 **Key Benefits**
- **Intelligent Analysis**: AI-powered policy insights using Google Gemini
- **Real-time Chat**: Interactive policy consultation with conversation history
- **Smart Comparison**: Side-by-side policy analysis with detailed metrics
- **Secure Storage**: Enterprise-grade security with JWT authentication
- **Modern UI/UX**: Responsive design optimized for all devices

---

## ✨ Features

### 🤖 **AI-Powered Analysis**
- **Policy Summary Extraction**: Automatic extraction of key policy details
- **Intelligent Chat**: Context-aware conversations about specific policies
- **General Insurance Assistant**: Expert guidance on insurance topics
- **ML Insights**: Data-driven policy recommendations
- **Citation Tracking**: Source verification for all AI responses

### 📊 **Policy Management**
- **Document Upload**: Support for PDF and Word documents
- **Smart Extraction**: AI-powered text extraction and analysis
- **Policy Comparison**: Side-by-side analysis with detailed metrics
- **Search & Filter**: Advanced policy discovery and organization
- **Export Capabilities**: PDF generation with professional formatting

### 💬 **Interactive Chat System**
- **Policy-Specific Chat**: Context-aware conversations about uploaded policies
- **General Insurance Chat**: Expert guidance on insurance topics
- **Conversation History**: Persistent chat storage and retrieval
- **Real-time Responses**: Instant AI-powered answers
- **Chat Management**: Export, import, and clear conversation history

### 🔐 **Security & Authentication**
- **JWT Authentication**: Secure token-based authentication
- **User Management**: Registration, login, and profile management
- **Role-based Access**: Secure policy access control
- **Data Encryption**: Secure storage of sensitive information
- **Session Management**: Secure session handling

### 📱 **User Experience**
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Modern UI**: Clean, intuitive interface with Tailwind CSS
- **Real-time Updates**: Live data synchronization
- **Accessibility**: WCAG compliant design principles
- **Performance**: Optimized loading and rendering

---

## 🏗️ Architecture

### **Frontend Architecture**
```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/              # Main application pages
│   ├── context/            # React context providers
│   ├── services/           # API service layer
│   ├── utils/              # Utility functions
│   └── assets/             # Static assets
├── public/                 # Public assets
└── package.json            # Dependencies and scripts
```

**Technology Stack:**
- **Framework**: React.js 18+
- **Styling**: Tailwind CSS
- **State Management**: React Hooks (useState, useEffect, useContext)
- **HTTP Client**: Axios
- **Routing**: React Router DOM
- **Notifications**: React Hot Toast
- **Animations**: Framer Motion
- **Icons**: Lucide React

### **Backend Architecture**
```
backend/
├── policybridge_backend/   # Main Django project
├── ai/                    # AI services and models
├── policies/              # Policy management
├── users/                 # User authentication
├── static/                # Static files
└── manage.py              # Django management
```

**Technology Stack:**
- **Framework**: Django 4.2+
- **API**: Django REST Framework
- **Database**: SQLite (development) / PostgreSQL (production)
- **Authentication**: JWT with Django REST Framework
- **AI Integration**: Google Gemini API
- **File Processing**: PyPDF2, python-docx
- **Environment**: python-decouple

### **AI Integration Architecture**
```
User Input → Frontend → Backend API → Gemini AI → Response Processing → Frontend Display
    ↓
Conversation Storage → Database → Chat History → User Experience
```

**AI Capabilities:**
- **Model**: Gemini 2.5 Flash
- **Context Processing**: Policy document analysis
- **Response Generation**: Structured, informative answers
- **Learning**: Continuous improvement through user interactions

---

## 🚀 Getting Started

### **Prerequisites**
- **Node.js**: 16.0 or higher
- **Python**: 3.8 or higher
- **Git**: Latest version
- **Google Gemini API Key**: [Get your API key here](https://ai.google.dev/)

### **1. Clone the Repository**
```bash
git clone https://github.com/YOUR_USERNAME/PolicyBridge-AI.git
cd PolicyBridge-AI
```

### **2. Backend Setup**
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
cp .env.example .env
# Edit .env with your API keys

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Start backend server
python manage.py runserver
```

### **3. Frontend Setup**
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

### **4. Environment Configuration**
Create a `.env` file in the backend directory:

```env
# Django Settings
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DATABASE_URL=sqlite:///db.sqlite3

# AI Integration
GEMINI_API_KEY=your-gemini-api-key-here
GEMINI_MODEL=gemini-2.5-flash

# Security
JWT_SECRET_KEY=your-jwt-secret-key
```

---

## 📱 Screenshots

### **Dashboard Overview**
![Dashboard](screenshots/dashboard.png)
*Main dashboard showing policy overview, statistics, and quick actions*

### **Policy Management**
![Policy Management](screenshots/policy-management.png)
*Policy upload, editing, and management interface*

### **AI Chat Interface**
![AI Chat](screenshots/ai-chat.png)
*Intelligent chat system with policy context and conversation history*

### **Policy Comparison**
![Policy Comparison](screenshots/policy-comparison.png)
*Side-by-side policy analysis with detailed metrics*

### **Policy Details Extraction**
![Policy Details](screenshots/policy-details.png)
*AI-powered policy summary and key information extraction*

---

## 🔧 API Documentation

### **Authentication Endpoints**
```http
POST /api/auth/login/
POST /api/auth/register/
GET  /api/auth/profile/
POST /api/auth/logout/
```

### **Policy Management**
```http
GET    /api/policies/policies/           # List all policies
POST   /api/policies/policies/           # Upload new policy
GET    /api/policies/policies/{id}/      # Get policy details
PUT    /api/policies/policies/{id}/      # Update policy
DELETE /api/policies/policies/{id}/      # Delete policy
```

### **AI Services**
```http
POST /api/ai/extract-policy-details/     # Extract policy information
POST /api/ai/query-policy/              # Policy-specific chat
POST /api/ai/general-chat/              # General insurance chat
POST /api/ai/compare-policies/          # Compare two policies
```

### **Conversation Management**
```http
GET    /api/ai/conversations/           # List conversations
GET    /api/ai/conversations/{id}/      # Get conversation details
DELETE /api/ai/conversations/{id}/      # Delete conversation
```

---

## 🤖 AI Integration

### **Gemini AI Models**
- **Primary Model**: `gemini-2.5-flash`
- **Fallback Model**: `gemini-1.5-flash`
- **Cost Optimization**: Token usage tracking and optimization

### **AI Capabilities**
1. **Policy Analysis**
   - Document text extraction
   - Key information identification
   - Coverage analysis
   - Risk assessment

2. **Intelligent Chat**
   - Context-aware responses
   - Policy-specific guidance
   - General insurance education
   - Real-time assistance

3. **Policy Comparison**
   - Feature-by-feature analysis
   - Cost-benefit evaluation
   - Recommendation generation
   - Visual comparison tables

### **Prompt Engineering**
Our AI prompts are carefully crafted to:
- Provide clear, actionable responses
- Maintain consistency across interactions
- Ensure accuracy and reliability
- Follow ethical AI guidelines

---

## 📊 Database Schema

### **Core Models**
```python
# User Management
class User(AbstractUser):
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

# Policy Management
class Policy(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    provider = models.CharField(max_length=255)
    policy_type = models.CharField(max_length=100)
    document = models.FileField(upload_to='policies/')
    conversation_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

# AI Integration
class PolicyExtraction(models.Model):
    policy = models.OneToOneField(Policy, on_delete=models.CASCADE)
    extracted_text = models.TextField()
    summary = models.JSONField()
    ml_insights = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)

# Conversation Management
class Conversation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    conversation_type = models.CharField(max_length=20)
    policy = models.ForeignKey(Policy, null=True, blank=True)
    title = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

class Message(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE)
    message_type = models.CharField(max_length=20)
    content = models.TextField()
    citations = models.JSONField(default=list)
    ml_insights = models.JSONField(default=dict)
    tokens_used = models.PositiveIntegerField(null=True)
    created_at = models.DateTimeField(auto_now_add=True)
```

---

## 🔐 Security Features

### **Authentication & Authorization**
- **JWT Tokens**: Secure, stateless authentication
- **Password Hashing**: bcrypt-based password security
- **Session Management**: Secure session handling
- **CORS Protection**: Cross-origin request security
- **Rate Limiting**: API abuse prevention

### **Data Protection**
- **Input Validation**: Comprehensive input sanitization
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Cross-site scripting prevention
- **File Upload Security**: Secure file handling
- **Environment Variables**: Secure configuration management

### **Privacy & Compliance**
- **User Data Protection**: GDPR-compliant data handling
- **Audit Logging**: Comprehensive activity tracking
- **Data Encryption**: Secure data storage
- **Access Control**: Role-based permissions

---

## 📈 Project Evolution

### **Development Timeline**
```
Phase 1: Foundation (Commits a728fc0 - 7307e44)
├── Project architecture setup
├── Django backend foundation
├── React frontend structure
└── Basic authentication system

Phase 2: Core Features (Commits b2f2d2b - 67b6343)
├── Policy management system
├── File upload and processing
├── Basic UI components
└── Database models and migrations

Phase 3: AI Integration (Commits e5a8b29 - Latest)
├── Google Gemini AI integration
├── Policy analysis and comparison
├── Intelligent chat system
├── Conversation storage
└── Advanced UI/UX improvements
```

### **Key Milestones**
- ✅ **Project Foundation**: Complete backend and frontend setup
- ✅ **User Authentication**: Secure JWT-based authentication system
- ✅ **Policy Management**: Comprehensive policy CRUD operations
- ✅ **AI Integration**: Google Gemini AI implementation
- ✅ **Chat System**: Real-time AI chat with conversation storage
- ✅ **Policy Comparison**: Intelligent policy analysis and comparison
- ✅ **UI/UX**: Modern, responsive interface design
- ✅ **Security**: Enterprise-grade security implementation

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### **Getting Started**
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and commit: `git commit -m 'feat: Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### **Contribution Guidelines**
- Follow the existing code style and conventions
- Add tests for new functionality
- Update documentation as needed
- Ensure all tests pass before submitting
- Use conventional commit messages

### **Development Setup**
```bash
# Install development dependencies
pip install -r requirements-dev.txt
npm install --dev

# Run tests
python manage.py test
npm test

# Run linting
flake8 backend/
npm run lint
```

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### **MIT License Summary**
- ✅ **Commercial Use**: Allowed
- ✅ **Modification**: Allowed
- ✅ **Distribution**: Allowed
- ✅ **Private Use**: Allowed
- ⚠️ **Liability**: Limited
- ⚠️ **Warranty**: No warranty provided

---

## 🙏 Acknowledgments

- **Google Gemini AI**: For providing the AI capabilities
- **Django Community**: For the excellent web framework
- **React Community**: For the powerful frontend library
- **Open Source Contributors**: For the tools and libraries used

---

## 📞 Support & Contact

- **GitHub Issues**: [Report bugs or request features](https://github.com/YOUR_USERNAME/PolicyBridge-AI/issues)
- **Documentation**: [Full documentation](https://github.com/YOUR_USERNAME/PolicyBridge-AI/wiki)
- **Email**: [Your email address]
- **LinkedIn**: [Your LinkedIn profile]

---

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=YOUR_USERNAME/PolicyBridge-AI&type=Date)](https://star-history.com/#YOUR_USERNAME/PolicyBridge-AI&Date)

---

<div align="center">

**Made with ❤️ by [Your Name]**

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/YOUR_USERNAME)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/YOUR_USERNAME)
[![Portfolio](https://img.shields.io/badge/Portfolio-FF5722?style=for-the-badge&logo=todoist&logoColor=white)](https://your-portfolio.com)

</div>
