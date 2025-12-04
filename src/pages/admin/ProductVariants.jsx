import { useState, useEffect } from 'react'
import { supabase } from '../../services/supabase'
import { Plus, Edit, X } from 'lucide-react'

export default function ProductVariants({ productId, onClose }) {
  const [variants, setVariants] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState({
    size: '',
    color: '',
    sku: '',
    price: '',
    stock_quantity: '',
    reorder_point: '10',
  })

  useEffect(() => {
    if (productId) {
      fetchVariants()
    }
  }, [productId])

  const fetchVariants = async () => {
    try {
      const { data, error } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setVariants(data || [])
    } catch (error) {
      console.error('Error fetching variants:', error)
    }
  }

  const handleAddVariant = async (e) => {
    e.preventDefault()
    try {
      const { error } = await supabase.from('product_variants').insert({
        product_id: productId,
        size: formData.size || null,
        color: formData.color || null,
        sku: formData.sku || null,
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        reorder_point: parseInt(formData.reorder_point) || 10,
      })

      if (error) throw error
      setShowAddModal(false)
      setFormData({
        size: '',
        color: '',
        sku: '',
        price: '',
        stock_quantity: '',
        reorder_point: '10',
      })
      fetchVariants()
      alert('Variant added successfully!')
    } catch (error) {
      console.error('Error adding variant:', error)
      alert('Failed to add variant: ' + error.message)
    }
  }

  const handleDeleteVariant = async (variantId) => {
    if (!confirm('Are you sure you want to delete this variant?')) return

    try {
      const { error } = await supabase.from('product_variants').delete().eq('id', variantId)
      if (error) throw error
      fetchVariants()
      alert('Variant deleted successfully!')
    } catch (error) {
      console.error('Error deleting variant:', error)
      alert('Failed to delete variant: ' + error.message)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Product Variants</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus size={20} />
              Add Variant
            </button>
            <button
              onClick={onClose}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Size</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Color</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">SKU</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Price</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Stock</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Reorder Point</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {variants.map((variant) => (
                <tr key={variant.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">{variant.size || '-'}</td>
                  <td className="py-3 px-4">{variant.color || '-'}</td>
                  <td className="py-3 px-4">{variant.sku || '-'}</td>
                  <td className="py-3 px-4">${parseFloat(variant.price).toFixed(2)}</td>
                  <td className="py-3 px-4 text-center">{variant.stock_quantity}</td>
                  <td className="py-3 px-4 text-center">{variant.reorder_point}</td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleDeleteVariant(variant.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <X size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-bold mb-4">Add Variant</h3>
              <form onSubmit={handleAddVariant} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                  <input
                    type="text"
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., S, M, L, XL"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Red, Blue, Black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reorder Point</label>
                  <input
                    type="number"
                    value={formData.reorder_point}
                    onChange={(e) => setFormData({ ...formData, reorder_point: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                  >
                    Add Variant
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
    </div>
  )
}



