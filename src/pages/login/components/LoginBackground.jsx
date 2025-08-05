import React from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';

const LoginBackground = () => {
  return (
    <div className="hidden lg:flex lg:w-1/2 bg-gray-900 relative overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1581092448348-7d57b382d6e3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
          alt="Futuristic construction technology"
          className="w-full h-full object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-black opacity-50"></div>
      </div>

      <div className="relative z-10 flex flex-col justify-center px-12 text-white">
        <div className="max-w-md">
          <div className="mb-6">
            <Icon name="Cpu" size={48} className="text-primary" />
          </div>
          <h2 className="text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
            The Future of Construction Management
          </h2>
          <p className="text-xl mb-8 text-gray-300">
            AI-powered insights, seamless collaboration, and unparalleled efficiency for your construction projects.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <Icon name="Check" size={16} className="text-primary" />
              </div>
              <span className="text-gray-300">AI-Assisted Project Planning</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <Icon name="Check" size={16} className="text-primary" />
              </div>
              <span className="text-gray-300">Real-time Financial Tracking</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <Icon name="Check" size={16} className="text-primary" />
              </div>
              <span className="text-gray-300">Predictive Analytics for Risk Management</span>
            </div>
          </div>

          <div className="mt-12 p-6 bg-gray-800/50 border border-white/10 rounded-lg backdrop-blur-sm shadow-lg">
            <p className="text-gray-300 italic mb-4">
              "The AI assistant helps us anticipate project delays and cost overruns before they happen. It's a game-changer."
            </p>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-primary">JD</span>
              </div>
              <div>
                <p className="text-white font-medium">Jane Doe</p>
                <p className="text-gray-400 text-sm">Lead Project Manager, Innovate Builders</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -translate-y-32 translate-x-32 filter blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/10 rounded-full translate-y-24 -translate-x-24 filter blur-3xl"></div>
    </div>
  );
};

export default LoginBackground;