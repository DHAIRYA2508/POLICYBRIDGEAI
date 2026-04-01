import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Github, Twitter, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Github, href: '#', label: 'GitHub' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Mail, href: '#', label: 'Email' },
  ];

  return (
    <footer className="bg-gradient-to-br from-secondary-600 to-secondary-800 text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="col-span-1 md:col-span-2"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent3-500 rounded-xl flex items-center justify-center shadow-glow">
                <span className="text-white font-bold text-xl">PB</span>
              </div>
              <span className="text-3xl font-bold text-gradient-sunlit">PolicyBridge AI</span>
            </div>
            <p className="text-secondary-100 text-lg leading-relaxed max-w-md">
              Empowering users to understand complex policy documents through AI-powered analysis and intelligent Q&A.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="col-span-1"
          >
            <h3 className="text-lg font-semibold mb-4 text-primary-200">Quick Links</h3>
            <ul className="space-y-3">
              <li><button className="text-secondary-100 hover:text-primary-300 transition-all duration-200 text-left hover:translate-x-1">About</button></li>
              <li><button className="text-secondary-100 hover:text-primary-300 transition-all duration-200 text-left hover:translate-x-1">Features</button></li>
              <li><button className="text-secondary-100 hover:text-primary-300 transition-all duration-200 text-left hover:translate-x-1">Pricing</button></li>
              <li><button className="text-secondary-100 hover:text-primary-300 transition-all duration-200 text-left hover:translate-x-1">Support</button></li>
            </ul>
          </motion.div>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="col-span-1"
          >
            <h3 className="text-lg font-semibold mb-4 text-primary-200">Connect</h3>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent3-500 rounded-xl flex items-center justify-center text-white hover:shadow-glow transition-all duration-300"
                    aria-label={social.label}
                  >
                    <Icon size={20} />
                  </motion.a>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="border-t border-secondary-400 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center"
        >
          <p className="text-secondary-200 text-sm">
            © {currentYear} PolicyBridge AI. All rights reserved.
          </p>
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <button className="text-secondary-200 hover:text-primary-300 text-sm transition-all duration-200 hover:underline">
              Privacy Policy
            </button>
            <button className="text-secondary-200 hover:text-primary-300 text-sm transition-all duration-200 hover:underline">
              Terms of Service
            </button>
          </div>
        </motion.div>

        {/* Made with Love */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-8 pt-4"
        >
          <div className="text-secondary-200 text-sm flex items-center justify-center space-x-2">
            <span>Made with</span>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
            >
              <Heart size={16} className="text-accent3-400 fill-current" />
            </motion.div>
            <span>for better policy understanding</span>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
