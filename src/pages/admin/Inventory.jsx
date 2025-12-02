import { useState, useEffect } from 'react'
import { supabase } from '../../services/supabase'
import { AlertTriangle, Package } from 'lucide-react'

export default function Inventory() {
  const [variants, setVariants] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('product_variants')
        .select('*, products(name)')
        .order('stock_quantity', { ascending: true })
      if (error) throw error
      setVariants(data || [])
    } catch (error) {
      console.error('Error fetching inventory:', error)
    } finally {
      setLoading(false)
    }
  }

  const lowStockItems = variants.filter((v) => v.stock_quantity <= v.reorder_point)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-2 md:px-0">
      <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
          <AlertTriangle className="text-yellow-600" size={24} />
          <div>
            <p className="font-semibold text-yellow-900">Low Stock Alert</p>
            <p className="text-sm text-yellow-700">
              {lowStockItems.length} item(s) are below reorder point
            </p>
          </div>
        </div>
      )}

      {/* Mobile Cards */}
      <div className="grid gap-4 sm:hidden">
        {variants.map((variant) => (
          <div key={variant.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">{variant.products?.name || 'Unknown'}</span>
              <Package className="text-gray-400" size={20} />
            </div>
            <p className="text-sm text-gray-600">SKU: {variant.sku || '-'}</p>
            <p className="text-sm text-gray-600">Size: {variant.size || '-'}</p>
            <p className="text-sm text-gray-600">Color: {variant.color || '-'}</p>
            <p className="text-sm text-gray-600 mt-1">Stock: {variant.stock_quantity}</p>
            <p className="text-sm text-gray-600">Reorder Point: {variant.reorder_point}</p>
            <span
              className={`inline-block mt-2 px-2 py-1 rounded text-sm ${
                variant.stock_quantity <= variant.reorder_point
                  ? 'bg-red-100 text-red-800'
                  : 'bg-green-100 text-green-800'
              }`}
            >
              {variant.stock_quantity <= variant.reorder_point ? 'Low Stock' : 'In Stock'}
            </span>
          </div>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden sm:block bg-white rounded-lg shadow-md p-4 sm:p-6 overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Product</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">SKU</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Size</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Color</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">Stock</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">Reorder Point</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {variants.map((variant) => (
              <tr key={variant.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4">{variant.products?.name || 'Unknown'}</td>
                <td className="py-3 px-4">{variant.sku || '-'}</td>
                <td className="py-3 px-4">{variant.size || '-'}</td>
                <td className="py-3 px-4">{variant.color || '-'}</td>
                <td className="py-3 px-4 text-center">{variant.stock_quantity}</td>
                <td className="py-3 px-4 text-center">{variant.reorder_point}</td>
                <td className="py-3 px-4 text-center">
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      variant.stock_quantity <= variant.reorder_point
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {variant.stock_quantity <= variant.reorder_point ? 'Low Stock' : 'In Stock'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
