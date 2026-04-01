import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { TypeAnimation } from 'react-type-animation';
import { 
  ArrowRightIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  RocketLaunchIcon,
  CheckIcon,
  TrophyIcon,
  SparklesIcon,
  ShieldCheckIcon,
  CpuChipIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const Home = () => {
  const auth = useAuth();
  const user = auth?.user || null;
  const ref = useRef(null);

  // Don't automatically validate token on home page
  // Users must explicitly log in to access authenticated features

  const features = [
    {
      icon: DocumentTextIcon,
      title: "Smart Policy Analysis",
      description: "AI-powered document processing with intelligent insights and recommendations",
      color: "from-primary-500 to-primary-600"
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: "Interactive Q&A",
      description: "Ask questions about your policies and get instant, accurate answers",
      color: "from-secondary-500 to-secondary-600"
    },
    {
      icon: ChartBarIcon,
      title: "Policy Comparison",
      description: "Compare multiple policies side-by-side with detailed analysis",
      color: "from-accent1-500 to-accent1-600"
    },
    {
      icon: ShieldCheckIcon,
      title: "Compliance Tracking",
      description: "Monitor policy compliance and get automated alerts",
      color: "from-accent2-500 to-accent2-600"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Legal Director",
      company: "TechCorp Inc.",
      content: "PolicyBridge AI has revolutionized how we handle policy management. The AI insights are incredibly accurate.",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
    },
    {
      name: "Michael Chen",
      role: "Compliance Officer",
      company: "Global Finance",
      content: "The policy comparison feature saves us hours of manual work. Highly recommended for any compliance team.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
    },
    {
      name: "Emily Rodriguez",
      role: "HR Manager",
      company: "StartupXYZ",
      content: "User-friendly interface with powerful AI capabilities. It's like having a legal expert on our team.",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
    }
  ];

  const stats = [
    { number: "10K+", label: "Policies Analyzed", color: "text-primary-500" },
    { number: "95%", label: "Accuracy Rate", color: "text-secondary-500" },
    { number: "500+", label: "Happy Clients", color: "text-accent1-500" },
    { number: "24/7", label: "AI Support", color: "text-accent2-500" }
  ];

  const pricingPlans = [
    {
      name: "Free Trial",
      price: "₹0",
      duration: "3 Policies",
      description: "Perfect for trying out PolicyBridge AI",
      features: [
        "Analyze up to 3 policies",
        "Basic AI insights",
        "Policy comparison (2 policies)",
        "Email support",
        "7-day trial period"
      ],
      buttonText: "Start Free Trial",
      buttonLink: "/signup",
      popular: false,
      color: "from-gray-500 to-gray-600"
    },
    {
      name: "Premium",
      price: "₹299",
      duration: "per month",
      description: "Unlimited access to all features",
      features: [
        "Unlimited policy analysis",
        "Advanced AI insights with Gemini 2.5 Flash",
        "Unlimited policy comparisons",
        "PDF export & sharing",
        "Priority support",
        "Advanced analytics dashboard",
        "Custom policy templates",
        "Team collaboration features"
      ],
      buttonText: "Get Premium",
      buttonLink: "/signup",
      popular: true,
      color: "from-primary-500 to-accent3-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-50/30 to-transparent"></div>
        
        {/* Background Decorative Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-secondary-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-1/4 w-20 h-20 bg-accent1-200/20 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto text-center">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="mb-8 flex justify-center"
          >
            <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <div className="relative">
                <ShieldCheckIcon className="w-10 h-10 text-white" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center">
                  <CpuChipIcon className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-light mb-6">
              <motion.span 
                className="text-6xl md:text-7xl lg:text-8xl font-light text-primary-500/70"
                animate={{ 
                  opacity: [0.6, 0.8, 0.6],
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                PolicyBridge
              </motion.span>
              <br />
              <motion.span 
                className="text-5xl md:text-6xl lg:text-7xl font-light text-secondary-500/70"
                animate={{ 
                  opacity: [0.6, 0.8, 0.6],
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.8
                }}
              >
                AI
              </motion.span>
            </h1>
            <div className="text-xl md:text-2xl lg:text-3xl text-gray-600 mb-8 font-light">
              <TypeAnimation
                sequence={[
                  'Transform your policy management with AI',
                  2000,
                  'Get instant insights from complex documents',
                  2000,
                  'Ensure compliance with confidence',
                  2000,
                  'Make informed decisions faster',
                  2000,
                ]}
                wrapper="span"
                speed={50}
                repeat={Infinity}
                className="text-primary-500/80 font-light"
              />
            </div>
            <p className="text-lg md:text-xl text-gray-500 max-w-3xl mx-auto mb-12 font-light leading-relaxed">
              Leverage the power of artificial intelligence to analyze, understand, and manage your policy documents with unprecedented accuracy and speed.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
          >
            <Link
              to="/signup"
              className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-medium py-4 px-10 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-xl whitespace-nowrap text-lg"
            >
              Get Started Free
              <ArrowRightIcon className="w-6 h-6 ml-3" />
            </Link>
          </motion.div>

          {!user && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-center"
            >
              <p className="text-gray-500 mb-2">Already have an account?</p>
              <Link
                to="/login"
                className="text-primary-500 hover:text-primary-600 font-medium underline underline-offset-2"
              >
                Sign in here
              </Link>
            </motion.div>
          )}

          {/* Free Trial Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-12 bg-gradient-to-r from-green-50 to-emerald-100 border border-green-200 rounded-2xl p-6 max-w-2xl mx-auto"
          >
            <div className="flex items-center justify-center gap-3 mb-3">
              <SparklesIcon className="w-6 h-6 text-green-600" />
              <span className="text-lg font-semibold text-green-800">Free Trial Available!</span>
            </div>
            <p className="text-green-700 mb-4">
              Try PolicyBridge AI completely free for 3 policies. No credit card required!
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-green-600">
              <span className="flex items-center gap-1">
                <CheckIcon className="w-4 h-4" />
                3 policies free
              </span>
              <span className="flex items-center gap-1">
                <CheckIcon className="w-4 h-4" />
                Full AI features
              </span>
              <span className="flex items-center gap-1">
                <CheckIcon className="w-4 h-4" />
                No time limit
              </span>
            </div>
          </motion.div>
        </div>

        {/* Hero Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-16 flex justify-center"
        >
          <div className="relative">
            <div className="w-full max-w-4xl h-64 md:h-80 bg-gradient-to-r from-blue-50 to-indigo-100 rounded-3xl border border-blue-200 overflow-hidden shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-100/30 to-secondary-100/30"></div>
              <div className="relative z-10 p-8 text-center">
                <div className="flex items-center justify-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary-400 to-primary-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <DocumentTextIcon className="w-8 h-8 text-white" />
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-r from-secondary-400 to-secondary-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <ChatBubbleLeftRightIcon className="w-8 h-8 text-white" />
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-r from-accent1-400 to-accent1-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <ChartBarIcon className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-medium text-gray-700 mb-3">AI-Powered Policy Analysis</h3>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Upload your documents and watch as our AI extracts insights, compares policies, and provides actionable recommendations in seconds.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/80">
        <div className="max-w-7xl mx-auto">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-gray-800 mb-6">
              Why Choose <span className="text-primary-500 font-medium">PolicyBridge AI</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light">
              Our cutting-edge AI technology delivers unmatched accuracy and insights for policy analysis and management.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features && features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-primary-200 transition-all duration-300 hover:shadow-lg relative overflow-hidden"
              >
                {/* Background decorative element */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary-100/20 to-transparent rounded-full -translate-y-10 translate-x-10"></div>
                
                <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center shadow-lg relative z-10`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4 relative z-10">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed relative z-10">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-10 left-10 w-40 h-40 bg-primary-200/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-secondary-200/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-gray-800 mb-6">
              Simple, Transparent <span className="text-primary-500 font-medium">Pricing</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light">
              Start free, upgrade when you're ready. No hidden fees, no surprises.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {pricingPlans && pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className={`relative ${plan.popular ? 'lg:scale-105' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-primary-400 to-primary-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-md">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className={`bg-white rounded-2xl p-8 text-center border border-gray-200 hover:border-primary-300 transition-all duration-300 hover:shadow-lg relative overflow-hidden ${plan.popular ? 'border-primary-300 shadow-lg' : ''}`}>
                  {/* Background decorative element */}
                  <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${plan.color} opacity-10 rounded-full -translate-y-12 translate-x-12`}></div>
                  
                  <div className={`w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r ${plan.color} flex items-center justify-center shadow-md relative z-10`}>
                    {plan.popular ? (
                      <TrophyIcon className="w-10 h-10 text-white" />
                    ) : (
                      <SparklesIcon className="w-10 h-10 text-white" />
                    )}
                  </div>
                  
                  <h3 className="text-2xl font-medium text-gray-800 mb-2 relative z-10">{plan.name}</h3>
                  <div className="mb-4 relative z-10">
                    <span className="text-4xl font-light text-gray-800">{plan.price}</span>
                    <span className="text-gray-600 ml-2">{plan.duration}</span>
                  </div>
                  <p className="text-gray-600 mb-6 font-light relative z-10">{plan.description}</p>
                  
                  <ul className="text-left space-y-3 mb-8 relative z-10">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-3">
                        <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-600 font-light">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link
                    to={plan.buttonLink}
                    className={`w-full py-3 px-6 rounded-full font-medium transition-all duration-300 transform hover:scale-105 whitespace-nowrap relative z-10 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-primary-400 to-primary-500 hover:from-primary-500 hover:to-primary-600 text-white shadow-md hover:shadow-lg'
                        : 'bg-white text-gray-800 border border-gray-200 hover:border-primary-300 hover:bg-primary-50 shadow-sm hover:shadow-md'
                    }`}
                  >
                    {plan.buttonText}
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-secondary-600 to-secondary-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats && stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className={`text-4xl md:text-5xl lg:text-6xl font-bold ${stat.color} mb-2`}>
                  {stat.number}
                </div>
                <div className="text-lg text-white/90 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-20 right-20 w-40 h-40 bg-accent1-200/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-32 h-32 bg-primary-200/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-gray-800 mb-6">
              How It <span className="text-primary-500 font-medium">Works</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light">
              Get started with PolicyBridge AI in three simple steps
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Upload Your Policy",
                description: "Simply drag and drop your policy documents or use our secure file upload system",
                icon: DocumentTextIcon,
                color: "from-blue-500 to-blue-600",
                bgColor: "from-blue-50 to-blue-100",
                borderColor: "border-blue-200"
              },
              {
                step: "02",
                title: "AI Analysis",
                description: "Our advanced AI processes your documents and extracts key information automatically",
                icon: RocketLaunchIcon,
                color: "from-purple-500 to-purple-600",
                bgColor: "from-purple-50 to-purple-100",
                borderColor: "border-purple-200"
              },
              {
                step: "03",
                title: "Get Insights",
                description: "Receive comprehensive analysis, recommendations, and answers to your questions",
                icon: ChatBubbleLeftRightIcon,
                color: "from-emerald-500 to-emerald-600",
                bgColor: "from-emerald-50 to-emerald-100",
                borderColor: "border-emerald-200"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="relative group"
              >
                <div className={`bg-gradient-to-br ${item.bgColor} rounded-3xl p-8 text-center border ${item.borderColor} transition-all duration-500 hover:shadow-2xl hover:scale-105 relative overflow-hidden h-full flex flex-col justify-between`}>
                  {/* Background decorative element */}
                  <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${item.color} opacity-5 rounded-full -translate-y-12 translate-x-12 group-hover:scale-125 transition-transform duration-500`}></div>
                  
                  {/* Step number - just the number alone, no shape */}
                  <div className="relative mb-8">
                    <div className="text-6xl font-bold text-gray-800 opacity-20 group-hover:opacity-30 transition-opacity duration-300">
                      {item.step}
                    </div>
                  </div>
                  
                  {/* Icon with enhanced styling */}
                  <div className={`w-14 h-14 mx-auto mb-6 rounded-xl bg-gradient-to-r ${item.color} flex items-center justify-center shadow-lg relative z-10 transform group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 relative z-10 group-hover:text-gray-900 transition-colors duration-300">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed font-light relative z-10 group-hover:text-gray-700 transition-colors duration-300">{item.description}</p>
                  
                  {/* Subtle hover effect */}
                  <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${item.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/80 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-accent1-200/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-28 h-28 bg-primary-200/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-gray-800 mb-6">
              What Our <span className="text-primary-500 font-medium">Clients Say</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light">
              Join thousands of satisfied users who trust PolicyBridge AI for their policy management needs
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials && testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-primary-200 transition-all duration-300 hover:shadow-md relative overflow-hidden"
              >
                {/* Background decorative element */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-primary-100/20 to-transparent rounded-full -translate-y-8 translate-x-8"></div>
                
                <div className="flex items-center mb-6 relative z-10">
                  <div className="flex -space-x-2">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon key={i} className="w-5 h-5 text-primary-400 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed font-light relative z-10">"{testimonial.content}"</p>
                <div className="flex items-center relative z-10">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4 border-2 border-primary-200"
                  />
                  <div>
                    <div className="font-medium text-gray-800">{testimonial.name}</div>
                    <div className="text-sm text-gray-600 font-light">{testimonial.role} at {testimonial.company}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary-500 to-primary-600 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-28 h-28 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-white mb-6">
              Ready to Transform Your <span className="font-medium">Policy Management</span>?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto font-light">
              Join thousands of organizations already using PolicyBridge AI to streamline their policy workflows and ensure compliance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/signup"
                className="bg-white text-primary-600 hover:bg-gray-50 font-medium py-4 px-10 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-lg whitespace-nowrap"
              >
                Start Free Trial
                <ArrowRightIcon className="w-6 h-6 ml-3 inline" />
              </Link>
            </div>
            
            {!user && (
              <div className="mt-6">
                <p className="text-white/80 mb-2">Already have an account?</p>
                <Link
                  to="/login"
                  className="text-white hover:text-gray-200 font-medium underline underline-offset-2"
                >
                  Sign in here
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
