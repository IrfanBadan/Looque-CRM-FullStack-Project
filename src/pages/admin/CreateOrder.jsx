import { useState, useEffect } from 'react'
import { supabase } from '../../services/supabase'
import { X, Plus, Trash2 } from 'lucide-react'

export default function CreateOrder({ onClose, onSuccess }) {
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [variants, setVariants] = useState({})
  const [selectedCustomer, setSelectedCustomer] = useState('')
  const [orderItems, setOrderItems] = useState([])
  const [shippingAddress, setShippingAddress] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchCustomers()
    fetchProducts()
  }, [])

  const fetchCustomers = async () => {
    try {
      const { data } = await supabase.from('customers').select('*').order('full_name')
      setCustomers(data || [])
    } catch (error) {
      console.error('Error fetching customers:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      const { data } = await supabase.from('products').select('*').order('name')
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const fetchVariants = async (productId) => {
    if (variants[productId]) return variants[productId]

    try {
      const { data } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', productId)
      setVariants({ ...variants, [productId]: data || [] })
      return data || []
    } catch (error) {
      console.error('Error fetching variants:', error)
      return []
    }
  }

  const handleAddItem = async () => {
    const productId = prompt('Enter product ID or select from list:')
    if (!productId) return

    const product = products.find((p) => p.id === productId)
    if (!product) {
      alert('Product not found')
      return
    }

    const productVariants = await fetchVariants(productId)
    let variantId = null
    let price = parseFloat(product.base_price)

    if (productVariants.length > 0) {
      const variantChoice = prompt(
        `Select variant:\n${productVariants.map((v, i) => `${i + 1}. ${v.size || 'N/A'} - ${v.color || 'N/A'} - $${v.price}`).join('\n')}\nEnter number:`
      )
      const selectedVariant = productVariants[parseInt(variantChoice) - 1]
      if (selectedVariant) {
        variantId = selectedVariant.id
        price = parseFloat(selectedVariant.price)
      }
    }

    const quantity = parseInt(prompt('Enter quantity:') || '1')

    setOrderItems([
      ...orderItems,
      {
        product_id: productId,
        product_variant_id: variantId,
        product_name: product.name,
        quantity,
        price,
        subtotal: quantity * price,
      },
    ])
  }

  const removeItem = (index) => {
    setOrderItems(orderItems.filter((_, i) => i !== index))
  }

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + item.subtotal, 0)
  }

  const generateOrderNumber = () => {
    return 'ORD-' + Date.now().toString().slice(-8)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (orderItems.length === 0) {
      alert('Please add at least one item to the order')
      return
    }

    setLoading(true)
    try {
      const orderNumber = generateOrderNumber()
      const totalAmount = calculateTotal()

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: selectedCustomer || null,
          order_number: orderNumber,
          total_amount: totalAmount,
          shipping_address: shippingAddress,
          status: 'pending',
          payment_status: 'pending',
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items - need to get variant IDs properly
      const itemsToInsert = []
      for (const item of orderItems) {
        if (item.product_variant_id) {
          itemsToInsert.push({
            order_id: order.id,
            product_variant_id: item.product_variant_id,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.subtotal,
          })
        } else {
          // If no variant, create a default variant or use product base price
          // For now, we'll skip items without variants or create a placeholder
          const { data: defaultVariant } = await supabase
            .from('product_variants')
            .select('id')
            .eq('product_id', item.product_id)
            .limit(1)
            .single()

          if (defaultVariant) {
            itemsToInsert.push({
              order_id: order.id,
              product_variant_id: defaultVariant.id,
              quantity: item.quantity,
              price: item.price,
              subtotal: item.subtotal,
            })
          }
        }
      }

      const { error: itemsError } = await supabase.from('order_items').insert(itemsToInsert)
      if (itemsError) throw itemsError

      alert('Order created successfully!')
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error creating order:', error)
      alert('Failed to create order: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Create New Order</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
              <select
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select customer (optional)</option>
                {customers.map((cust) => (
                  <option key={cust.id} value={cust.id}>
                    {cust.full_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Address</label>
              <input
                type="text"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter shipping address"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Order Items</label>
              <button
                type="button"
                onClick={handleAddItem}
                className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
              >
                <Plus size={16} />
                Add Item
              </button>
            </div>
            {orderItems.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No items added yet</p>
            ) : (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-2 px-4 font-semibold text-gray-700">Product</th>
                      <th className="text-center py-2 px-4 font-semibold text-gray-700">Quantity</th>
                      <th className="text-right py-2 px-4 font-semibold text-gray-700">Price</th>
                      <th className="text-right py-2 px-4 font-semibold text-gray-700">Subtotal</th>
                      <th className="text-center py-2 px-4 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderItems.map((item, index) => (
                      <tr key={index} className="border-t border-gray-200">
                        <td className="py-2 px-4">{item.product_name}</td>
                        <td className="py-2 px-4 text-center">{item.quantity}</td>
                        <td className="py-2 px-4 text-right">${item.price.toFixed(2)}</td>
                        <td className="py-2 px-4 text-right">${item.subtotal.toFixed(2)}</td>
                        <td className="py-2 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={3} className="py-2 px-4 font-semibold text-right">
                        Total:
                      </td>
                      <td className="py-2 px-4 font-bold text-right">${calculateTotal().toFixed(2)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading || orderItems.length === 0}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Order'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

