import { useNavigate } from 'react-router-dom'
import { useLanguageStore } from '../store'
import { motion } from 'framer-motion'

const CoffeeIcon = () => (
  <svg viewBox="0 0 80 80" className="w-16 h-16" fill="none">
    <circle cx="40" cy="40" r="38" stroke="#d4841e" strokeWidth="2" opacity="0.3"/>
    <circle cx="40" cy="40" r="30" stroke="#d4841e" strokeWidth="1.5" opacity="0.5"/>
    {/* Cup */}
    <path d="M25 38 L28 55 Q28 58 31 58 L49 58 Q52 58 52 55 L55 38 Z" fill="#7d4017" opacity="0.9"/>
    {/* Handle */}
    <path d="M55 42 Q63 42 63 50 Q63 58 55 58" stroke="#7d4017" strokeWidth="3" fill="none" strokeLinecap="round"/>
    {/* Steam */}
    <path d="M33 32 Q35 28 33 24" stroke="#d4841e" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7"/>
    <path d="M40 30 Q42 26 40 22" stroke="#d4841e" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7"/>
    <path d="M47 32 Q49 28 47 24" stroke="#d4841e" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7"/>
    {/* Saucer */}
    <ellipse cx="40" cy="59" rx="16" ry="3" fill="#994f14" opacity="0.8"/>
  </svg>
)

export default function LanguageSelect() {
  const navigate = useNavigate()
  const setLang = useLanguageStore((s) => s.setLang)

  const handleSelect = (lang) => {
    setLang(lang)
    navigate('/menu')
  }

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-coffee-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Radial gradient glow */}
      <div className="absolute inset-0 bg-gradient-radial from-coffee-900/20 via-transparent to-transparent"
        style={{ background: 'radial-gradient(ellipse at center, rgba(121,79,20,0.15) 0%, transparent 70%)' }}
      />

      {/* Decorative rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border border-coffee-800/30" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-coffee-800/20" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full border border-coffee-800/10" />

      <div className="relative z-10 text-center px-6">
        {/* Logo/Icon */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', duration: 0.8 }}
          className="flex justify-center mb-8"
        >
          <CoffeeIcon />
        </motion.div>

        {/* Shop Name */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <div className="text-coffee-500 text-sm font-body tracking-[0.4em] uppercase mb-2">
            Welcome to
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-cream mb-2 leading-tight">
            The Coffee
          </h1>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-coffee-400 leading-tight">
            Lounge
          </h1>
          <div className="mt-4 text-coffee-600/60 text-xs tracking-[0.3em] uppercase font-body">
            Premium · Crafted · Fresh
          </div>
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="my-10 flex items-center gap-4 justify-center"
        >
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-coffee-600/50" />
          <div className="w-1.5 h-1.5 rounded-full bg-coffee-500" />
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-coffee-600/50" />
        </motion.div>

        {/* Language Selection Label */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-coffee-500/70 text-sm font-body tracking-widest uppercase mb-6"
        >
          Select Language · اختر اللغة
        </motion.div>

        {/* Language Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="flex gap-4 justify-center"
        >
          {/* English */}
          <button
            onClick={() => handleSelect('en')}
            className="group relative overflow-hidden w-44 py-5 rounded-2xl 
                       border border-coffee-700/50 hover:border-coffee-500/80
                       bg-coffee-900/50 hover:bg-coffee-800/60
                       transition-all duration-300 hover:-translate-y-1
                       hover:shadow-xl hover:shadow-coffee-900/50"
          >
            <div className="relative z-10">
              <div className="text-3xl mb-2">🇬🇧</div>
              <div className="text-cream font-display text-xl font-semibold">English</div>
              <div className="text-coffee-500 text-xs mt-1 tracking-wider">CONTINUE</div>
            </div>
          </button>

          {/* Arabic */}
          <button
            onClick={() => handleSelect('ar')}
            dir="rtl"
            className="group relative overflow-hidden w-44 py-5 rounded-2xl
                       border border-coffee-700/50 hover:border-coffee-500/80
                       bg-coffee-900/50 hover:bg-coffee-800/60
                       transition-all duration-300 hover:-translate-y-1
                       hover:shadow-xl hover:shadow-coffee-900/50"
          >
            <div className="relative z-10">
              <div className="text-3xl mb-2">🇦🇪</div>
              <div className="text-cream font-arabic text-xl font-semibold">عربي</div>
              <div className="text-coffee-500 text-xs mt-1 tracking-wider">استمر</div>
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
            className="text-coffee-700/50 hover:text-coffee-600/70 text-xs 
                       font-body tracking-widest uppercase transition-colors"
          >
            Staff Login
          </a>
        </motion.div>
      </div>
    </div>
  )
}
