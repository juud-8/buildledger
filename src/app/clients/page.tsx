'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  Mail, 
  Phone, 
  MapPin,
  Users,
  DollarSign,
  TrendingUp,
  Calendar,
  Star,
  Tag,
  Building2,
  UserPlus,
  Download,
  Upload,
  X
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Client } from '@/lib/types'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/components/AuthProvider'

// Client card component
function ClientCard({ client, onEdit, onDelete }: { 
  client: Client; 
  onEdit: (client: Client) => void; 
  onDelete: (client: Client) => void; 
}) {
  const [showActions, setShowActions] = useState(false)
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 group"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
              {client.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {client.name}
              </h3>
              {client.email && (
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {client.email}
                </p>
              )}
            </div>
          </div>
          
          {/* Actions Menu */}
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>
            
            <AnimatePresence>
              {showActions && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10"
                >
                  <div className="py-1">
                    <button
                      onClick={() => onEdit(client)}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Client
                    </button>
                    <button
                      onClick={() => onDelete(client)}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Client
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        {/* Contact Info */}
        <div className="space-y-2 mb-4">
          {client.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-4 h-4" />
              {client.phone}
            </div>
          )}
          {client.address && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              {client.address}
            </div>
          )}
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              ${client.total_invoiced?.toLocaleString() || '0'}
            </p>
            <p className="text-xs text-gray-500">Total Invoiced</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              ${client.total_paid?.toLocaleString() || '0'}
            </p>
            <p className="text-xs text-gray-500">Total Paid</p>
          </div>
        </div>
        
        {/* Tags */}
        {client.tags && client.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-4">
            {client.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full"
              >
                {tag}
              </span>
            ))}
            {client.tags.length > 3 && (
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                +{client.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}

// Create Client Modal
function CreateClientModal({ isOpen, onClose, onClientCreated }: {
  isOpen: boolean;
  onClose: () => void;
  onClientCreated: (client: Client) => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
    tags: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsSubmitting(true)
    try {
      const tags = formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
      
      const { data, error } = await supabase
        .from('clients')
        .insert({
          user_id: user.id,
          name: formData.name,
          email: formData.email || null,
          phone: formData.phone || null,
          address: formData.address || null,
          notes: formData.notes || null,
          tags: tags.length > 0 ? tags : null
        })
        .select()
        .single()

      if (error) throw error

      onClientCreated(data)
      onClose()
      setFormData({ name: '', email: '', phone: '', address: '', notes: '', tags: '' })
    } catch (error) {
      console.error('Error creating client:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Add New Client</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter client name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="client@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="(555) 123-4567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
                placeholder="Enter full address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="residential, commercial, repeat (comma separated)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Additional notes about this client"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                onClick={onClose}
                variant="secondary"
                fullWidth
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Client'}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [filteredClients, setFilteredClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [stats, setStats] = useState({
    totalClients: 0,
    totalInvoiced: 0,
    totalPaid: 0,
    activeClients: 0
  })
  const { user } = useAuth()

  // Fetch clients
  useEffect(() => {
    if (!user) return
    
    const fetchClients = async () => {
      try {
        const { data, error } = await supabase
          .from('clients')
          .select(`
            *,
            invoices:invoices(id, total, status, amount_paid)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) throw error

        // Calculate stats and enrich client data
        const enrichedClients = data?.map(client => {
          const clientInvoices = client.invoices || []
          const totalInvoiced = clientInvoices.reduce((sum: number, inv: any) => sum + (inv.total || 0), 0)
          const totalPaid = clientInvoices.reduce((sum: number, inv: any) => sum + (inv.amount_paid || 0), 0)
          
          return {
            ...client,
            total_invoiced: totalInvoiced,
            total_paid: totalPaid
          }
        }) || []

        setClients(enrichedClients)
        setFilteredClients(enrichedClients)
        
        // Calculate overall stats
        const totalInvoiced = enrichedClients.reduce((sum, client) => sum + (client.total_invoiced || 0), 0)
        const totalPaid = enrichedClients.reduce((sum, client) => sum + (client.total_paid || 0), 0)
        const activeClients = enrichedClients.filter(client => 
          client.total_invoiced && client.total_invoiced > 0
        ).length

        setStats({
          totalClients: enrichedClients.length,
          totalInvoiced,
          totalPaid,
          activeClients
        })
      } catch (error) {
        console.error('Error fetching clients:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchClients()
  }, [user])

  // Filter clients based on search
  useEffect(() => {
    const filtered = clients.filter(client =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone?.includes(searchQuery) ||
      client.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    setFilteredClients(filtered)
  }, [searchQuery, clients])

  const handleClientCreated = (newClient: Client) => {
    setClients(prev => [newClient, ...prev])
    setShowCreateModal(false)
  }

  const handleEditClient = (client: Client) => {
    // TODO: Implement edit functionality
    console.log('Edit client:', client)
  }

  const handleDeleteClient = async (client: Client) => {
    if (!confirm(`Are you sure you want to delete ${client.name}?`)) return
    
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', client.id)

      if (error) throw error

      setClients(prev => prev.filter(c => c.id !== client.id))
    } catch (error) {
      console.error('Error deleting client:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading clients...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Client Management</h1>
              <p className="mt-2 text-gray-600">
                Manage your clients, track relationships, and view payment history
              </p>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              variant="primary"
              size="lg"
              className="flex items-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              Add Client
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalClients}</p>
                <p className="text-sm text-gray-600">Total Clients</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  ${stats.totalInvoiced.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Total Invoiced</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  ${stats.totalPaid.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Total Paid</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Star className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.activeClients}</p>
                <p className="text-sm text-gray-600">Active Clients</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search clients by name, email, phone, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filter
              </Button>
              <Button variant="secondary" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Clients Grid */}
        {filteredClients.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'No clients found' : 'No clients yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery 
                ? 'Try adjusting your search terms'
                : 'Get started by adding your first client'
              }
            </p>
            {!searchQuery && (
              <Button
                onClick={() => setShowCreateModal(true)}
                variant="primary"
                className="flex items-center gap-2"
              >
                <UserPlus className="w-5 h-5" />
                Add Your First Client
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredClients.map((client) => (
                <ClientCard
                  key={client.id}
                  client={client}
                  onEdit={handleEditClient}
                  onDelete={handleDeleteClient}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Create Client Modal */}
      <CreateClientModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onClientCreated={handleClientCreated}
      />
    </div>
  )
} 