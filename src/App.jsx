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

function CGU({ onBack, lang }) {
  return (
    <div style={{ fontFamily: "'Fredoka One', cursive", background: '#F5EDD9', minHeight: '100vh', maxWidth: '100%' }}>
      <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&family=Kalam:wght@700&display=swap" rel="stylesheet" />
      <div style={{ background: '#3D2B1F', padding: 'calc(env(safe-area-inset-top) + 16px) 22px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.1)', border: '2px solid rgba(255,255,255,0.2)', borderRadius: 12, padding: '8px 14px', color: '#fff', fontFamily: "'Nunito'", fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>
            {lang === 'fr' ? '← Retour' : '← Back'}
          </button>
          <div style={{ fontSize: 22, fontFamily: "'Fredoka One'", color: '#fff' }}>
            {lang === 'fr' ? 'Conditions d\'utilisation 📋' : 'Terms of Service 📋'}
          </div>
        </div>
      </div>
      <div style={{ padding: '20px 22px 60px' }}>
        {lang === 'fr' ? (
          <>
            <div style={{ background: '#fff', borderRadius: 20, padding: 18, border: '3px solid #3D2B1F', boxShadow: '4px 4px 0 #3D2B1F', marginBottom: 14 }}>
              <div style={{ fontSize: 16, fontFamily: "'Fredoka One'", color: '#E8572A', marginBottom: 8 }}>1. Objet</div>
              <div style={{ fontSize: 13, fontFamily: "'Nunito'", fontWeight: 600, color: '#3D2B1F', lineHeight: 1.6 }}>
                RoadMate est une plateforme de mise en relation entre conducteurs et passagers pour des trajets en Australie. L'application est fournie à titre gratuit et sans garantie de disponibilité continue.
              </div>
            </div>
            <div style={{ background: '#fff', borderRadius: 20, padding: 18, border: '3px solid #3D2B1F', boxShadow: '4px 4px 0 #3D2B1F', marginBottom: 14 }}>
              <div style={{ fontSize: 16, fontFamily: "'Fredoka One'", color: '#E8572A', marginBottom: 8 }}>2. Responsabilités</div>
              <div style={{ fontSize: 13, fontFamily: "'Nunito'", fontWeight: 600, color: '#3D2B1F', lineHeight: 1.6 }}>
                RoadMate agit uniquement comme intermédiaire. Nous ne sommes pas responsables des accidents, retards, annulations ou tout incident survenant lors d'un trajet organisé via l'application. Les utilisateurs sont seuls responsables de leurs actions. RoadMate n'intervient pas dans les paiements — ceux-ci sont des arrangements directs entre conducteur et passager. Nous recommandons fortement le paiement en mains propres lors de la rencontre plutôt qu'un transfert d'argent afin d'éviter toute escroquerie.
              </div>
            </div>
            <div style={{ background: '#fff', borderRadius: 20, padding: 18, border: '3px solid #3D2B1F', boxShadow: '4px 4px 0 #3D2B1F', marginBottom: 14 }}>
              <div style={{ fontSize: 16, fontFamily: "'Fredoka One'", color: '#E8572A', marginBottom: 8 }}>3. Données personnelles (RGPD)</div>
              <div style={{ fontSize: 13, fontFamily: "'Nunito'", fontWeight: 600, color: '#3D2B1F', lineHeight: 1.6 }}>
                Nous collectons uniquement les données nécessaires au fonctionnement de l'app : email, prénom, nationalité, photo de profil et messages. Ces données sont stockées de manière sécurisée via Supabase. Vous pouvez demander la suppression de votre compte à tout moment en nous contactant.
              </div>
            </div>
            <div style={{ background: '#fff', borderRadius: 20, padding: 18, border: '3px solid #3D2B1F', boxShadow: '4px 4px 0 #3D2B1F', marginBottom: 14 }}>
              <div style={{ fontSize: 16, fontFamily: "'Fredoka One'", color: '#E8572A', marginBottom: 8 }}>4. Comportement</div>
              <div style={{ fontSize: 13, fontFamily: "'Nunito'", fontWeight: 600, color: '#3D2B1F', lineHeight: 1.6 }}>
                Les utilisateurs s'engagent à adopter un comportement respectueux. Tout contenu inapproprié, harcèlement ou escroquerie entraînera la suppression immédiate du compte.
              </div>
            </div>
            <div style={{ background: '#fff', borderRadius: 20, padding: 18, border: '3px solid #3D2B1F', boxShadow: '4px 4px 0 #3D2B1F', marginBottom: 14 }}>
              <div style={{ fontSize: 16, fontFamily: "'Fredoka One'", color: '#E8572A', marginBottom: 8 }}>5. Contact</div>
              <div style={{ fontSize: 13, fontFamily: "'Nunito'", fontWeight: 600, color: '#3D2B1F', lineHeight: 1.6 }}>
                Pour toute question : beaudeau_mickael@live.fr — Instagram : @all_in_mika
              </div>
            </div>
            <div style={{ fontSize: 11, fontFamily: "'Nunito'", fontWeight: 700, color: '#B5967A', textAlign: 'center', marginTop: 8 }}>
              Dernière mise à jour : Avril 2026
            </div>
          </>
        ) : (
          <>
            <div style={{ background: '#fff', borderRadius: 20, padding: 18, border: '3px solid #3D2B1F', boxShadow: '4px 4px 0 #3D2B1F', marginBottom: 14 }}>
              <div style={{ fontSize: 16, fontFamily: "'Fredoka One'", color: '#E8572A', marginBottom: 8 }}>1. Purpose</div>
              <div style={{ fontSize: 13, fontFamily: "'Nunito'", fontWeight: 600, color: '#3D2B1F', lineHeight: 1.6 }}>
                RoadMate is a platform connecting drivers and passengers for rides across Australia. The app is provided free of charge and without guarantee of continuous availability.
              </div>
            </div>
            <div style={{ background: '#fff', borderRadius: 20, padding: 18, border: '3px solid #3D2B1F', boxShadow: '4px 4px 0 #3D2B1F', marginBottom: 14 }}>
              <div style={{ fontSize: 16, fontFamily: "'Fredoka One'", color: '#E8572A', marginBottom: 8 }}>2. Liability</div>
              <div style={{ fontSize: 13, fontFamily: "'Nunito'", fontWeight: 600, color: '#3D2B1F', lineHeight: 1.6 }}>
                RoadMate acts only as an intermediary. We are not responsible for accidents, delays, cancellations or any incident occurring during a trip organised via the app. Users are solely responsible for their actions. RoadMate is not involved in any payments — these are direct arrangements between driver and passenger. We strongly recommend paying in cash upon meeting rather than transferring money in advance to avoid any scams.
              </div>
            </div>
            <div style={{ background: '#fff', borderRadius: 20, padding: 18, border: '3px solid #3D2B1F', boxShadow: '4px 4px 0 #3D2B1F', marginBottom: 14 }}>
              <div style={{ fontSize: 16, fontFamily: "'Fredoka One'", color: '#E8572A', marginBottom: 8 }}>3. Personal Data</div>
              <div style={{ fontSize: 13, fontFamily: "'Nunito'", fontWeight: 600, color: '#3D2B1F', lineHeight: 1.6 }}>
                We only collect data necessary for the app to function: email, first name, nationality, profile photo and messages. This data is stored securely via Supabase. You can request account deletion at any time by contacting us.
              </div>
            </div>
            <div style={{ background: '#fff', borderRadius: 20, padding: 18, border: '3px solid #3D2B1F', boxShadow: '4px 4px 0 #3D2B1F', marginBottom: 14 }}>
              <div style={{ fontSize: 16, fontFamily: "'Fredoka One'", color: '#E8572A', marginBottom: 8 }}>4. Behaviour</div>
              <div style={{ fontSize: 13, fontFamily: "'Nunito'", fontWeight: 600, color: '#3D2B1F', lineHeight: 1.6 }}>
                Users agree to behave respectfully. Any inappropriate content, harassment or fraud will result in immediate account deletion.
              </div>
            </div>
            <div style={{ background: '#fff', borderRadius: 20, padding: 18, border: '3px solid #3D2B1F', boxShadow: '4px 4px 0 #3D2B1F', marginBottom: 14 }}>
              <div style={{ fontSize: 16, fontFamily: "'Fredoka One'", color: '#E8572A', marginBottom: 8 }}>5. Contact</div>
              <div style={{ fontSize: 13, fontFamily: "'Nunito'", fontWeight: 600, color: '#3D2B1F', lineHeight: 1.6 }}>
                For any questions: beaudeau_mickael@live.fr — Instagram: @all_in_mika
              </div>
            </div>
            <div style={{ fontSize: 11, fontFamily: "'Nunito'", fontWeight: 700, color: '#B5967A', textAlign: 'center', marginTop: 8 }}>
              Last updated: April 2026
            </div>
          </>
        )}
      </div>
    </div>
  )
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
      setTimeout(() => { window.location.href = '/' }, 2000)
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
  const [showCGU, setShowCGU] = useState(false)

  const FLAGS = { 'French': '🇫🇷', 'Australian': '🇦🇺', 'British': '🇬🇧', 'German': '🇩🇪', 'Spanish': '🇪🇸', 'Italian': '🇮🇹', 'American': '🇺🇸', 'Canadian': '🇨🇦', 'Brazilian': '🇧🇷', 'Japanese': '🇯🇵', 'Other': '🌍' }

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    await supabase.from('profiles').upsert({ id: user.id, name: name.trim(), nationality })
    setSaving(false)
    onDone()
  }

  if (showCGU) return <CGU onBack={() => setShowCGU(false)} lang={lang} />

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
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontFamily: "'Nunito'", fontWeight: 800, color: '#7B5C42', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>
            🌍 {lang === 'fr' ? 'Nationalité' : 'Nationality'}
          </div>
          <select value={nationality} onChange={e => setNationality(e.target.value)}
            style={{ width: '100%', padding: '13px 16px', borderRadius: 14, border: '3px solid #EDE0CC', background: '#fff', fontSize: 15, fontFamily: "'Nunito'", fontWeight: 600, color: '#3D2B1F', boxSizing: 'border-box' }}>
            {Object.keys(FLAGS).map(f => <option key={f} value={f}>{FLAGS[f]} {f}</option>)}
          </select>
        </div>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <button onClick={() => setShowCGU(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontFamily: "'Nunito'", fontWeight: 800, color: '#E8572A', textDecoration: 'underline' }}>
            {lang === 'fr' ? 'Lire les conditions d\'utilisation' : 'Read terms of service'}
          </button>
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
  const [showCGU, setShowCGU] = useState(false)

  const lang = navigator.language?.startsWith('fr') ? 'fr' : 'en'

  useEffect(() => {
    const hash = window.location.hash
    if (hash.includes('type=recovery')) {
      setIsRecovery(true)
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
  setUser(session?.user ?? null)
  setTimeout(() => setLoading(false), 1500)
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
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#E8572A' }}>
    <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Kalam:wght@700&display=swap" rel="stylesheet" />
    <div style={{ fontSize: 72, fontFamily: "'Fredoka One'", color: '#fff', lineHeight: 1 }}>
  Road
</div>
<div style={{ fontSize: 72, fontFamily: "'Fredoka One'", color: '#F5A623', lineHeight: 1 }}>
  Mate
</div>
<div style={{ fontSize: 16, fontFamily: "'Kalam', cursive", color: '#fff', marginTop: 12 }}>
  Le co-voit' des backpackers 🤙
</div>
  </div>
)

  if (showCGU) return <CGU onBack={() => setShowCGU(false)} lang={lang} />
  if (isRecovery) return <ResetPassword />
  if (!user) return <Auth />
  if (!hasProfile) return <Onboarding user={user} onDone={() => setHasProfile(true)} />
  return <Home user={user} onSignOut={handleSignOut} showCGU={() => setShowCGU(true)} />
}