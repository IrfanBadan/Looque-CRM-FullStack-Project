import { useState, useEffect } from 'react'
import { supabase } from '../../services/supabase'
import { DollarSign, CheckCircle, XCircle, Calendar } from 'lucide-react'
import { format } from 'date-fns'

export default function SalaryManagement() {
  const [employees, setEmployees] = useState([])
  const [salaryRecords, setSalaryRecords] = useState([])
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  )
  const [loading, setLoading] = useState(true)
  const [calculating, setCalculating] = useState(false)

  useEffect(() => {
    fetchEmployees()
    fetchSalaryRecords()
  }, [selectedMonth])

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .neq('role', 'admin')
        .order('full_name')

      if (error) throw error
      setEmployees(data || [])
    } catch (error) {
      console.error('Error fetching employees:', error)
    }
  }

  const fetchSalaryRecords = async () => {
    setLoading(true)
    try {
      const [month, year] = selectedMonth.split('-').map(Number)
      const { data, error } = await supabase
        .from('salary_records')
        .select('*, users(full_name, role, salary_per_day)')
        .eq('month', month)
        .eq('year', year)

      if (error) throw error
      setSalaryRecords(data || [])
    } catch (error) {
      console.error('Error fetching salary records:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateSalary = async () => {
    setCalculating(true)
    try {
      const [month, year] = selectedMonth.split('-').map(Number)
      const startDate = new Date(year, month - 1, 1)
      const endDate = new Date(year, month, 0)

      for (const employee of employees) {
        // Count present days
        const { data: attendance, error: attError } = await supabase
          .from('attendance')
          .select('*')
          .eq('user_id', employee.id)
          .gte('date', format(startDate, 'yyyy-MM-dd'))
          .lte('date', format(endDate, 'yyyy-MM-dd'))

        if (attError) throw attError

        const presentDays = attendance?.filter((a) => a.status === 'present').length || 0
        const absentDays = attendance?.filter((a) => a.status === 'absent').length || 0
        const totalDays = new Date(year, month, 0).getDate()
        const calculatedAmount = (employee.salary_per_day || 0) * presentDays

        // Check if record exists
        const { data: existing } = await supabase
          .from('salary_records')
          .select('id')
          .eq('user_id', employee.id)
          .eq('month', month)
          .eq('year', year)
          .single()

        if (existing) {
          // Update existing record
          await supabase
            .from('salary_records')
            .update({
              present_days: presentDays,
              absent_days: absentDays,
              calculated_amount: calculatedAmount,
            })
            .eq('id', existing.id)
        } else {
          // Create new record
          await supabase.from('salary_records').insert({
            user_id: employee.id,
            month,
            year,
            present_days: presentDays,
            absent_days: absentDays,
            salary_amount: employee.salary || 0,
            calculated_amount: calculatedAmount,
            status: 'pending',
          })
        }
      }

      await fetchSalaryRecords()
      alert('Salary calculated successfully!')
    } catch (error) {
      console.error('Error calculating salary:', error)
      alert('Failed to calculate salary: ' + error.message)
    } finally {
      setCalculating(false)
    }
  }

  const markAsPaid = async (recordId) => {
    try {
      const { error } = await supabase
        .from('salary_records')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
        })
        .eq('id', recordId)

      if (error) throw error
      await fetchSalaryRecords()
      alert('Salary marked as paid!')
    } catch (error) {
      console.error('Error marking salary as paid:', error)
      alert('Failed to update: ' + error.message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Salary Management</h1>
        <div className="flex gap-3">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={calculateSalary}
            disabled={calculating}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
          >
            <DollarSign size={20} />
            {calculating ? 'Calculating...' : 'Calculate Salary'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : salaryRecords.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No salary records for {format(new Date(selectedMonth + '-01'), 'MMMM yyyy')}. Click
            "Calculate Salary" to generate records.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Employee</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Role</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Present Days</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Absent Days</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">
                    Salary/Day
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">
                    Calculated Amount
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {salaryRecords.map((record) => (
                  <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">{record.users?.full_name || 'Unknown'}</td>
                    <td className="py-3 px-4">{record.users?.role || '-'}</td>
                    <td className="py-3 px-4 text-center">{record.present_days}</td>
                    <td className="py-3 px-4 text-center">{record.absent_days}</td>
                    <td className="py-3 px-4 text-center">
                      ${parseFloat(record.users?.salary_per_day || 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center font-semibold">
                      ${parseFloat(record.calculated_amount || 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          record.status === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {record.status === 'pending' && (
                        <button
                          onClick={() => markAsPaid(record.id)}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                        >
                          Mark Paid
                        </button>
                      )}
                      {record.status === 'paid' && record.paid_at && (
                        <span className="text-xs text-gray-500">
                          Paid: {format(new Date(record.paid_at), 'MMM d, yyyy')}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}


