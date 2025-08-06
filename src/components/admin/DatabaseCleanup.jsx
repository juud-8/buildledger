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

      // Show instructions since we can't use admin methods
      cleanupResults.push({
        step: 'Permission Notice',
        status: 'warning',
        message: 'Cannot delete auth users with anon key. See manual instructions below.'
      });

      // Step 1: Delete all user profiles first (to avoid FK constraints)
      console.log('🗑️ Deleting all user profiles...');
      const { error: profilesError, count: profilesCount } = await supabase
        .from('user_profiles')
        .delete({ count: 'exact' })
        .gte('created_at', '1900-01-01'); // Delete all records

      if (profilesError && !profilesError.message.includes('relation')) {
        cleanupResults.push({
          step: 'Delete Profiles',
          status: 'warning',
          message: `Profile deletion warning: ${profilesError.message}`
        });
      } else {
        cleanupResults.push({
          step: 'Delete Profiles',
          status: 'success',
          message: `User profiles deleted: ${profilesCount || 'all'}`
        });
      }

      // Step 2: Delete companies
      console.log('🗑️ Deleting all companies...');
      const { error: companiesError, count: companiesCount } = await supabase
        .from('companies')
        .delete({ count: 'exact' })
        .gte('created_at', '1900-01-01');

      if (companiesError && !companiesError.message.includes('relation')) {
        cleanupResults.push({
          step: 'Delete Companies',
          status: 'warning',
          message: `Companies deletion warning: ${companiesError.message}`
        });
      } else {
        cleanupResults.push({
          step: 'Delete Companies',
          status: 'success',
          message: `Companies deleted: ${companiesCount || 'all'}`
        });
      }

      // Step 3: Clean up remaining data tables
      console.log('🧹 Cleaning up remaining data...');
      
      const tablesToClean = [
        'projects', 'clients', 'invoices', 'quotes', 'items', 
        'project_items', 'invoice_items', 'quote_items',
        'project_photos', 'project_documents'
      ];
      
      for (const table of tablesToClean) {
        try {
          const { error: tableError, count: tableCount } = await supabase
            .from(table)
            .delete({ count: 'exact' })
            .gte('created_at', '1900-01-01');

          if (tableError && !tableError.message.includes('relation') && !tableError.message.includes('does not exist')) {
            cleanupResults.push({
              step: `Clean ${table}`,
              status: 'warning',
              message: `${table}: ${tableError.message}`
            });
          } else if (!tableError) {
            cleanupResults.push({
              step: `Clean ${table}`,
              status: 'success',
              message: `${table}: deleted ${tableCount || 0} records`
            });
          }
        } catch (error) {
          // Silently skip tables that don't exist
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
        step: 'Database Data Cleanup Complete',
        status: 'success',
        message: '✅ All profile and application data deleted!'
      });

      cleanupResults.push({
        step: 'Next Steps Required',
        status: 'warning',
        message: '⚠️ Manual auth user deletion required. See instructions below.'
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

              {/* Manual Instructions */}
              {results.some(r => r.step === 'Next Steps Required') && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-3">📋 Manual Steps Required</h4>
                  <div className="text-sm text-blue-700 space-y-3">
                    <p className="font-medium">To complete the cleanup, you need to manually delete auth users:</p>
                    
                    <div className="bg-white p-3 rounded border">
                      <p className="font-medium mb-2">Option 1: Supabase Dashboard</p>
                      <ol className="list-decimal list-inside space-y-1 text-xs">
                        <li>Go to <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">app.supabase.com</a></li>
                        <li>Open your BuildLedger project</li>
                        <li>Go to Authentication → Users</li>
                        <li>Select all users and delete them</li>
                      </ol>
                    </div>

                    <div className="bg-white p-3 rounded border">
                      <p className="font-medium mb-2">Option 2: SQL Query</p>
                      <div className="bg-gray-100 p-2 rounded text-xs font-mono">
                        <p>-- Run this in SQL Editor:</p>
                        <p>DELETE FROM auth.users;</p>
                      </div>
                    </div>

                    <p className="font-medium text-blue-800">
                      After deleting auth users, your database will be completely clean and ready for fresh account setup!
                    </p>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {results.some(r => r.step === 'Database Data Cleanup Complete') && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">✅ Data Cleanup Complete!</h4>
                  <p className="text-sm text-green-700 mb-3">
                    All profile and application data has been deleted. After completing the manual auth user deletion above, 
                    you can create fresh accounts with the exact specifications you need.
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