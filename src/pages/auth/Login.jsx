import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import './Login.css' // We'll add our CSS animations here

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, userProfile } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (userProfile) {
      if (userProfile.role === 'admin') navigate('/dashboard', { replace: true })
      else if (userProfile.role && userProfile.role !== 'admin') navigate('/attendance', { replace: true })
    }
  }, [userProfile, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { user, error: signInError } = await signIn(email, password)
      if (signInError) {
        setError(signInError)
        setLoading(false)
        return
      }
      if (user) {
        setTimeout(() => {
          if (!userProfile) {
            setError('User profile not found. Please check your account.')
            setLoading(false)
          }
        }, 1000)
      } else {
        setError('Failed to sign in. Please try again.')
        setLoading(false)
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
      setLoading(false)
      console.error('Login error:', err)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-b from-gray-900 via-gray-800 to-black">
      {/* Animated floating lights */}
      <div className="floating-lights"></div>

      <div className="max-w-md w-full bg-gray-900/80 backdrop-blur-md rounded-2xl shadow-2xl p-10 text-gray-200 animate-fadeIn">
        <h2 className="text-3xl font-bold mb-2 text-center animate-fadeDown">LooQue CRM</h2>
        <p className="text-center text-gray-400 mb-6 text-sm animate-fadeDown delay-200">
          Welcome to Looque! <br/> "Every morning is a chance to improve, grow, and achieve."
        </p>

        <div className="flex items-center my-5">
          <hr className="flex-grow border-gray-700 animate-lineExpand" />
          <hr className="flex-grow border-gray-700 animate-lineExpand delay-200" />
        </div>

        <p className="text-center text-gray-400 mb-6 text-sm animate-fadeDown delay-400">
          Enter your appropriate email & password given by company
        </p>

        {error && (
          <div className="bg-red-600/20 border border-red-500 text-red-400 px-4 py-3 rounded mb-4 animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 animate-fadeUp delay-600">
          <div className="relative ">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              className="w-full px-4 py-3 bg-gray-800 text-gray-200 rounded-xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div className="relative ">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              className="w-full px-4 py-3 bg-gray-800 text-gray-200 rounded-xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white font-semibold shadow-lg hover:scale-105 transition transform disabled:opacity-50 disabled:cursor-not-allowed animate-pulseButton"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
