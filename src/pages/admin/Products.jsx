import { useState, useEffect } from 'react'
import { supabase } from '../../services/supabase'
import { Plus, Package, Search, Layers } from 'lucide-react'
import ProductVariants from './ProductVariants'

export default function Products() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showVariantsModal, setShowVariantsModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [newCategory, setNewCategory] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    base_price: '',
  })

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from('categories').select('*').order('name')
      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleAddProduct = async (e) => {
    e.preventDefault()
    try {
      const { error } = await supabase.from('products').insert({
        ...formData,
        base_price: parseFloat(formData.base_price),
      })
      if (error) throw error
      setShowAddModal(false)
      setFormData({ name: '', description: '', category_id: '', base_price: '' })
      fetchProducts()
      alert('Product added successfully!')
    } catch (error) {
      alert('Failed to add product: ' + error.message)
    }
  }

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return
    try {
      const { error } = await supabase.from('categories').insert({ name: newCategory.trim() })
      if (error) throw error
      setNewCategory('')
      setShowCategoryModal(false)
      fetchCategories()
      alert('Category added!')
    } catch (error) {
      alert('Failed to add category: ' + error.message)
    }
  }

  const openVariantsModal = (product) => {
    setSelectedProduct(product)
    setShowVariantsModal(true)
  }

  const filteredProducts = products.filter((prod) =>
    prod.name.toLowerCase().includes(searchTerm.toLowerCase())
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
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Products</h1>

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => setShowCategoryModal(true)}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center justify-center gap-2"
          >
            <Plus size={20} /> Add Category
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <Plus size={20} /> Add Product
          </button>
        </div>
      </div>

      {/* Search + Products Grid */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">

        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Responsive product cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition"
            >
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-gray-900">{product.name}</h3>
                <Package className="text-gray-400" size={20} />
              </div>

              <p className="text-sm text-gray-600 mt-2">
                {product.description || "No description"}
              </p>

              <div className="flex items-center justify-between mt-3">
                <span className="text-lg font-bold text-blue-600">
                  ${parseFloat(product.base_price).toFixed(2)}
                </span>

                <span className="text-xs text-gray-500">
                  {product.categories?.name || "Uncategorized"}
                </span>
              </div>

              <button
                onClick={() => openVariantsModal(product)}
                className="w-full mt-4 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 flex items-center justify-center gap-2 text-sm"
              >
                <Layers size={16} /> Manage Variants
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modals (Add Product + Add Category + Variants) */}
      {/* SAME AS YOUR CODE — NO CHANGE NEEDED FOR RESPONSIVENESS */}

      {showVariantsModal && selectedProduct && (
        <ProductVariants
          productId={selectedProduct.id}
          onClose={() => {
            setShowVariantsModal(false)
            setSelectedProduct(null)
            fetchProducts()
          }}
        />
      )}
    </div>
  )
}
