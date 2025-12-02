import { useEffect, useState } from 'react'
import { supabase } from '../../services/supabase'
import { Users, ShoppingCart, DollarSign, Calendar, TrendingUp } from 'lucide-react'
import { format, subDays } from 'date-fns'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    todayAttendance: 0,
    totalEmployees: 0,
  })
  const [todayPresent, setTodayPresent] = useState([])
  const [recentOrders, setRecentOrders] = useState([])
  const [revenueData, setRevenueData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // Fetch stats
      const [customersResult, ordersResult, attendanceResult, employeesResult] = await Promise.all([
        supabase.from('customers').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id, total_amount', { count: 'exact', head: true }),
        supabase
          .from('attendance')
          .select('user_id')
          .eq('date', new Date().toISOString().split('T')[0])
          .eq('status', 'present'),
        supabase.from('users').select('id', { count: 'exact', head: true }),
      ])

      const totalRevenue = ordersResult.data
        ? ordersResult.data.reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0)
        : 0

      setStats({
        totalCustomers: customersResult.count || 0,
        totalOrders: ordersResult.count || 0,
        totalRevenue,
        todayAttendance: attendanceResult.data?.length || 0,
        totalEmployees: employeesResult.count || 0,
      })

      // Fetch today's present employees
      if (attendanceResult.data) {
        const userIds = attendanceResult.data.map((a) => a.user_id)
        const { data: presentUsers } = await supabase
          .from('users')
          .select('id, full_name, role')
          .in('id', userIds)
        setTodayPresent(presentUsers || [])
      }

      // Fetch recent orders
      const { data: orders } = await supabase
        .from('orders')
        .select('id, order_number, total_amount, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5)
      setRecentOrders(orders || [])

      // Fetch revenue data for last 7 days
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), 6 - i)
        return format(date, 'yyyy-MM-dd')
      })

      const revenuePromises = last7Days.map(async (date) => {
        const { data } = await supabase
          .from('orders')
          .select('total_amount')
          .gte('created_at', date + 'T00:00:00')
          .lt('created_at', date + 'T23:59:59')

        const revenue = data?.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0) || 0
        return {
          date: format(new Date(date), 'MMM d'),
          revenue,
        }
      })

      const revenueChartData = await Promise.all(revenuePromises)
      setRevenueData(revenueChartData)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Customers',
      value: stats.totalCustomers,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'bg-green-500',
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-purple-500',
    },
    {
      title: 'Today Attendance',
      value: `${stats.todayAttendance}/${stats.totalEmployees}`,
      icon: Calendar,
      color: 'bg-orange-500',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.title} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Attendance */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Attendance</h3>
          {todayPresent.length === 0 ? (
            <p className="text-gray-500">No one has marked attendance today</p>
          ) : (
            <div className="space-y-2">
              {todayPresent.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{user.full_name}</p>
                    <p className="text-sm text-gray-500">{user.role}</p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    Present
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
          {recentOrders.length === 0 ? (
            <p className="text-gray-500">No orders yet</p>
          ) : (
            <div className="space-y-2">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{order.order_number}</p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(order.created_at), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      ${parseFloat(order.total_amount).toFixed(2)}
                    </p>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        order.status === 'delivered'
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'processing'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend (Last 7 Days)</h3>
        {revenueData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} name="Revenue ($)" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-center py-8">No revenue data available</p>
        )}
      </div>
    </div>
  )
}

