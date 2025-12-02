import { useState, useEffect } from 'react'
import { supabase } from '../../services/supabase'
import { Calendar, Filter, Download } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns'

export default function AttendanceReports() {
  const [attendance, setAttendance] = useState([])
  const [employees, setEmployees] = useState([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedEmployee, setSelectedEmployee] = useState('all')
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [view, setView] = useState('daily') // 'daily' or 'monthly'
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEmployees()
  }, [])

  useEffect(() => {
    if (view === 'daily') {
      fetchDailyAttendance()
    } else {
      fetchMonthlyAttendance()
    }
  }, [selectedDate, selectedEmployee, selectedMonth, view])

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, role')
        .neq('role', 'admin')
        .order('full_name')

      if (error) throw error
      setEmployees(data || [])
    } catch (error) {
      console.error('Error fetching employees:', error)
    }
  }

  const fetchDailyAttendance = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('attendance')
        .select('*, users(full_name, role)')
        .eq('date', selectedDate)

      if (selectedEmployee !== 'all') {
        query = query.eq('user_id', selectedEmployee)
      }

      const { data, error } = await query.order('check_in_time')

      if (error) throw error
      setAttendance(data || [])
    } catch (error) {
      console.error('Error fetching daily attendance:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMonthlyAttendance = async () => {
    setLoading(true)
    try {
      const startDate = startOfMonth(new Date(selectedMonth + '-01'))
      const endDate = endOfMonth(new Date(selectedMonth + '-01'))

      let query = supabase
        .from('attendance')
        .select('*, users(full_name, role)')
        .gte('date', format(startDate, 'yyyy-MM-dd'))
        .lte('date', format(endDate, 'yyyy-MM-dd'))

      if (selectedEmployee !== 'all') {
        query = query.eq('user_id', selectedEmployee)
      }

      const { data, error } = await query.order('date', { ascending: false })

      if (error) throw error
      setAttendance(data || [])
    } catch (error) {
      console.error('Error fetching monthly attendance:', error)
    } finally {
      setLoading(false)
    }
  }

  const getMonthlySummary = () => {
    const summary = {}
    attendance.forEach((record) => {
      const userId = record.user_id
      const userName = record.users?.full_name || 'Unknown'
      if (!summary[userId]) {
        summary[userId] = {
          name: userName,
          role: record.users?.role,
          present: 0,
          absent: 0,
          late: 0,
        }
      }
      summary[userId][record.status] = (summary[userId][record.status] || 0) + 1
    })
    return Object.values(summary)
  }

return (
  <div className="space-y-6">
    {/* Header + Buttons */}
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <h1 className="text-2xl font-bold text-gray-900">Attendance Reports</h1>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setView('daily')}
          className={`px-4 py-2 rounded-lg text-sm md:text-base ${
            view === 'daily'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          Daily View
        </button>

        <button
          onClick={() => setView('monthly')}
          className={`px-4 py-2 rounded-lg text-sm md:text-base ${
            view === 'monthly'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          Monthly View
        </button>
      </div>
    </div>

    {/* Filters Card */}
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {/* Date / Month */}
        {view === 'daily' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Employee Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Employee</label>

          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Employees</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.full_name} ({emp.role})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading spinner */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : view === 'daily' ? (
        /* Daily View */
        <div>
          <h2 className="text-lg font-semibold mb-4">
            Attendance for {format(new Date(selectedDate), 'MMMM d, yyyy')}
          </h2>

          {attendance.length === 0 ? (
            <p className="text-gray-500">No attendance records for this date</p>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4">Employee</th>
                    <th className="text-left py-3 px-4">Role</th>
                    <th className="text-left py-3 px-4">Check-in</th>
                    <th className="text-left py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((record) => (
                    <tr key={record.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{record.users?.full_name}</td>
                      <td className="py-3 px-4">{record.users?.role}</td>
                      <td className="py-3 px-4">
                        {record.check_in_time
                          ? format(new Date(record.check_in_time), 'h:mm a')
                          : '-'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded text-sm ${
                            record.status === 'present'
                              ? 'bg-green-100 text-green-800'
                              : record.status === 'late'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Monthly Summary */
        <div>
          <h2 className="text-lg font-semibold mb-4">
            Monthly Summary for {format(new Date(selectedMonth + '-01'), 'MMMM yyyy')}
          </h2>

          {attendance.length === 0 ? (
            <p className="text-gray-500">No attendance records for this month</p>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4">Employee</th>
                    <th className="text-left py-3 px-4">Role</th>
                    <th className="text-center py-3 px-4">Present</th>
                    <th className="text-center py-3 px-4">Absent</th>
                    <th className="text-center py-3 px-4">Late</th>
                    <th className="text-center py-3 px-4">Total Days</th>
                  </tr>
                </thead>
                <tbody>
                  {getMonthlySummary().map((summary, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{summary.name}</td>
                      <td className="py-3 px-4">{summary.role}</td>
                      <td className="py-3 px-4 text-center">{summary.present}</td>
                      <td className="py-3 px-4 text-center">{summary.absent}</td>
                      <td className="py-3 px-4 text-center">{summary.late}</td>
                      <td className="py-3 px-4 text-center">
                        {summary.present + summary.absent + summary.late}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  </div>
)

}


