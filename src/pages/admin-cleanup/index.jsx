import React from 'react';
import DatabaseCleanup from '../../components/admin/DatabaseCleanup';

const AdminCleanupPage = () => {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            🗑️ Database Cleanup - DANGER ZONE
          </h1>
          <p className="text-muted-foreground">
            Permanently delete all users and data to start completely fresh
          </p>
        </div>
        
        <DatabaseCleanup />
        
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            After cleanup is complete, use Account Setup to create fresh accounts
          </p>
          <a 
            href="/admin-setup" 
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            → Go to Account Setup
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminCleanupPage;