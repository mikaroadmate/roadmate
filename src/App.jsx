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

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
  if (user) registerPush(user.id)
}, [user?.id])

 const registerPush = async (userId) => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('Push non supporté')
    return
  }
  try {
    console.log('Enregistrement SW...')
    const reg = await navigator.serviceWorker.register('/sw.js')
    await navigator.serviceWorker.ready
    console.log('SW prêt:', reg)
    const permission = await Notification.requestPermission()
    console.log('Permission:', permission)
    if (permission !== 'granted') return
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    })
    console.log('Subscription:', sub)
    const { error } = await supabase.from('push_subscriptions').upsert({
      user_id: userId,
      subscription: JSON.stringify(sub)
    }, { onConflict: 'user_id' })
    console.log('Supabase error:', error)
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

  return user ? <Home user={user} onSignOut={handleSignOut} /> : <Auth />
}