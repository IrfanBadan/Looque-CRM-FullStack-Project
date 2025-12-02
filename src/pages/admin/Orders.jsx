import { useState, useEffect } from 'react'
import { supabase } from '../../services/supabase'
import { Plus, Eye, Search } from 'lucide-react'
import { format } from 'date-fns'
import CreateOrder from './CreateOrder'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [statusFilter])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('orders')
        .select('*, customers(full_name, email)')
        .order('created_at', { ascending: false })

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      const { data, error } = await query
      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)
      if (error) throw error
      fetchOrders()
      alert('Order status updated!')
    } catch (error) {
      alert('Failed to update order: ' + error.message)
    }
  }

  const filteredOrders = orders.filter(
    (order) =>
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customers?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Orders</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
        >
          <Plus size={20} /> New Order
        </button>
      </div>

      {/* Search + Filter */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders Grid for Mobile */}
      <div className="grid gap-4 sm:hidden">
        {filteredOrders.map((order) => (
          <div key={order.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">{order.order_number}</span>
              <Eye className="text-blue-600" size={18} />
            </div>
            <p className="text-sm text-gray-600">{order.customers?.full_name || 'Guest'}</p>
            <p className="text-sm text-gray-600">${parseFloat(order.total_amount).toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">{format(new Date(order.created_at), 'MMM d, yyyy')}</p>
            <select
              value={order.status}
              onChange={(e) => updateOrderStatus(order.id, e.target.value)}
              className="mt-2 px-2 py-1 rounded text-sm border w-full
                bg-gray-100 text-gray-700 border-gray-300"
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden sm:block bg-white rounded-lg shadow-md p-4 sm:p-6 overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Order #</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">{order.order_number}</td>
                <td className="py-3 px-4">{order.customers?.full_name || 'Guest'}</td>
                <td className="py-3 px-4">${parseFloat(order.total_amount).toFixed(2)}</td>
                <td className="py-3 px-4">
                  <select
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    className={`px-2 py-1 rounded text-sm border ${
                      order.status === 'delivered'
                        ? 'bg-green-100 text-green-800 border-green-200'
                        : order.status === 'processing'
                        ? 'bg-blue-100 text-blue-800 border-blue-200'
                        : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                    }`}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">{format(new Date(order.created_at), 'MMM d, yyyy')}</td>
                <td className="py-3 px-4">
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                    <Eye size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreateModal && (
        <CreateOrder
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            fetchOrders()
            setShowCreateModal(false)
          }}
        />
      )}
    </div>
  )
}
