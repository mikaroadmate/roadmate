import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

const VISAS = ['WHV', 'Student', 'Tourist', 'Work', 'Resident', 'Other']
const FLAGS = { 'French': '🇫🇷', 'Australian': '🇦🇺', 'British': '🇬🇧', 'German': '🇩🇪', 'Spanish': '🇪🇸', 'Italian': '🇮🇹', 'American': '🇺🇸', 'Canadian': '🇨🇦', 'Brazilian': '🇧🇷', 'Japanese': '🇯🇵', 'Other': '🌍' }

export default function Profile({ user, onBack }) {
  const [profile, setProfile] = useState(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: '', nationality: 'French', visa: 'WHV', bio: '' })
  const [rides, setRides] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => { fetchProfile() }, [])

  const fetchProfile = async () => {
    setLoading(true)
    const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    const { data: ridesData } = await supabase.from('rides').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    
    if (profileData) {
      setProfile(profileData)
      setForm({ name: profileData.name || '', nationality: profileData.nationality || 'French', visa: profileData.visa || 'WHV', bio: profileData.bio || '' })
    }
    setRides(ridesData || [])
    setLoading(false)
  }

  const saveProfile = async () => {
    setSaving(true)
    const { error } = await supabase.from('profiles').upsert({ id: user.id, ...form })
    if (!error) {
      setMessage('Profil sauvegardé ! ✅')
      setEditing(false)
      fetchProfile()
    } else {
      setMessage('Erreur lors de la sauvegarde')
    }
    setSaving(false)
    setTimeout(() => setMessage(''), 3000)
  }

  const deleteRide = async (rideId) => {
    await supabase.from('rides').delete().eq('id', rideId)
    fetchProfile()
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#F5EDD9', fontFamily: "'Kalam', cursive", fontSize: 20, color: '#B5967A' }}>
      Chargement... 🤙
    </div>
  )

  return (
    <div style={{ fontFamily: "'Fredoka One', cursive", background: '#F5EDD9', minHeight: '100vh', maxWidth: 430, margin: '0 auto' }}>
      <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&family=Kalam:wght@700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ background: '#8B5CF6', padding: '48px 22px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.4)', borderRadius: 12, padding: '8px 14px', color: '#fff', fontFamily: "'Nunito'", fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>
            ← Home
          </button>
          <button onClick={() => editing ? saveProfile() : setEditing(true)} disabled={saving}
            style={{ background: editing ? '#4CAF7D' : 'rgba(255,255,255,0.2)', border: '2px solid ' + (editing ? '#3D2B1F' : 'rgba(255,255,255,0.4)'), borderRadius: 12, padding: '8px 14px', color: '#fff', fontFamily: "'Nunito'", fontWeight: 800, fontSize: 13, cursor: 'pointer', boxShadow: editing ? '3px 3px 0 #3D2B1F' : 'none' }}>
            {saving ? 'Sauvegarde...' : editing ? '✓ Sauvegarder' : '✏️ Modifier'}
          </button>
        </div>

        {/* Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 72, height: 72, borderRadius: 22, background: '#E8572A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, border: '3px solid #3D2B1F', boxShadow: '4px 4px 0 rgba(0,0,0,0.2)' }}>🤙</div>
          <div>
            {editing ? (
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Ton prénom"
                style={{ fontSize: 24, fontFamily: "'Fredoka One'", color: '#3D2B1F', background: 'rgba(255,255,255,0.9)', border: '2px solid #3D2B1F', borderRadius: 10, padding: '4px 10px', width: '100%' }} />
            ) : (
              <div style={{ fontSize: 26, fontFamily: "'Fredoka One'", color: '#fff' }}>{profile?.name || 'Ajoute ton nom'}</div>
            )}
            <div style={{ fontSize: 13, fontFamily: "'Kalam', cursive", color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>{user.email}</div>
          </div>
        </div>
      </div>

      {message && (
        <div style={{ margin: '12px 22px 0', padding: '10px 14px', borderRadius: 12, background: '#E8F8EF', border: '2px solid #4CAF7D', fontSize: 13, fontFamily: "'Nunito'", fontWeight: 700, color: '#3D2B1F' }}>{message}</div>
      )}

      <div style={{ padding: '16px 22px 100px' }}>

        {/* Infos */}
        <div style={{ background: '#fff', borderRadius: 20, padding: 16, border: '3px solid #3D2B1F', boxShadow: '4px 4px 0 #3D2B1F', marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontFamily: "'Nunito'", fontWeight: 800, color: '#7B5C42', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 14 }}>Infos voyageur</div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontFamily: "'Nunito'", fontWeight: 800, color: '#B5967A', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>🌍 Nationalité</div>
            {editing ? (
              <select value={form.nationality} onChange={e => setForm(p => ({ ...p, nationality: e.target.value }))}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '2.5px solid #EDE0CC', background: '#fff', fontSize: 14, fontFamily: "'Nunito'", fontWeight: 700, color: '#3D2B1F' }}>
                {Object.keys(FLAGS).map(f => <option key={f} value={f}>{FLAGS[f]} {f}</option>)}
              </select>
            ) : (
              <div style={{ fontSize: 16, fontFamily: "'Nunito'", fontWeight: 700, color: '#3D2B1F' }}>{FLAGS[profile?.nationality] || '🌍'} {profile?.nationality || 'Non renseigné'}</div>
            )}
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontFamily: "'Nunito'", fontWeight: 800, color: '#B5967A', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>📋 Visa</div>
            {editing ? (
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                {VISAS.map(v => (
                  <button key={v} onClick={() => setForm(p => ({ ...p, visa: v }))}
                    style={{ padding: '6px 14px', borderRadius: 20, border: '2.5px solid ' + (form.visa === v ? '#3D2B1F' : '#EDE0CC'), background: form.visa === v ? '#8B5CF6' : '#fff', color: form.visa === v ? '#fff' : '#7B5C42', fontSize: 13, fontFamily: "'Nunito'", fontWeight: 800, cursor: 'pointer' }}>
                    {v}
                  </button>
                ))}
              </div>
            ) : (
              <div style={{ display: 'inline-block', padding: '6px 14px', borderRadius: 20, background: '#F3EFFE', border: '2px solid #8B5CF6', fontSize: 13, fontFamily: "'Nunito'", fontWeight: 800, color: '#8B5CF6' }}>{profile?.visa || 'Non renseigné'}</div>
            )}
          </div>

          <div>
            <div style={{ fontSize: 11, fontFamily: "'Nunito'", fontWeight: 800, color: '#B5967A', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>✍️ Bio</div>
            {editing ? (
              <textarea value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                placeholder="Parle de toi, tes projets en Australie..."
                rows={3} style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '2.5px solid #EDE0CC', background: '#fff', fontSize: 14, fontFamily: "'Kalam', cursive", color: '#3D2B1F', resize: 'none', boxSizing: 'border-box', lineHeight: 1.6 }} />
            ) : (
              <div style={{ fontSize: 14, fontFamily: "'Kalam', cursive", color: '#7B5C42', lineHeight: 1.6 }}>{profile?.bio || 'Ajoute une bio ✏️'}</div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          {[['🚐', rides.length, 'Trajets'], ['⭐', '0', 'Avis'], [profile?.verified ? '✅' : '❌', profile?.verified ? 'Oui' : 'Non', 'Vérifié']].map(([icon, val, label]) => (
            <div key={label} style={{ flex: 1, background: '#fff', borderRadius: 16, padding: '14px 10px', border: '3px solid #3D2B1F', boxShadow: '3px 3px 0 #3D2B1F', textAlign: 'center' }}>
              <div style={{ fontSize: 22 }}>{icon}</div>
              <div style={{ fontSize: 20, fontFamily: "'Fredoka One'", color: '#3D2B1F' }}>{val}</div>
              <div style={{ fontSize: 10, fontFamily: "'Nunito'", fontWeight: 800, color: '#B5967A', textTransform: 'uppercase' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Mes trajets */}
        <div style={{ background: '#fff', borderRadius: 20, padding: 16, border: '3px solid #3D2B1F', boxShadow: '4px 4px 0 #3D2B1F' }}>
          <div style={{ fontSize: 12, fontFamily: "'Nunito'", fontWeight: 800, color: '#7B5C42', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 14 }}>Mes trajets 🚐</div>
          {rides.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0', fontFamily: "'Kalam', cursive", color: '#B5967A', fontSize: 15 }}>Aucun trajet posté 🌊</div>
          ) : rides.map(ride => (
            <div key={ride.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1.5px solid #EDE0CC' }}>
              <div>
                <div style={{ fontSize: 15, fontFamily: "'Fredoka One'", color: '#3D2B1F' }}>{ride.from_city} → {ride.to_city}</div>
                <div style={{ fontSize: 12, fontFamily: "'Nunito'", fontWeight: 700, color: '#B5967A' }}>{ride.date} · {ride.seats} place(s)</div>
              </div>
              <button onClick={() => deleteRide(ride.id)}
                style={{ background: '#FFF0EE', border: '2px solid #E8572A', borderRadius: 10, padding: '6px 10px', cursor: 'pointer', fontSize: 14 }}>
                🗑️
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}