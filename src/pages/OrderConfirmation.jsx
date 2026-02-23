import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, Clock, MapPin } from 'lucide-react'
import { useLanguageStore } from '../store'
import { t } from '../i18n/translations'
import { playSingleChime } from '../utils/sound'

export default function OrderConfirmation() {
  const navigate = useNavigate()
  const location = useLocation()
  const storedLang = useLanguageStore((s) => s.lang)
  const { order, lang: stateLang } = location.state || {}
  const lang = stateLang || storedLang || 'en'
  const isRtl = lang === 'ar'

  useEffect(() => {
    playSingleChime()
  }, [])

  const locationLabels = {
    salon: isRtl ? 'صالون الرجال' : "Men's Salon",
    reception: isRtl ? 'استقبال مركز السيارات' : 'Car Care Reception',
  }

  return (
    <div
      className={`min-h-screen bg-dark flex items-center justify-center p-6 ${isRtl ? 'rtl' : 'ltr'}`}
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{ background: 'radial-gradient(ellipse at center, #1a0f0a 0%, #0d0604 100%)' }}
    >
      {/* Decorative rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full border border-coffee-800/20 animate-pulse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full border border-coffee-800/10" />

      <div className="relative z-10 text-center max-w-sm w-full">
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', duration: 0.8 }}
          className="flex justify-center mb-8"
        >
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-coffee-600/20 border-2 border-coffee-500/50 
                            flex items-center justify-center alarm-ring">
              <CheckCircle className="text-coffee-400" size={40} />
            </div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h1 className="font-display text-4xl font-bold text-cream mb-2">
            {t(lang, 'orderPlaced')}
          </h1>
          <p className="text-coffee-400 font-body">{t(lang, 'orderPlacedSub')}</p>
        </motion.div>

        {/* Order Card */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 bg-coffee-900/60 border border-coffee-800/50 rounded-3xl p-6 text-left"
          dir={isRtl ? 'rtl' : 'ltr'}
        >
          {order && (
            <div className="flex items-center justify-between mb-4">
              <span className="text-coffee-500 text-sm font-body">{t(lang,'orderNumber')}</span>
              <span className="text-cream font-display font-bold text-2xl">#{order.id}</span>
            </div>
          )}

          <div className="flex items-center gap-3 py-3 border-t border-coffee-800/50">
            <Clock className="text-coffee-500" size={18} />
            <span className="text-coffee-300 font-body text-sm">{t(lang, 'estimatedTime')}</span>
          </div>

          {order?.location && (
            <div className="flex items-center gap-3 py-3 border-t border-coffee-800/50">
              <MapPin className="text-coffee-500" size={18} />
              <span className="text-coffee-300 font-body text-sm">
                {locationLabels[order.location] || order.location}
              </span>
            </div>
          )}
        </motion.div>

        {/* Relax message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-6 text-coffee-600 font-body text-sm"
        >
          ☕ {t(lang, 'thankYou')}
        </motion.p>

        {/* New Order Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="mt-8"
        >
          <button
            onClick={() => navigate('/menu')}
            className="btn-primary px-10"
          >
            {t(lang, 'newOrder')}
          </button>
        </motion.div>
      </div>
    </div>
  )
}
