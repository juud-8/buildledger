import React from 'react';
import AccountSetup from '../../components/admin/AccountSetup';

const AdminSetupPage = () => {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            BuildLedger Admin Setup
          </h1>
          <p className="text-muted-foreground">
            Initialize development and demo accounts
          </p>
        </div>
        
        <AccountSetup />
      </div>
    </div>
  );
};

export default AdminSetupPage;