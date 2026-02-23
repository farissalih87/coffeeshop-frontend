import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'
import { useAuthStore } from '../store'
import { authApi } from '../api'
import toast from 'react-hot-toast'

export default function StaffLogin() {
  const navigate  = useNavigate()
  const login     = useAuthStore((s) => s.login)
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)

  const handleLogin = async () => {
    if (!email || !password) return toast.error('Please enter credentials')
    setLoading(true)
    try {
      const res = await authApi.login(email, password)
      const { user, token } = res.data
      login(user, token)
      if (user.role === 'admin') navigate('/admin')
      else navigate('/staff')
      toast.success(`Welcome, ${user.name}!`)
    } catch {
      toast.error('Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      style={{ background: 'linear-gradient(145deg, #1a0a0e 0%, #5a1e2d 50%, #7e2b3f 100%)' }}
    >
      {/* Rings */}
      {[320, 500].map(size => (
        <div key={size} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5"
          style={{ width: size, height: size }} />
      ))}

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-5">
            <img
              src="/logo.jpg"
              alt="Arica Lounge"
              className="w-20 h-20 rounded-full object-cover shadow-xl"
              style={{ border: '2px solid rgba(201,149,107,0.4)' }}
            />
          </div>
          <h1 style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '1.6rem',
            fontWeight: '800',
            color: '#fdf6ee',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
          }}>
            ARICA
          </h1>
          <p style={{
            fontFamily: 'Montserrat, sans-serif',
            color: '#c9956b',
            letterSpacing: '0.5em',
            fontSize: '0.65rem',
            textTransform: 'uppercase',
            marginTop: '4px',
          }}>
            LOUNGE
          </p>
          <p style={{
            fontFamily: 'Montserrat, sans-serif',
            color: 'rgba(255,255,255,0.25)',
            fontSize: '0.65rem',
            letterSpacing: '0.2em',
            marginTop: '12px',
            textTransform: 'uppercase',
          }}>
            Staff & Admin Portal
          </p>
        </div>

        {/* Form */}
        <div className="rounded-3xl p-6 space-y-4"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}
        >
          {/* Email */}
          <div>
            <label style={{
              fontFamily: 'Montserrat, sans-serif',
              color: 'rgba(255,255,255,0.4)',
              fontSize: '0.6rem',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: '8px',
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="your@email.com"
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '12px 16px',
                color: '#fdf6ee',
                fontFamily: 'Montserrat, sans-serif',
                fontSize: '0.9rem',
                outline: 'none',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(201,149,107,0.5)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>

          {/* Password */}
          <div>
            <label style={{
              fontFamily: 'Montserrat, sans-serif',
              color: 'rgba(255,255,255,0.4)',
              fontSize: '0.6rem',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: '8px',
            }}>
              Password
            </label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  padding: '12px 48px 12px 16px',
                  color: '#fdf6ee',
                  fontFamily: 'Montserrat, sans-serif',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(201,149,107,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: 'rgba(255,255,255,0.3)' }}
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 disabled:opacity-60 transition-all duration-200 hover:-translate-y-0.5"
            style={{
              background: '#7e2b3f',
              color: '#fdf6ee',
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: '700',
              fontSize: '0.75rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              padding: '14px',
              borderRadius: '12px',
              border: '1px solid rgba(201,149,107,0.2)',
              marginTop: '8px',
              cursor: 'pointer',
            }}
          >
            {loading
              ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : 'SIGN IN'
            }
          </button>
        </div>

        <div className="text-center mt-6">
          <a
            href="/"
            style={{
              fontFamily: 'Montserrat, sans-serif',
              color: 'rgba(255,255,255,0.2)',
              fontSize: '0.6rem',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.target.style.color = 'rgba(255,255,255,0.4)'}
            onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.2)'}
          >
            ← BACK TO MENU
          </a>
        </div>
      </motion.div>
    </div>
  )
}
