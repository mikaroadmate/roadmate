import { useState } from 'react'
import { supabase } from '../supabase'

export default function Auth() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleAuth = async () => {
    setLoading(true)
    setMessage('')
    
    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage(error.message)
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setMessage(error.message)
      else setMessage('Vérifie ta boîte mail pour confirmer ton compte ! 📧')
    }
    setLoading(false)
  }

  return (
    <div style={{ fontFamily: "'Fredoka One', cursive", background: 'linear-gradient(170deg, #E8572A 0%, #C4622D 50%, #8B3A0F 100%)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&family=Kalam:wght@700&display=swap" rel="stylesheet" />
      
      {/* Logo */}
      <div style={{ fontSize: 48, fontFamily: "'Fredoka One'", color: '#fff', marginBottom: 8, textShadow: '3px 3px 0 rgba(0,0,0,0.2)' }}>
        Road<span style={{ color: '#F5A623' }}>Mate</span>
      </div>
      <div style={{ fontSize: 16, fontFamily: "'Kalam', cursive", color: 'rgba(255,255,255,0.85)', marginBottom: 40 }}>
        trouve ton trajet en Australie ✌️
      </div>

      {/* Card */}
      <div style={{ background: '#F5EDD9', borderRadius: 24, padding: 28, width: '100%', maxWidth: 400, border: '3px solid #3D2B1F', boxShadow: '6px 6px 0 #3D2B1F' }}>
        
        {/* Toggle */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {['login', 'signup'].map(m => (
            <button key={m} onClick={() => setMode(m)}
              style={{ flex: 1, padding: '12px', borderRadius: 14, border: '3px solid #3D2B1F', cursor: 'pointer', fontFamily: "'Fredoka One'", fontSize: 16, background: mode === m ? '#E8572A' : '#fff', color: mode === m ? '#fff' : '#7B5C42', boxShadow: mode === m ? '4px 4px 0 #3D2B1F' : 'none', transition: 'all 0.15s' }}>
              {m === 'login' ? 'Connexion' : 'Inscription'}
            </button>
          ))}
        </div>

        {/* Inputs */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontFamily: "'Nunito'", fontWeight: 800, color: '#7B5C42', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>📧 Email</div>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="ton@email.com"
            style={{ width: '100%', padding: '13px 16px', borderRadius: 14, border: '3px solid #EDE0CC', background: '#fff', fontSize: 15, fontFamily: "'Nunito'", fontWeight: 600, color: '#3D2B1F', boxSizing: 'border-box' }} />
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontFamily: "'Nunito'", fontWeight: 800, color: '#7B5C42', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>🔒 Mot de passe</div>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="Min. 8 caractères"
            style={{ width: '100%', padding: '13px 16px', borderRadius: 14, border: '3px solid #EDE0CC', background: '#fff', fontSize: 15, fontFamily: "'Nunito'", fontWeight: 600, color: '#3D2B1F', boxSizing: 'border-box' }} />
        </div>

        {message && (
          <div style={{ padding: '12px 16px', borderRadius: 12, background: message.includes('mail') ? '#E8F8EF' : '#FFF0EE', border: message.includes('mail') ? '2px solid #4CAF7D' : '2px solid #E8572A', marginBottom: 16, fontSize: 13, fontFamily: "'Nunito'", fontWeight: 700, color: '#3D2B1F' }}>
            {message}
          </div>
        )}

        <button onClick={handleAuth} disabled={loading}
          style={{ width: '100%', padding: '16px', borderRadius: 16, border: '3px solid #3D2B1F', cursor: 'pointer', background: '#E8572A', color: '#fff', fontSize: 18, fontFamily: "'Fredoka One'", boxShadow: '5px 5px 0 #3D2B1F', transition: 'all 0.15s' }}>
          {loading ? 'Chargement...' : mode === 'login' ? 'Se connecter 🤙' : "S'inscrire 🦘"}
        </button>
      </div>
    </div>
  )
}