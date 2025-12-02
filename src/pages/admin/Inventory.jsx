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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>

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

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
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
                    {variant.stock_quantity <= variant.reorder_point ? (
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm">
                        Low Stock
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                        In Stock
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}


