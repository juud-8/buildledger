import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import Button from '../ui/Button';
import { Card, CardHeader, CardContent, CardTitle } from '../ui/Card';

const DatabaseCleanup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const cleanupDatabase = async () => {
    if (!confirmDelete) {
      alert('Please confirm database cleanup by checking the confirmation box first.');
      return;
    }

    setIsLoading(true);
    setResults([]);
    
    try {
      const cleanupResults = [];

      // Step 1: Get all users from auth.users
      console.log('🔍 Fetching all users from auth.users...');
      const { data: authUsers, error: fetchError } = await supabase.auth.admin.listUsers();
      
      if (fetchError) {
        throw new Error(`Failed to fetch users: ${fetchError.message}`);
      }

      cleanupResults.push({
        step: 'Fetch Users',
        status: 'success',
        message: `Found ${authUsers.users.length} users to delete`
      });

      // Step 2: Delete all user profiles first (to avoid FK constraints)
      console.log('🗑️ Deleting all user profiles...');
      const { error: profilesError } = await supabase
        .from('user_profiles')
        .delete()
        .gte('created_at', '1900-01-01'); // Delete all records

      if (profilesError) {
        cleanupResults.push({
          step: 'Delete Profiles',
          status: 'warning',
          message: `Profile deletion warning: ${profilesError.message}`
        });
      } else {
        cleanupResults.push({
          step: 'Delete Profiles',
          status: 'success',
          message: 'All user profiles deleted successfully'
        });
      }

      // Step 3: Delete companies (optional)
      console.log('🗑️ Deleting all companies...');
      const { error: companiesError } = await supabase
        .from('companies')
        .delete()
        .gte('created_at', '1900-01-01'); // Delete all records

      if (companiesError) {
        cleanupResults.push({
          step: 'Delete Companies',
          status: 'warning',
          message: `Companies deletion warning: ${companiesError.message}`
        });
      } else {
        cleanupResults.push({
          step: 'Delete Companies',
          status: 'success',
          message: 'All companies deleted successfully'
        });
      }

      // Step 4: Delete all auth users
      console.log('🗑️ Deleting all auth users...');
      let deletedCount = 0;
      let errorCount = 0;

      for (const user of authUsers.users) {
        try {
          const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
          
          if (deleteError) {
            console.error(`Failed to delete user ${user.email}:`, deleteError);
            errorCount++;
          } else {
            console.log(`✅ Deleted user: ${user.email}`);
            deletedCount++;
          }
          
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          console.error(`Error deleting user ${user.email}:`, error);
          errorCount++;
        }
      }

      cleanupResults.push({
        step: 'Delete Auth Users',
        status: errorCount === 0 ? 'success' : 'warning',
        message: `Deleted ${deletedCount} users successfully${errorCount > 0 ? `, ${errorCount} errors` : ''}`
      });

      // Step 5: Clean up any remaining data
      console.log('🧹 Cleaning up remaining data...');
      
      // Delete projects, clients, invoices, etc.
      const tablesToClean = ['projects', 'clients', 'invoices', 'quotes', 'items'];
      
      for (const table of tablesToClean) {
        try {
          const { error: tableError } = await supabase
            .from(table)
            .delete()
            .gte('created_at', '1900-01-01');

          if (tableError && !tableError.message.includes('relation') && !tableError.message.includes('does not exist')) {
            cleanupResults.push({
              step: `Clean ${table}`,
              status: 'warning',
              message: `${table}: ${tableError.message}`
            });
          } else {
            cleanupResults.push({
              step: `Clean ${table}`,
              status: 'success',
              message: `${table} cleaned successfully`
            });
          }
        } catch (error) {
          if (!error.message.includes('relation') && !error.message.includes('does not exist')) {
            cleanupResults.push({
              step: `Clean ${table}`,
              status: 'warning',
              message: `${table}: ${error.message}`
            });
          }
        }
      }

      cleanupResults.push({
        step: 'Database Cleanup Complete',
        status: 'success',
        message: '🎉 Database has been completely cleaned and is ready for fresh setup!'
      });

      setResults(cleanupResults);

    } catch (error) {
      console.error('Cleanup failed:', error);
      setResults([{
        step: 'Cleanup Failed',
        status: 'error',
        message: error.message
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return '⏳';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-orange-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-red-600">⚠️ Database Cleanup - DANGER ZONE</CardTitle>
        <p className="text-sm text-muted-foreground">
          This will permanently delete ALL users, profiles, companies, and data from the database.
          Use this to start completely fresh with clean account setup.
        </p>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {/* Warning Section */}
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="text-lg font-semibold text-red-800 mb-2">⚠️ CRITICAL WARNING</h3>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• This action is IRREVERSIBLE</li>
              <li>• ALL user accounts will be permanently deleted</li>
              <li>• ALL user profiles, companies, projects, etc. will be deleted</li>
              <li>• This includes any real user data that exists</li>
              <li>• Use this ONLY for development/testing purposes</li>
            </ul>
          </div>

          {/* Confirmation */}
          <div className="flex items-center space-x-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <input
              type="checkbox"
              id="confirmDelete"
              checked={confirmDelete}
              onChange={(e) => setConfirmDelete(e.target.checked)}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <label htmlFor="confirmDelete" className="text-sm text-yellow-800 font-medium">
              I understand this will permanently delete ALL data and cannot be undone
            </label>
          </div>

          {/* Cleanup Button */}
          <div className="flex justify-center">
            <Button
              onClick={cleanupDatabase}
              disabled={isLoading || !confirmDelete}
              variant="destructive"
              size="lg"
              className="w-full md:w-auto"
            >
              {isLoading ? 'Cleaning Database...' : '🗑️ PERMANENTLY DELETE ALL DATA'}
            </Button>
          </div>

          {/* Results */}
          {results.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Cleanup Results</h3>
              <div className="space-y-2">
                {results.map((result, index) => (
                  <div 
                    key={index} 
                    className="p-3 border rounded-lg flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{getStatusIcon(result.status)}</span>
                      <div>
                        <p className="font-medium">{result.step}</p>
                        <p className={`text-sm ${getStatusColor(result.status)}`}>
                          {result.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Success Message */}
              {results.some(r => r.step === 'Database Cleanup Complete') && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">🎉 Ready for Fresh Setup!</h4>
                  <p className="text-sm text-green-700">
                    The database has been completely cleaned. You can now use the Account Setup tool 
                    to create fresh accounts with the exact specifications you need.
                  </p>
                  <div className="mt-3">
                    <a
                      href="/admin-setup"
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700"
                    >
                      → Go to Account Setup
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DatabaseCleanup;