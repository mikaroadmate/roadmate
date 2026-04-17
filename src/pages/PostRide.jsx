import { useState } from 'react'
import { supabase } from '../supabase'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

const CATEGORIES = [
  { id: 'travel', label: 'Voyage', icon: '✈️', desc: 'Inter-états & longue distance' },
  { id: 'work', label: 'Travail', icon: '💼', desc: 'Fermes, mines & emploi' },
  { id: 'daytrip', label: 'Excursion', icon: '🌊', desc: 'Plages, randos & tourisme' },
  { id: 'roadtrip', label: 'Road Trip', icon: '🚐', desc: 'Aventures multi-jours' },
]

export default function PostRide({ user, onBack, onSuccess }) {
  const [step, setStep] = useState(1)
  const [type, setType] = useState('offer')
  const [category, setCategory] = useState('travel')
  const [form, setForm] = useState({ from_city: '', to_city: '', date: '', time: '', seats: '2', price: '', note: '', womenOnly: false })
  const [coords, setCoords] = useState({ from_lat: null, from_lng: null })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

 const geocodeCity = async (city) => {
  if (!city.trim()) return
  try {
    const base = 'https://api.mapbox.com/geocoding/v5/mapbox.places/'
    const query = encodeURIComponent(city) + '.json'
    const params = '?country=au&limit=1&access_token=' + MAPBOX_TOKEN
    const res = await fetch(base + query + params)
    const data = await res.json()
    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].center
      setCoords({ from_lat: lat, from_lng: lng })
    }
  } catch (e) {
    console.log('Geocoding error:', e)
  }
} 

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    const { error } = await supabase.from('rides').insert({
      user_id: user.id,
      type,
      category,
      from_city: form.from_city,
      to_city: form.to_city,
      date: form.date,
      time: form.time,
      seats: parseInt(form.seats),
      price: form.price ? parseFloat(form.price) : null,
      note: form.note,
      women_only: form.womenOnly,
      from_lat: coords.from_lat,
      from_lng: coords.from_lng,
    })

    if (error) {
      setError('Erreur lors de la publication. Réessaie !')
    } else {
      onSuccess()
    }
    setLoading(false)
  }

  const headerColors = ['', '#3D2B1F', '#E8572A', '#4CAF7D']
  const headerTitles = ['', 'Type & catégorie', 'Trajet & date', 'Détails & publication']

  return (
    <div style={{ fontFamily: "'Fredoka One', cursive", background: '#F5EDD9', minHeight: '100vh', maxWidth: 430, margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
      <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&family=Kalam:wght@700&display=swap" rel="stylesheet" />

      <div style={{ background: headerColors[step], padding: '48px 22px 24px', flexShrink: 0 }}>
        <button onClick={() => step > 1 ? setStep(s => s - 1) : onBack()}
          style={{ background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.4)', borderRadius: 12, padding: '8px 14px', color: '#fff', fontFamily: "'Nunito'", fontWeight: 800, fontSize: 13, cursor: 'pointer', marginBottom: 16 }}>
          ← Retour
        </button>
        <div style={{ fontSize: 26, fontFamily: "'Fredoka One'", color: '#fff' }}>{headerTitles[step]}</div>
        <div style={{ display: 'flex', gap: 6, marginTop: 14 }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ flex: 1, height: 5, borderRadius: 3, background: i <= step ? '#fff' : 'rgba(255,255,255,0.3)' }} />
          ))}
        </div>
        <div style={{ fontSize: 10, fontFamily: "'Nunito'", fontWeight: 800, color: 'rgba(255,255,255,0.65)', marginTop: 4, textTransform: 'uppercase', letterSpacing: 1 }}>
          Étape {step} sur 3
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 22px' }}>

        {step === 1 && (
          <>
            <Section title="Je suis...">
              <div style={{ display: 'flex', gap: 10 }}>
                {[['offer','🚗 J\'offre un trajet'],['seek','🙋 Je cherche un trajet']].map(([id, label]) => (
                  <button key={id} onClick={() => setType(id)}
                    style={{ flex: 1, padding: '16px 8px', borderRadius: 16, border: '3px solid ' + (type === id ? '#3D2B1F' : '#EDE0CC'), background: type === id ? '#E8572A' : '#fff', color: type === id ? '#fff' : '#7B5C42', fontSize: 13, fontFamily: "'Nunito'", fontWeight: 800, cursor: 'pointer', boxShadow: type === id ? '4px 4px 0 #3D2B1F' : 'none', transition: 'all 0.15s', lineHeight: 1.4 }}>
                    {label}
                  </button>
                ))}
              </div>
            </Section>

            <Section title="Catégorie">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {CATEGORIES.map(c => (
                  <button key={c.id} onClick={() => setCategory(c.id)}
                    style={{ padding: '14px 18px', borderRadius: 16, border: '3px solid ' + (category === c.id ? '#3D2B1F' : '#EDE0CC'), background: '#fff', color: '#3D2B1F', fontSize: 14, fontFamily: "'Nunito'", fontWeight: 800, cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12, boxShadow: category === c.id ? '4px 4px 0 #3D2B1F' : 'none', transition: 'all 0.15s' }}>
                    <div style={{ width: 46, height: 46, borderRadius: 14, background: category === c.id ? '#E8572A' : '#F5EDD9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, border: '2.5px solid ' + (category === c.id ? '#3D2B1F' : '#EDE0CC'), flexShrink: 0 }}>{c.icon}</div>
                    <div>
                      <div style={{ fontSize: 16, fontFamily: "'Fredoka One'", color: category === c.id ? '#E8572A' : '#3D2B1F' }}>{c.label}</div>
                      <div style={{ fontSize: 12, fontFamily: "'Kalam', cursive", color: '#B5967A' }}>{c.desc}</div>
                    </div>
                    {category === c.id && <span style={{ marginLeft: 'auto', color: '#E8572A', fontSize: 18 }}>✓</span>}
                  </button>
                ))}
              </div>
            </Section>
          </>
        )}

        {step === 2 && (
          <>
            <Section title="📍 Départ">
              <input
                placeholder="Ville ou région"
                value={form.from_city}
                onChange={e => setForm(p => ({ ...p, from_city: e.target.value }))}
                onBlur={() => geocodeCity(form.from_city)}
                style={inputStyle}
              />
            </Section>
            <Section title="🏁 Destination">
              <input placeholder="Ville ou région" value={form.to_city} onChange={e => setForm(p => ({ ...p, to_city: e.target.value }))}
                style={inputStyle} />
            </Section>
            <div style={{ display: 'flex', gap: 10 }}>
              <Section title="📅 Date" style={{ flex: 1 }}>
                <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                  style={{ ...inputStyle }} />
              </Section>
              <Section title="⏰ Heure" style={{ flex: 1 }}>
                <input type="time" value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))}
                  style={{ ...inputStyle }} />
              </Section>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div style={{ display: 'flex', gap: 10 }}>
              <Section title="💺 Places" style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['1','2','3','4'].map(n => (
                    <button key={n} onClick={() => setForm(p => ({ ...p, seats: n }))}
                      style={{ flex: 1, padding: '10px 0', borderRadius: 12, border: '2.5px solid ' + (form.seats === n ? '#3D2B1F' : '#EDE0CC'), background: form.seats === n ? '#E8572A' : '#fff', color: form.seats === n ? '#fff' : '#7B5C42', fontSize: 15, fontFamily: "'Fredoka One'", cursor: 'pointer', boxShadow: form.seats === n ? '3px 3px 0 #3D2B1F' : 'none' }}>
                      {n}
                    </button>
                  ))}
                </div>
              </Section>
              {type === 'offer' && (
                <Section title="💰 Prix $ / siège" style={{ flex: 1 }}>
                  <input type="number" placeholder="0" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                    style={{ ...inputStyle }} />
                </Section>
              )}
            </div>

            <Section title="📝 Note (optionnel)">
              <textarea placeholder="Bonne musique, chien ok, no smoke... 🎵" value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} rows={3}
                style={{ ...inputStyle, fontFamily: "'Kalam', cursive", resize: 'none', lineHeight: 1.6 }} />
            </Section>

            <Section title="👩 Réservé aux femmes ?">
              <button onClick={() => setForm(p => ({ ...p, womenOnly: !p.womenOnly }))}
                style={{ width: '100%', padding: '14px 18px', borderRadius: 16, border: '3px solid ' + (form.womenOnly ? '#E8572A' : '#EDE0CC'), background: form.womenOnly ? '#FFF0EE' : '#fff', color: form.womenOnly ? '#E8572A' : '#7B5C42', fontSize: 14, fontFamily: "'Nunito'", fontWeight: 800, cursor: 'pointer', textAlign: 'left', boxShadow: form.womenOnly ? '4px 4px 0 #3D2B1F' : 'none' }}>
                {form.womenOnly ? '👩 Oui, femmes uniquement ✓' : '👥 Non, tout le monde'}
              </button>
            </Section>

            <div style={{ background: '#FFF8EE', borderRadius: 20, padding: 16, border: '3px dashed #F5A623', marginBottom: 8 }}>
              <div style={{ fontSize: 12, fontFamily: "'Nunito'", fontWeight: 800, color: '#7B5C42', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Aperçu</div>
              <div style={{ fontSize: 18, fontFamily: "'Fredoka One'", color: '#3D2B1F' }}>{form.from_city || '?'} → {form.to_city || '?'}</div>
              <div style={{ fontSize: 13, fontFamily: "'Nunito'", fontWeight: 700, color: '#B5967A', marginTop: 4 }}>
                {form.date || 'Date TBC'} · {form.seats} place(s) {form.price ? '· ' + form.price + '$ / siège' : '· partage essence'}
              </div>
              {form.womenOnly && <div style={{ fontSize: 12, fontFamily: "'Nunito'", fontWeight: 800, color: '#E8572A', marginTop: 6 }}>👩 Femmes uniquement</div>}
              {coords.from_lat && <div style={{ fontSize: 11, fontFamily: "'Nunito'", fontWeight: 700, color: '#4CAF7D', marginTop: 4 }}>📍 Position trouvée ✓</div>}
            </div>

            {error && <div style={{ padding: '10px 14px', borderRadius: 12, background: '#FFF0EE', border: '2px solid #E8572A', marginBottom: 12, fontSize: 13, fontFamily: "'Nunito'", fontWeight: 700, color: '#E8572A' }}>{error}</div>}
          </>
        )}
      </div>

      <div style={{ padding: '12px 22px 32px', flexShrink: 0 }}>
        <button onClick={() => step < 3 ? setStep(s => s + 1) : handleSubmit()} disabled={loading}
          style={{ width: '100%', padding: '16px', borderRadius: 18, border: '3px solid #3D2B1F', cursor: 'pointer', background: step === 3 ? '#4CAF7D' : '#E8572A', color: '#fff', fontSize: 18, fontFamily: "'Fredoka One'", boxShadow: '5px 5px 0 #3D2B1F', transition: 'all 0.15s' }}>
          {loading ? 'Publication...' : step === 3 ? 'Publier 🚀' : 'Suivant →'}
        </button>
      </div>
    </div>
  )
}

function Section({ title, children, style }) {
  return (
    <div style={{ marginBottom: 20, ...style }}>
      <div style={{ fontSize: 12, fontFamily: "'Nunito'", fontWeight: 800, color: '#7B5C42', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  )
}

const inputStyle = {
  width: '100%',
  padding: '13px 16px',
  borderRadius: 14,
  border: '3px solid #EDE0CC',
  background: '#fff',
  fontSize: 15,
  fontFamily: "'Nunito'",
  fontWeight: 600,
  color: '#3D2B1F',
  boxSizing: 'border-box'
}