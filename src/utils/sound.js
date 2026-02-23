// Generates alarm sound using Web Audio API - no external files needed!
let audioCtx = null
let alarmInterval = null
let isAlarming = false

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  }
  return audioCtx
}

function playBeep(frequency = 880, duration = 0.2, type = 'sine', volume = 0.6) {
  const ctx = getAudioContext()
  const oscillator = ctx.createOscillator()
  const gainNode = ctx.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)

  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime)
  oscillator.type = type

  gainNode.gain.setValueAtTime(0, ctx.currentTime)
  gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01)
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

  oscillator.start(ctx.currentTime)
  oscillator.stop(ctx.currentTime + duration)
}

function playAlarmSequence() {
  // Coffee shop style pleasant but urgent alarm
  const now = getAudioContext().currentTime
  
  // Three-tone ascending alert
  setTimeout(() => playBeep(523, 0.15, 'triangle', 0.7), 0)
  setTimeout(() => playBeep(659, 0.15, 'triangle', 0.7), 180)
  setTimeout(() => playBeep(784, 0.25, 'triangle', 0.8), 360)
}

export function startAlarm() {
  if (isAlarming) return
  isAlarming = true
  
  playAlarmSequence()
  alarmInterval = setInterval(() => {
    if (isAlarming) playAlarmSequence()
  }, 1500)
}

export function stopAlarm() {
  isAlarming = false
  if (alarmInterval) {
    clearInterval(alarmInterval)
    alarmInterval = null
  }
}

export function playSingleChime() {
  // Soft confirmation sound
  setTimeout(() => playBeep(523, 0.1, 'sine', 0.4), 0)
  setTimeout(() => playBeep(659, 0.1, 'sine', 0.4), 120)
  setTimeout(() => playBeep(784, 0.2, 'sine', 0.5), 240)
}

// Request browser notification permission
export async function requestNotificationPermission() {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }
  return false
}

export function showBrowserNotification(title, body) {
  if ('Notification' in window && Notification.permission === 'granted') {
    const notification = new Notification(title, {
      body,
      icon: '/coffee-icon.svg',
      badge: '/coffee-icon.svg',
      requireInteraction: true,
      vibrate: [200, 100, 200],
    })
    
    notification.onclick = () => {
      window.focus()
      notification.close()
    }
    
    return notification
  }
}
