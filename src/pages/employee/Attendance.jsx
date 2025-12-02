import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../services/supabase'
import { Calendar, CheckCircle, XCircle, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { useNavigate } from 'react-router-dom'

export default function Attendance() {
  const { userProfile } = useAuth()
  const [todayAttendance, setTodayAttendance] = useState(null)
  const [attendanceHistory, setAttendanceHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(true)

  const today = new Date().toISOString().split('T')[0]

  const navigate = useNavigate()

  useEffect(() => {
    fetchTodayAttendance()
    fetchAttendanceHistory()
  }, [])

  const fetchTodayAttendance = async () => {
    if (!userProfile) return

    try {
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('user_id', userProfile.id)
        .eq('date', today)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      setTodayAttendance(data || null)
    } catch (error) {
      console.error('Error fetching today attendance:', error)
    }
  }

  const fetchAttendanceHistory = async () => {
    if (!userProfile) return

    setLoadingHistory(true)
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('user_id', userProfile.id)
        .order('date', { ascending: false })
        .limit(30)

      if (error) throw error
      setAttendanceHistory(data || [])
    } catch (error) {
      console.error('Error fetching attendance history:', error)
    } finally {
      setLoadingHistory(false)
    }
  }

  const markPresent = async () => {
    if (!userProfile) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('attendance')
        .insert({
          user_id: userProfile.id,
          date: today,
          check_in_time: new Date().toISOString(),
          status: 'present',
        })
        .select()
        .single()

      if (error) throw error
      setTodayAttendance(data)
      await fetchAttendanceHistory()
    } catch (error) {
      console.error('Error marking attendance:', error)
      alert('Failed to mark attendance. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="text-green-500" size={20} />
      case 'absent':
        return <XCircle className="text-red-500" size={20} />
      case 'late':
        return <Clock className="text-yellow-500" size={20} />
      default:
        return null
    }
  }

  const goToLogin = async () => {
  await supabase.auth.signOut()
  navigate('/login')
}


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto p-6">

        {/* HEADER */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
              <p className="text-gray-600 mt-1">Welcome, {userProfile?.full_name}</p>
            </div>

            <div className="text-right">
              <p className="text-sm text-gray-500">Today</p>
              <p className="text-lg font-semibold text-gray-900">
                {format(new Date(), 'EEEE, MMMM d, yyyy')}
              </p>

              {/* RETURN TO LOGIN BUTTON */}
              <button
  onClick={goToLogin}
  className="mt-3 bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium 
             hover:bg-red-600 transition"
>
  Return to Login
</button>

            </div>
          </div>
        </div>

        {/* MARK PRESENT CARD */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6 text-center">
          {todayAttendance ? (
            <div>
              <div className="mb-4">
                <CheckCircle className="mx-auto text-green-500" size={64} />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Already Marked Present
              </h2>
              <p className="text-gray-600">
                Check-in time: {format(new Date(todayAttendance.check_in_time), 'h:mm a')}
              </p>
            </div>
          ) : (
            <div>
              <div className="mb-4">
                <Calendar className="mx-auto text-blue-500" size={64} />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Mark Your Attendance
              </h2>
              <button
                onClick={markPresent}
                disabled={loading}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? 'Marking...' : 'Mark Present'}
              </button>
            </div>
          )}
        </div>

        {/* ATTENDANCE HISTORY */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Attendance</h2>
          {loadingHistory ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : attendanceHistory.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No attendance records found</p>
          ) : (
            <div className="space-y-3">
              {attendanceHistory.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    {getStatusIcon(record.status)}
                    <div>
                      <p className="font-medium text-gray-900">
                        {format(new Date(record.date), 'EEEE, MMMM d, yyyy')}
                      </p>
                      {record.check_in_time && (
                        <p className="text-sm text-gray-500">
                          Check-in: {format(new Date(record.check_in_time), 'h:mm a')}
                        </p>
                      )}
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      record.status === 'present'
                        ? 'bg-green-100 text-green-800'
                        : record.status === 'late'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {record.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

