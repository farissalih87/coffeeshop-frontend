import { useNavigate } from 'react-router-dom'
import { useLanguageStore } from '../store'
import { motion } from 'framer-motion'

export default function LanguageSelect() {
  const navigate = useNavigate()
  const setLang  = useLanguageStore((s) => s.setLang)

  const handleSelect = (lang) => {
    setLang(lang)
    navigate('/menu')
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(145deg, #1a0a0e 0%, #5a1e2d 50%, #7e2b3f 100%)' }}
    >
      {/* Decorative rings */}
      {[320, 480, 640].map(size => (
        <div key={size} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5"
          style={{ width: size, height: size }} />
      ))}

      {/* Gold shimmer lines */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-px"
        style={{ background: 'linear-gradient(to right, transparent, rgba(201,149,107,0.5), transparent)' }} />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-80 h-px"
        style={{ background: 'linear-gradient(to right, transparent, rgba(201,149,107,0.5), transparent)' }} />

      <div className="relative z-10 text-center px-6 max-w-xs w-full">

        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', duration: 0.8 }}
          className="flex justify-center mb-8"
        >
          <div className="relative">
            <div className="absolute rounded-full border border-gold-500/30"
              style={{ inset: '-8px' }} />
            <div className="absolute rounded-full border border-gold-500/15"
              style={{ inset: '-18px' }} />
            <img
              src="/logo.jpg"
              alt="Arica Lounge"
              className="w-28 h-28 rounded-full object-cover shadow-2xl"
              style={{ border: '2px solid rgba(201,149,107,0.4)' }}
            />
          </div>
        </motion.div>

        {/* Shop Name */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <h1 style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '2.8rem',
            fontWeight: '800',
            color: '#fdf6ee',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            lineHeight: 1,
          }}>
            ARICA
          </h1>
          <p style={{
            fontFamily: 'Montserrat, sans-serif',
            color: '#c9956b',
            letterSpacing: '0.6em',
            fontSize: '0.7rem',
            textTransform: 'uppercase',
            marginTop: '6px',
            fontWeight: '400',
          }}>
            LOUNGE
          </p>
        </motion.div>

        {/* Gold divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="my-8 flex items-center gap-3 justify-center"
        >
          <div className="h-px w-10" style={{ background: 'linear-gradient(to right, transparent, rgba(201,149,107,0.6))' }} />
          <div className="w-1 h-1 rounded-full bg-gold-500" />
          <div className="w-1.5 h-1.5 rounded-full bg-gold-400" />
          <div className="w-1 h-1 rounded-full bg-gold-500" />
          <div className="h-px w-10" style={{ background: 'linear-gradient(to left, transparent, rgba(201,149,107,0.6))' }} />
        </motion.div>

        {/* Language label */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          style={{
            fontFamily: 'Montserrat, sans-serif',
            color: 'rgba(255,255,255,0.25)',
            fontSize: '0.65rem',
            letterSpacing: '0.35em',
            textTransform: 'uppercase',
            marginBottom: '24px',
          }}
        >
          Select Language · اختر اللغة
        </motion.p>

        {/* Language Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="flex gap-4 justify-center"
        >
          <button
            onClick={() => handleSelect('en')}
            className="group w-36 py-5 rounded-2xl transition-all duration-300 hover:-translate-y-1"
            style={{
              border: '1px solid rgba(201,149,107,0.3)',
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(10px)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(201,149,107,0.7)'
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(201,149,107,0.3)'
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
            }}
          >
            <div className="text-3xl mb-2">🇬🇧</div>
            <div style={{ fontFamily:'Montserrat,sans-serif', color:'#fdf6ee', fontWeight:'600', letterSpacing:'0.15em', fontSize:'0.9rem' }}>
              ENGLISH
            </div>
            <div style={{ fontFamily:'Montserrat,sans-serif', color:'rgba(201,149,107,0.5)', fontSize:'0.6rem', marginTop:'4px', letterSpacing:'0.3em' }}>
              CONTINUE
            </div>
          </button>

          <button
            onClick={() => handleSelect('ar')}
            dir="rtl"
            className="group w-36 py-5 rounded-2xl transition-all duration-300 hover:-translate-y-1"
            style={{
              border: '1px solid rgba(201,149,107,0.3)',
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(10px)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(201,149,107,0.7)'
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(201,149,107,0.3)'
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
            }}
          >
            <div className="text-3xl mb-2">🇦🇪</div>
            <div style={{ fontFamily:'Noto Naskh Arabic,serif', color:'#fdf6ee', fontWeight:'600', fontSize:'1.1rem' }}>
              عربي
            </div>
            <div style={{ fontFamily:'Noto Naskh Arabic,serif', color:'rgba(201,149,107,0.5)', fontSize:'0.75rem', marginTop:'4px' }}>
              استمر
            </div>
          </button>
        </motion.div>

        {/* Staff link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-12"
        >
          <a
            href="/staff/login"
            style={{
              fontFamily: 'Montserrat, sans-serif',
              color: 'rgba(255,255,255,0.15)',
              fontSize: '0.6rem',
              letterSpacing: '0.35em',
              textTransform: 'uppercase',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.target.style.color = 'rgba(255,255,255,0.35)'}
            onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.15)'}
          >
            STAFF LOGIN
          </a>
        </motion.div>

      </div>
    </div>
  )
}
