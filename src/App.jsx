import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import Auth from './pages/Auth'
import Home from './pages/Home'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

function ResetPassword() {
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [done, setDone] = useState(false)

  const handleReset = async () => {
    if (!newPassword.trim() || newPassword.length < 8) {
      setMessage('Minimum 8 caractères !')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (!error) {
      setDone(true)
      setMessage('Mot de passe mis à jour ! ✅')
      setTimeout(() => {
        window.location.href = '/'
      }, 2000)
    } else {
      setMessage(error.message)
    }
    setLoading(false)
  }

  return (
    <div style={{ fontFamily: "'Fredoka One', cursive", background: 'linear-gradient(170deg, #E8572A 0%, #C4622D 50%, #8B3A0F 100%)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&family=Kalam:wght@700&display=swap" rel="stylesheet" />
      <div style={{ fontSize: 48, fontFamily: "'Fredoka One'", color: '#fff', marginBottom: 8 }}>
        Road<span style={{ color: '#F5A623' }}>Mate</span>
      </div>
      <div style={{ fontSize: 16, fontFamily: "'Kalam', cursive", color: 'rgba(255,255,255,0.85)', marginBottom: 40 }}>
        Nouveau mot de passe 🔒
      </div>
      <div style={{ background: '#F5EDD9', borderRadius: 24, padding: 28, width: '100%', maxWidth: 400, border: '3px solid #3D2B1F', boxShadow: '6px 6px 0 #3D2B1F' }}>
        <div style={{ fontSize: 20, fontFamily: "'Fredoka One'", color: '#3D2B1F', marginBottom: 20, textAlign: 'center' }}>
          Choisis un nouveau mot de passe
        </div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontFamily: "'Nunito'", fontWeight: 800, color: '#7B5C42', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>🔒 Nouveau mot de passe</div>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Min. 8 caractères"
              style={{ width: '100%', padding: '13px 48px 13px 16px', borderRadius: 14, border: '3px solid #EDE0CC', background: '#fff', fontSize: 15, fontFamily: "'Nunito'", fontWeight: 600, color: '#3D2B1F', boxSizing: 'border-box' }}
            />
            <button onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
        </div>
        {message && (
          <div style={{ padding: '12px 16px', borderRadius: 12, background: done ? '#E8F8EF' : '#FFF0EE', border: done ? '2px solid #4CAF7D' : '2px solid #E8572A', marginBottom: 16, fontSize: 13, fontFamily: "'Nunito'", fontWeight: 700, color: '#3D2B1F' }}>
            {message}
          </div>
        )}
        <button onClick={handleReset} disabled={loading || done}
          style={{ width: '100%', padding: '16px', borderRadius: 16, border: '3px solid #3D2B1F', cursor: 'pointer', background: '#E8572A', color: '#fff', fontSize: 18, fontFamily: "'Fredoka One'", boxShadow: '5px 5px 0 #3D2B1F' }}>
          {loading ? 'Sauvegarde...' : 'Valider 🤙'}
        </button>
      </div>
    </div>
  )
}

function Onboarding({ user, onDone }) {
  const lang = navigator.language?.startsWith('fr') ? 'fr' : 'en'
  const [name, setName] = useState('')
  const [nationality, setNationality] = useState('French')
  const [saving, setSaving] = useState(false)

  const FLAGS = { 'French': '🇫🇷', 'Australian': '🇦🇺', 'British': '🇬🇧', 'German': '🇩🇪', 'Spanish': '🇪🇸', 'Italian': '🇮🇹', 'American': '🇺🇸', 'Canadian': '🇨🇦', 'Brazilian': '🇧🇷', 'Japanese': '🇯🇵', 'Other': '🌍' }

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    await supabase.from('profiles').upsert({ id: user.id, name: name.trim(), nationality })
    setSaving(false)
    onDone()
  }

  return (
    <div style={{ fontFamily: "'Fredoka One', cursive", background: 'linear-gradient(170deg, #E8572A 0%, #C4622D 50%, #8B3A0F 100%)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&family=Kalam:wght@700&display=swap" rel="stylesheet" />
      <div style={{ fontSize: 48, fontFamily: "'Fredoka One'", color: '#fff', marginBottom: 8 }}>
        Road<span style={{ color: '#F5A623' }}>Mate</span>
      </div>
      <div style={{ fontSize: 16, fontFamily: "'Kalam', cursive", color: 'rgba(255,255,255,0.85)', marginBottom: 40 }}>
        {lang === 'fr' ? 'Avant de commencer... 🤙' : 'Before we start... 🤙'}
      </div>
      <div style={{ background: '#F5EDD9', borderRadius: 24, padding: 28, width: '100%', maxWidth: 400, border: '3px solid #3D2B1F', boxShadow: '6px 6px 0 #3D2B1F' }}>
        <div style={{ fontSize: 20, fontFamily: "'Fredoka One'", color: '#3D2B1F', marginBottom: 20, textAlign: 'center' }}>
          {lang === 'fr' ? 'Comment tu t\'appelles ? 👋' : 'What\'s your name? 👋'}
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontFamily: "'Nunito'", fontWeight: 800, color: '#7B5C42', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>
            📝 {lang === 'fr' ? 'Prénom' : 'First name'}
          </div>
          <input value={name} onChange={e => setName(e.target.value)}
            placeholder={lang === 'fr' ? 'Ton prénom' : 'Your name'}
            style={{ width: '100%', padding: '13px 16px', borderRadius: 14, border: '3px solid #EDE0CC', background: '#fff', fontSize: 15, fontFamily: "'Nunito'", fontWeight: 600, color: '#3D2B1F', boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontFamily: "'Nunito'", fontWeight: 800, color: '#7B5C42', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>
            🌍 {lang === 'fr' ? 'Nationalité' : 'Nationality'}
          </div>
          <select value={nationality} onChange={e => setNationality(e.target.value)}
            style={{ width: '100%', padding: '13px 16px', borderRadius: 14, border: '3px solid #EDE0CC', background: '#fff', fontSize: 15, fontFamily: "'Nunito'", fontWeight: 600, color: '#3D2B1F', boxSizing: 'border-box' }}>
            {Object.keys(FLAGS).map(f => <option key={f} value={f}>{FLAGS[f]} {f}</option>)}
          </select>
        </div>
        <button onClick={handleSave} disabled={saving || !name.trim()}
          style={{ width: '100%', padding: '16px', borderRadius: 16, border: '3px solid #3D2B1F', cursor: name.trim() ? 'pointer' : 'not-allowed', background: name.trim() ? '#E8572A' : '#EDE0CC', color: '#fff', fontSize: 18, fontFamily: "'Fredoka One'", boxShadow: name.trim() ? '5px 5px 0 #3D2B1F' : 'none' }}>
          {saving ? (lang === 'fr' ? 'Sauvegarde...' : 'Saving...') : (lang === 'fr' ? "C'est parti 🦘" : "Let's go 🦘")}
        </button>
      </div>
    </div>
  )
}

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [hasProfile, setHasProfile] = useState(true)
  const [isRecovery, setIsRecovery] = useState(false)

  useEffect(() => {
    const hash = window.location.hash
    if (hash.includes('type=recovery')) {
      setIsRecovery(true)
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
        setUser(session?.user ?? null)
      }
      if (event === 'SIGNED_OUT') {
        setUser(null)
        setIsRecovery(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (user && !isRecovery) {
      registerPush(user.id)
      checkProfile(user.id)
    }
  }, [user?.id, isRecovery])

  const checkProfile = async (userId) => {
    const { data } = await supabase.from('profiles').select('name').eq('id', userId).single()
    setHasProfile(!!(data?.name))
  }

  const registerPush = async (userId) => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
    try {
      const reg = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') return
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      })
      await supabase.from('push_subscriptions').upsert({
        user_id: userId,
        subscription: JSON.stringify(sub)
      }, { onConflict: 'user_id' })
    } catch (e) {
      console.log('Erreur push:', e)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#E8572A', fontFamily: "'Fredoka One'", fontSize: 32, color: '#fff' }}>
      Road<span style={{ color: '#F5A623' }}>Mate</span> 🚐
    </div>
  )

  if (isRecovery) return <ResetPassword />
  if (!user) return <Auth />
  if (!hasProfile) return <Onboarding user={user} onDone={() => setHasProfile(true)} />
  return <Home user={user} onSignOut={handleSignOut} />
}