import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Coffee, Eye, EyeOff } from 'lucide-react'
import { useAuthStore } from '../store'
import { authApi } from '../api'
import toast from 'react-hot-toast'

export default function StaffLogin() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e?.preventDefault()
    if (!email || !password) return toast.error('Please enter credentials')
    setLoading(true)
    try {
      const res = await authApi.login(email, password)
      const { user, token } = res.data
      login(user, token)
      if (user.role === 'admin') navigate('/admin')
      else navigate('/staff')
      toast.success(`Welcome, ${user.name}!`)
    } catch (err) {
      // Demo login
      if (email === 'admin@coffeeshop.com' && password === 'password') {
        login({ id:1, name:'Admin', email, role:'admin' }, 'demo-token-admin')
        navigate('/admin')
        toast.success('Welcome, Admin!')
      } else if (email === 'staff@coffeeshop.com' && password === 'password') {
        login({ id:2, name:'Staff', email, role:'staff' }, 'demo-token-staff')
        navigate('/staff')
        toast.success('Welcome, Staff!')
      } else {
        toast.error('Invalid credentials')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-6"
      style={{ background: 'radial-gradient(ellipse at center, #1a0f0a 0%, #0d0604 100%)' }}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-coffee-600/20 border border-coffee-600/30 mb-4">
            <Coffee className="text-coffee-400" size={28} />
          </div>
          <h1 className="font-display text-3xl font-bold text-cream">Sign In</h1>
          <p className="text-coffee-500 text-sm mt-1 font-body">Staff & Admin Portal</p>
        </div>

        {/* Form */}
        <div className="bg-coffee-900/60 border border-coffee-800/50 rounded-3xl p-6 space-y-4">
          {/* Demo hint 
          <div className="bg-coffee-800/40 rounded-xl p-3 text-xs text-coffee-400 font-body">
            <strong>Demo:</strong> admin@coffeeshop.com / password<br/>
            Staff: staff@coffeeshop.com / password
          </div> */}

          <div>
            <label className="block text-coffee-300 text-sm font-body font-medium mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="your@email.com"
              className="w-full bg-dark/60 border border-coffee-700/50 focus:border-coffee-500 
                         rounded-xl px-4 py-3 text-cream font-body outline-none transition-colors
                         placeholder:text-coffee-700"
            />
          </div>

          <div>
            <label className="block text-coffee-300 text-sm font-body font-medium mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="••••••••"
                className="w-full bg-dark/60 border border-coffee-700/50 focus:border-coffee-500 
                           rounded-xl px-4 py-3 text-cream font-body outline-none transition-colors
                           placeholder:text-coffee-700 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-coffee-600 hover:text-coffee-400"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading
              ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : 'Sign In'
            }
          </button>
        </div>

        <div className="text-center mt-6">
          <a href="/" className="text-coffee-700 hover:text-coffee-500 text-xs font-body transition-colors">
            ← Back to Customer Menu
          </a>
        </div>
      </motion.div>
    </div>
  )
}
