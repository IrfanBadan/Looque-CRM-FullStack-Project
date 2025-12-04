import { useState, useEffect } from 'react'
import { supabase } from '../../services/supabase'
import { Plus, Edit, Search } from 'lucide-react'

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    segment: 'regular',
  })

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setCustomers(data || [])
    } catch (error) {
      console.error('Error fetching customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddCustomer = async (e) => {
    e.preventDefault()
    try {
      const { error } = await supabase.from('customers').insert(formData)
      if (error) throw error
      setShowAddModal(false)
      setFormData({ full_name: '', email: '', phone: '', address: '', segment: 'regular' })
      fetchCustomers()
      alert('Customer added successfully!')
    } catch (error) {
      console.error('Error adding customer:', error)
      alert('Failed to add customer: ' + error.message)
    }
  }

  const handleEditCustomer = async (e) => {
    e.preventDefault()
    try {
      const { error } = await supabase
        .from('customers')
        .update(formData)
        .eq('id', selectedCustomer.id)
      if (error) throw error
      setShowEditModal(false)
      setSelectedCustomer(null)
      fetchCustomers()
      alert('Customer updated successfully!')
    } catch (error) {
      console.error('Error updating customer:', error)
      alert('Failed to update customer: ' + error.message)
    }
  }

  const openEditModal = (customer) => {
    setSelectedCustomer(customer)
    setFormData({
      full_name: customer.full_name,
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
      segment: customer.segment || 'regular',
    })
    setShowEditModal(true)
  }

  const filteredCustomers = customers.filter(
    (cust) =>
      cust.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cust.email && cust.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (cust.phone && cust.phone.includes(searchTerm))
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-2 md:px-0">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Add Customer
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Table for md+ screens */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Phone</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Segment</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">{customer.full_name}</td>
                  <td className="py-3 px-4">{customer.email || '-'}</td>
                  <td className="py-3 px-4">{customer.phone || '-'}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm">
                      {customer.segment || 'regular'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => openEditModal(customer)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Card layout for small screens */}
        <div className="md:hidden flex flex-col gap-4">
          {filteredCustomers.map((customer) => (
            <div key={customer.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm bg-white">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-gray-900">{customer.full_name}</h3>
                <button
                  onClick={() => openEditModal(customer)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                >
                  <Edit size={18} />
                </button>
              </div>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Email:</span> {customer.email || '-'}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Phone:</span> {customer.phone || '-'}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Segment:</span>{' '}
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm">
                  {customer.segment || 'regular'}
                </span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-auto">
            <h2 className="text-xl font-bold mb-4">
              {showAddModal ? 'Add Customer' : 'Edit Customer'}
            </h2>
            <form
              onSubmit={showAddModal ? handleAddCustomer : handleEditCustomer}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Segment</label>
                <select
                  value={formData.segment}
                  onChange={(e) => setFormData({ ...formData, segment: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="regular">Regular</option>
                  <option value="VIP">VIP</option>
                  <option value="frequent">Frequent</option>
                  <option value="at_risk">At Risk</option>
                </select>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                >
                  {showAddModal ? 'Add Customer' : 'Update Customer'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    setShowEditModal(false)
                    setSelectedCustomer(null)
                  }}
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

