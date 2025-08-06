import React, { useState } from 'react';
import { authService } from '../../services/authService';
import Button from '../ui/Button';
import { Card, CardHeader, CardContent, CardTitle } from '../ui/Card';

const AccountSetup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState([]);

  const accounts = [
    {
      email: 'demo@buildledger.com',
      password: 'demo123456',
      fullName: 'Demo User',
      companyName: 'Demo Construction Co',
      role: 'company_owner',
      plan: 'professional',
      description: 'Main demo account for testing'
    },
    {
      email: 'admin@admin.com',
      password: 'adminpassword01',
      fullName: 'Super Administrator',
      companyName: 'BuildLedger Admin',
      role: 'super_admin',
      plan: 'enterprise',
      description: 'Super admin account with full system access'
    },
    {
      email: 'dave@buildledger.com',
      password: 'password44',
      fullName: 'Dave Kaercher',
      companyName: 'D & D Interiors',
      role: 'company_owner',
      plan: 'enterprise_lifetime',
      description: 'Lifetime Enterprise user - first real user'
    },
    {
      email: 'starter@test.com',
      password: 'starter123',
      fullName: 'Starter Test User',
      companyName: 'Starter Construction',
      role: 'company_owner',
      plan: 'starter_lifetime',
      description: 'Starter plan lifetime test account'
    },
    {
      email: 'professional@test.com',
      password: 'professional123',
      fullName: 'Professional Test User',
      companyName: 'Professional Construction',
      role: 'company_owner',
      plan: 'professional_lifetime',
      description: 'Professional plan lifetime test account'
    },
    {
      email: 'enterprise@test.com',
      password: 'enterprise123',
      fullName: 'Enterprise Test User',
      companyName: 'Enterprise Construction',
      role: 'company_owner',
      plan: 'enterprise_lifetime',
      description: 'Enterprise plan lifetime test account'
    }
  ];

  const createAccount = async (account) => {
    try {
      console.log(`Creating account: ${account.email}`);
      
      const result = await authService.signUp(
        account.email,
        account.password,
        account.fullName,
        account.companyName
      );

      if (result.error) {
        if (result.error.message.includes('User already registered')) {
          return { 
            email: account.email, 
            status: 'exists', 
            message: 'Account already exists' 
          };
        }
        throw result.error;
      }

      return { 
        email: account.email, 
        status: 'success', 
        message: 'Account created successfully',
        userId: result.data.user?.id 
      };

    } catch (error) {
      console.error(`Error creating account ${account.email}:`, error);
      return { 
        email: account.email, 
        status: 'error', 
        message: error.message 
      };
    }
  };

  const setupAllAccounts = async () => {
    setIsLoading(true);
    setResults([]);
    
    try {
      const accountResults = [];
      
      for (const account of accounts) {
        const result = await createAccount(account);
        accountResults.push(result);
        
        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      setResults(accountResults);
    } catch (error) {
      console.error('Setup failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return '✅';
      case 'exists': return '⚠️';
      case 'error': return '❌';
      default: return '⏳';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'exists': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>BuildLedger Account Setup</CardTitle>
        <p className="text-sm text-muted-foreground">
          Set up test accounts for development and demo purposes
        </p>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {/* Account List */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Accounts to Create</h3>
            <div className="grid gap-3">
              {accounts.map((account, index) => (
                <div key={account.email} className="p-3 border rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{account.email}</p>
                      <p className="text-sm text-muted-foreground">{account.description}</p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-medium">{account.role}</p>
                      <p className="text-muted-foreground">{account.plan}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Setup Button */}
          <div className="flex justify-center">
            <Button
              onClick={setupAllAccounts}
              disabled={isLoading}
              size="lg"
              className="w-full md:w-auto"
            >
              {isLoading ? 'Creating Accounts...' : 'Setup All Accounts'}
            </Button>
          </div>

          {/* Results */}
          {results.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Results</h3>
              <div className="space-y-2">
                {results.map((result, index) => (
                  <div 
                    key={result.email} 
                    className="p-3 border rounded-lg flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{getStatusIcon(result.status)}</span>
                      <div>
                        <p className="font-medium">{result.email}</p>
                        <p className={`text-sm ${getStatusColor(result.status)}`}>
                          {result.message}
                        </p>
                      </div>
                    </div>
                    {result.userId && (
                      <p className="text-xs text-muted-foreground font-mono">
                        ID: {result.userId}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Summary */}
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Account Credentials</h4>
                <div className="space-y-1 text-sm font-mono">
                  {accounts.map(account => (
                    <div key={account.email} className="flex justify-between">
                      <span>{account.email}</span>
                      <span>{account.password}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountSetup;