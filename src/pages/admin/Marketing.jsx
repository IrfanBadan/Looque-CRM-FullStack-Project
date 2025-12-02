import { useState, useEffect } from 'react'
import { supabase } from '../../services/supabase'
import { Plus, Megaphone } from 'lucide-react'
import { format } from 'date-fns'

export default function Marketing() {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    campaign_type: 'email',
    start_date: '',
    end_date: '',
    status: 'draft',
    target_segment: '',
  })

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const fetchCampaigns = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setCampaigns(data || [])
    } catch (error) {
      console.error('Error fetching campaigns:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddCampaign = async (e) => {
    e.preventDefault()
    try {
      const { error } = await supabase.from('campaigns').insert({
        ...formData,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        target_segment: formData.target_segment || null,
      })
      if (error) throw error
      setShowAddModal(false)
      setFormData({
        name: '',
        description: '',
        campaign_type: 'email',
        start_date: '',
        end_date: '',
        status: 'draft',
        target_segment: '',
      })
      fetchCampaigns()
      alert('Campaign created successfully!')
    } catch (error) {
      console.error('Error adding campaign:', error)
      alert('Failed to create campaign: ' + error.message)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-2 md:px-0">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Marketing Campaigns</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={20} />
          New Campaign
        </button>
      </div>

      {campaigns.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No campaigns yet. Create your first campaign!</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md bg-white"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Megaphone className="text-blue-500" size={20} />
                  <h3 className="font-semibold text-gray-900">{campaign.name}</h3>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${getStatusColor(campaign.status)}`}>
                  {campaign.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{campaign.description || 'No description'}</p>
              <div className="flex flex-col gap-1 text-xs text-gray-500">
                <span>Type: {campaign.campaign_type}</span>
                {campaign.start_date && (
                  <span>Start: {format(new Date(campaign.start_date), 'MMM d, yyyy')}</span>
                )}
                {campaign.end_date && (
                  <span>End: {format(new Date(campaign.end_date), 'MMM d, yyyy')}</span>
                )}
                {campaign.target_segment && <span>Target: {campaign.target_segment}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
          <div className="bg-white rounded-lg p-6 w-full max-w-md overflow-auto max-h-[90vh]">
            <h2 className="text-xl font-bold mb-4">Create Campaign</h2>
            <form onSubmit={handleAddCampaign} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Type</label>
                <select
                  value={formData.campaign_type}
                  onChange={(e) => setFormData({ ...formData, campaign_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="email">Email</option>
                  <option value="discount">Discount</option>
                  <option value="promotion">Promotion</option>
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Segment</label>
                <select
                  value={formData.target_segment}
                  onChange={(e) => setFormData({ ...formData, target_segment: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Customers</option>
                  <option value="VIP">VIP</option>
                  <option value="frequent">Frequent</option>
                  <option value="at_risk">At Risk</option>
                  <option value="regular">Regular</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                >
                  Create Campaign
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
