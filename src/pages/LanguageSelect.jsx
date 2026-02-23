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
      style={{
        minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(145deg, #1a0a0e 0%, #5a1e2d 50%, #7e2b3f 100%)',
      }}
    >
      {/* Rings */}
      {[320, 480, 640].map(s => (
        <div key={s} style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          width: s, height: s, borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.05)', pointerEvents: 'none',
        }} />
      ))}
      <div style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width:320, height:1, background:'linear-gradient(to right, transparent, rgba(201,149,107,0.5), transparent)' }} />
      <div style={{ position:'absolute', bottom:0, left:'50%', transform:'translateX(-50%)', width:320, height:1, background:'linear-gradient(to right, transparent, rgba(201,149,107,0.5), transparent)' }} />

      <div style={{ position:'relative', zIndex:10, textAlign:'center', padding:'0 24px', maxWidth:320, width:'100%' }}>

        {/* Logo */}
        <motion.div
          initial={{ scale:0.8, opacity:0 }}
          animate={{ scale:1, opacity:1 }}
          transition={{ type:'spring', duration:0.8 }}
          style={{ display:'flex', justifyContent:'center', marginBottom:32 }}
        >
          <div style={{ position:'relative' }}>
            <div style={{ position:'absolute', inset:-10, borderRadius:'50%', border:'1px solid rgba(201,149,107,0.25)' }} />
            <div style={{ position:'absolute', inset:-20, borderRadius:'50%', border:'1px solid rgba(201,149,107,0.12)' }} />
            <img src="/logo.jpg" alt="Arica Lounge" style={{
              width:120, height:120, borderRadius:'50%', objectFit:'cover',
              border:'2px solid rgba(201,149,107,0.4)',
              boxShadow:'0 20px 60px rgba(0,0,0,0.5)',
              display:'block',
            }} />
          </div>
        </motion.div>

        {/* Name */}
        <motion.div initial={{ y:30, opacity:0 }} animate={{ y:0, opacity:1 }} transition={{ delay:0.3 }}>
          <div style={{ fontFamily:'Montserrat,sans-serif', fontWeight:800, color:'#fdf6ee', letterSpacing:'0.3em', fontSize:'2.8rem', textTransform:'uppercase', lineHeight:1 }}>
            ARICA
          </div>
          <div style={{ fontFamily:'Montserrat,sans-serif', color:'#c9956b', letterSpacing:'0.6em', fontSize:'0.7rem', textTransform:'uppercase', marginTop:6 }}>
            LOUNGE
          </div>
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX:0 }} animate={{ scaleX:1 }} transition={{ delay:0.55, duration:0.5 }}
          style={{ display:'flex', alignItems:'center', gap:10, justifyContent:'center', margin:'28px 0' }}
        >
          <div style={{ height:1, width:40, background:'linear-gradient(to right, transparent, rgba(201,149,107,0.6))' }} />
          <div style={{ width:3, height:3, borderRadius:'50%', background:'#c9956b' }} />
          <div style={{ width:5, height:5, borderRadius:'50%', background:'#c9956b', opacity:0.7 }} />
          <div style={{ width:3, height:3, borderRadius:'50%', background:'#c9956b' }} />
          <div style={{ height:1, width:40, background:'linear-gradient(to left, transparent, rgba(201,149,107,0.6))' }} />
        </motion.div>

        {/* Label */}
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.65 }}>
          <div style={{ fontFamily:'Montserrat,sans-serif', color:'rgba(255,255,255,0.25)', fontSize:'0.62rem', letterSpacing:'0.4em', textTransform:'uppercase', marginBottom:24 }}>
            Select Language · اختر اللغة
          </div>
        </motion.div>

        {/* Language Buttons */}
        <motion.div
          initial={{ y:20, opacity:0 }} animate={{ y:0, opacity:1 }} transition={{ delay:0.75 }}
          style={{ display:'flex', gap:16, justifyContent:'center' }}
        >
          {/* English */}
          <button
            onClick={() => handleSelect('en')}
            style={{
              width:140, padding:'22px 12px', borderRadius:16, cursor:'pointer',
              border:'1px solid rgba(201,149,107,0.3)',
              background:'rgba(255,255,255,0.05)',
              backdropFilter:'blur(10px)',
              transition:'all 0.3s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(201,149,107,0.7)'; e.currentTarget.style.background='rgba(255,255,255,0.1)'; e.currentTarget.style.transform='translateY(-4px)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(201,149,107,0.3)'; e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.transform='translateY(0)' }}
          >
            <div style={{ fontFamily:'Montserrat,sans-serif', color:'#fdf6ee', fontWeight:700, letterSpacing:'0.2em', fontSize:'0.85rem', textTransform:'uppercase' }}>
              EN
            </div>
            <div style={{ fontFamily:'Montserrat,sans-serif', color:'rgba(255,255,255,0.5)', fontSize:'0.72rem', marginTop:6, letterSpacing:'0.1em' }}>
              English
            </div>
            <div style={{ height:1, width:24, background:'rgba(201,149,107,0.4)', margin:'10px auto 0' }} />
            <div style={{ fontFamily:'Montserrat,sans-serif', color:'rgba(201,149,107,0.5)', fontSize:'0.58rem', marginTop:8, letterSpacing:'0.3em', textTransform:'uppercase' }}>
              Continue
            </div>
          </button>

          {/* Arabic */}
          <button
            onClick={() => handleSelect('ar')}
            dir="rtl"
            style={{
              width:140, padding:'22px 12px', borderRadius:16, cursor:'pointer',
              border:'1px solid rgba(201,149,107,0.3)',
              background:'rgba(255,255,255,0.05)',
              backdropFilter:'blur(10px)',
              transition:'all 0.3s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(201,149,107,0.7)'; e.currentTarget.style.background='rgba(255,255,255,0.1)'; e.currentTarget.style.transform='translateY(-4px)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(201,149,107,0.3)'; e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.transform='translateY(0)' }}
          >
            <div style={{ fontFamily:'Montserrat,sans-serif', color:'#fdf6ee', fontWeight:700, letterSpacing:'0.2em', fontSize:'0.85rem', textTransform:'uppercase' }}>
              AR
            </div>
            <div style={{ fontFamily:'Noto Naskh Arabic,serif', color:'rgba(255,255,255,0.5)', fontSize:'0.85rem', marginTop:6 }}>
              عربي
            </div>
            <div style={{ height:1, width:24, background:'rgba(201,149,107,0.4)', margin:'10px auto 0' }} />
            <div style={{ fontFamily:'Noto Naskh Arabic,serif', color:'rgba(201,149,107,0.5)', fontSize:'0.7rem', marginTop:8 }}>
              استمر
            </div>
          </button>
        </motion.div>

        {/* Staff link */}
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.1 }} style={{ marginTop:48 }}>
          <a
            href="/staff/login"
            style={{ fontFamily:'Montserrat,sans-serif', color:'rgba(255,255,255,0.15)', fontSize:'0.6rem', letterSpacing:'0.35em', textTransform:'uppercase', textDecoration:'none', transition:'color 0.2s' }}
            onMouseEnter={e => e.target.style.color='rgba(255,255,255,0.35)'}
            onMouseLeave={e => e.target.style.color='rgba(255,255,255,0.15)'}
          >
            STAFF ACCESS
          </a>
        </motion.div>

      </div>
    </div>
  )
}
