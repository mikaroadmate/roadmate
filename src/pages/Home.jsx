import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import PostRide from './PostRide'
import Messages from './Messages'
import Profile from './Profile'

const CATEGORIES = [
  { id: 'all', label: 'Tous', icon: '🛣️' },
  { id: 'travel', label: 'Voyage', icon: '✈️' },
  { id: 'work', label: 'Travail', icon: '💼' },
  { id: 'daytrip', label: 'Excursion', icon: '🌊' },
  { id: 'roadtrip', label: 'Road Trip', icon: '🚐' },
]

const CAT_COLORS = {
  travel: { bg: '#E0F7F9', color: '#5BC8D4' },
  work: { bg: '#E8F8EF', color: '#4CAF7D' },
  daytrip: { bg: '#FFF3E0', color: '#F97316' },
  roadtrip: { bg: '#F3EFFE', color: '#8B5CF6' },
}

export default function Home({ user, onSignOut }) {
  const [rides, setRides] = useState([])
  const [filterCat, setFilterCat] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showPost, setShowPost] = useState(false)
  const [showMessages, setShowMessages] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showOtherProfile, setShowOtherProfile] = useState(false)
  const [otherUserId, setOtherUserId] = useState(null)
  const [contactId, setContactId] = useState(null)

  useEffect(() => { fetchRides() }, [filterCat, filterType])

  const fetchRides = async () => {
    setLoading(true)
    let query = supabase.from('rides').select('*, profiles(name, nationality, verified)').order('created_at', { ascending: false })
    if (filterCat !== 'all') query = query.eq('category', filterCat)
    if (filterType !== 'all') query = query.eq('type', filterType)
    const { data } = await query
    setRides(data || [])
    setLoading(false)
  }

  const filteredRides = rides.filter(ride => {
    if (!search.trim()) return true
    const s = search.toLowerCase()
    return ride.from_city?.toLowerCase().includes(s) || ride.to_city?.toLowerCase().includes(s)
  })

  if (showPost) return <PostRide user={user} onBack={() => setShowPost(false)} onSuccess={() => { setShowPost(false); fetchRides() }} />
  if (showMessages) return <Messages user={user} contactId={contactId} onBack={() => { setShowMessages(false); setContactId(null) }} onViewProfile={(id) => { setShowMessages(false); setOtherUserId(id); setShowOtherProfile(true) }} />
  if (showProfile) return <Profile user={user} onBack={() => setShowProfile(false)} />
  if (showOtherProfile) return <Profile user={user} viewedUserId={otherUserId} onBack={() => { setShowOtherProfile(false); setOtherUserId(null) }} />

  const getTypeStyle = (id) => ({
    flex: 1, padding: '8px', borderRadius: 20,
    border: '2.5px solid ' + (filterType === id ? '#3D2B1F' : '#EDE0CC'),
    background: filterType === id ? '#3D2B1F' : '#fff',
    color: filterType === id ? '#fff' : '#7B5C42',
    fontSize: 12, fontFamily: "'Nunito'", fontWeight: 800, cursor: 'pointer'
  })

  const getCatStyle = (id) => ({
    flexShrink: 0, padding: '6px 14px', borderRadius: 20,
    border: '2.5px solid ' + (filterCat === id ? '#3D2B1F' : '#EDE0CC'),
    background: filterCat === id ? '#E8572A' : '#fff',
    color: filterCat === id ? '#fff' : '#B5967A',
    fontSize: 12, fontFamily: "'Nunito'", fontWeight: 800, cursor: 'pointer'
  })

  return (
    <div style={{ fontFamily: "'Fredoka One', cursive", background: '#F5EDD9', minHeight: '100vh', maxWidth: 430, margin: '0 auto' }}>
      <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&family=Kalam:wght@700&display=swap" rel="stylesheet" />

      <div style={{ background: '#E8572A', padding: '48px 22px 22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 28, fontFamily: "'Fredoka One'", color: '#fff' }}>Road<span style={{ color: '#F5A623' }}>Mate</span></div>
            <div style={{ fontSize: 13, fontFamily: "'Kalam', cursive", color: 'rgba(255,255,255,0.😎' }}>g'day mate 🦘</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
  <button onClick={() => registerPush(user.id)} style={{ background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.4)', borderRadius: 12, padding: '8px 14px', color: '#fff', fontFamily: "'Nunito'", fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>
    🔔
  </button>
  <button onClick={onSignOut} style={{ background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.4)', borderRadius: 12, padding: '8px 14px', color: '#fff', fontFamily: "'Nunito'", fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>
    Deco 👋
  </button>
</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 16, padding: '10px 16px', border: '3px solid #3D2B1F', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>📍</span>
          <input
  value={search}
  onChange={e => setSearch(e.target.value)}
  placeholder="Ou tu vas ?"
  type="search"
  autoComplete="off"
  style={{ flex: 1, border: 'none', outline: 'none', fontSize: 16, fontFamily: "'Nunito'", fontWeight: 700, color: '#3D2B1F', background: 'transparent', WebkitAppearance: 'none' }}
/>
          {search && (
            <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#B5967A' }}>✕</button>
          )}
        </div>
      </div>

      <div style={{ padding: '14px 22px 0' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          {[['all','Tous'],['offer','🚗 Offre'],['seek','🙋 Cherche']].map(([id,label]) => (
            <button key={id} onClick={() => setFilterType(id)} style={getTypeStyle(id)}>{label}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 6 }}>
          {CATEGORIES.map(c => (
            <button key={c.id} onClick={() => setFilterCat(c.id)} style={getCatStyle(c.id)}>
              {c.icon} {c.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '12px 22px 100px' }}>
        {search.trim() && (
          <div style={{ fontFamily: "'Nunito'", fontWeight: 700, fontSize: 13, color: '#B5967A', marginBottom: 10 }}>
            {filteredRides.length} trajet(s) pour "{search}"
          </div>
        )}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, fontFamily: "'Kalam', cursive", color: '#B5967A', fontSize: 18 }}>Chargement... 🚐</div>
        ) : filteredRides.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🚐</div>
            <div style={{ fontFamily: "'Fredoka One'", fontSize: 20, color: '#3D2B1F', marginBottom: 6 }}>Aucun trajet</div>
            <div style={{ fontFamily: "'Kalam', cursive", color: '#B5967A', fontSize: 15 }}>
              {search ? 'Essaie une autre ville !' : 'Sois le premier a poster ! 🤙'}
            </div>
          </div>
        ) : filteredRides.map(ride => {
          const cat = CATEGORIES.find(c => c.id === ride.category)
          const colors = CAT_COLORS[ride.category] || { bg: '#F5EDD9', color: '#EDE0CC' }
          return (
            <div key={ride.id} style={{ background: '#fff', borderRadius: 20, padding: 16, border: '3px solid #3D2B1F', boxShadow: '4px 4px 0 #3D2B1F', marginBottom: 12 }}>
              <div style={{ display: 'flex', gap: 7, marginBottom: 12 }}>
                <span style={{ fontSize: 11, fontFamily: "'Nunito'", fontWeight: 800, padding: '4px 10px', borderRadius: 20, background: colors.bg, color: '#3D2B1F', border: '2px solid ' + colors.color }}>
                  {cat?.icon} {cat?.label}
                </span>
                <span style={{ fontSize: 11, fontFamily: "'Nunito'", fontWeight: 800, padding: '4px 10px', borderRadius: 20, background: ride.type === 'offer' ? '#E8F8EF' : '#EFF6FF', color: ride.type === 'offer' ? '#4CAF7D' : '#3B82F6', border: '2px solid ' + (ride.type === 'offer' ? '#4CAF7D' : '#3B82F6') }}>
                  {ride.type === 'offer' ? '🚗 Offre' : '🙋 Cherche'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: '#E8572A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, border: '2.5px solid #3D2B1F' }}>🤙</div>
                  <div>
                    <button onClick={() => { setOtherUserId(ride.user_id); setShowOtherProfile(true) }}
                      style={{ fontFamily: "'Fredoka One'", fontSize: 16, color: '#E8572A', cursor: 'pointer', textDecoration: 'underline', background: 'none', border: 'none', padding: 0 }}>
                      {ride.profiles?.name || 'Anonyme'}
                    </button>
                    <div style={{ fontSize: 11, fontFamily: "'Nunito'", fontWeight: 700, color: '#B5967A' }}>{ride.profiles?.nationality || ''}</div>
                  </div>
                </div>
                {ride.price && (
                  <div style={{ background: '#F5A623', borderRadius: 14, padding: '6px 12px', border: '2.5px solid #3D2B1F', boxShadow: '3px 3px 0 #3D2B1F', textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontFamily: "'Fredoka One'", color: '#3D2B1F' }}>{ride.price}$</div>
                    <div style={{ fontSize: 9, fontFamily: "'Nunito'", fontWeight: 800, color: '#7B3F00' }}>/siege</div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ flex: 1, background: '#F5EDD9', borderRadius: 12, padding: '8px 12px', border: '2px solid #EDE0CC' }}>
                  <div style={{ fontSize: 9, fontFamily: "'Nunito'", fontWeight: 800, color: '#B5967A', textTransform: 'uppercase', letterSpacing: 1 }}>De</div>
                  <div style={{ fontSize: 15, fontFamily: "'Fredoka One'", color: '#3D2B1F' }}>{ride.from_city}</div>
                </div>
                <span style={{ fontSize: 18 }}>→</span>
                <div style={{ flex: 1, background: '#F5EDD9', borderRadius: 12, padding: '8px 12px', border: '2px solid #EDE0CC' }}>
                  <div style={{ fontSize: 9, fontFamily: "'Nunito'", fontWeight: 800, color: '#B5967A', textTransform: 'uppercase', letterSpacing: 1 }}>A</div>
                  <div style={{ fontSize: 15, fontFamily: "'Fredoka One'", color: '#3D2B1F' }}>{ride.to_city}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 6, marginBottom: ride.note ? 10 : 0, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11, fontFamily: "'Nunito'", fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: '#F5EDD9', color: '#7B5C42', border: '1.5px solid #EDE0CC' }}>📅 {ride.date}</span>
                <span style={{ fontSize: 11, fontFamily: "'Nunito'", fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: '#F5EDD9', color: '#7B5C42', border: '1.5px solid #EDE0CC' }}>💺 {ride.seats} place(s)</span>
              </div>

              {ride.note && (
                <div style={{ background: '#FFF8EE', borderRadius: 12, padding: '8px 12px', border: '2px dashed #F5A623', marginBottom: 12 }}>
                  <span style={{ fontSize: 13, fontFamily: "'Kalam', cursive", color: '#7B5C42' }}>"{ride.note}"</span>
                </div>
              )}

              <button onClick={() => { setContactId(ride.user_id); setShowMessages(true) }}
                style={{ width: '100%', padding: '12px', borderRadius: 14, border: '3px solid #3D2B1F', cursor: 'pointer', background: '#E8572A', color: '#fff', fontSize: 15, fontFamily: "'Fredoka One'", boxShadow: '4px 4px 0 #3D2B1F' }}>
                Contacter 🤙
              </button>
            </div>
          )
        })}
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430, background: '#fff', borderTop: '3px solid #3D2B1F', padding: '12px 0 20px', display: 'flex', justifyContent: 'space-around' }}>
        <button style={{ background:'none', border:'none', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
          <span style={{ fontSize: 22 }}>🏠</span>
          <span style={{ fontSize: 10, fontFamily:"'Nunito'", fontWeight: 800, color: '#E8572A', textTransform:'uppercase' }}>Home</span>
        </button>
        <button onClick={() => setShowMessages(true)} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
          <span style={{ fontSize: 22 }}>💬</span>
          <span style={{ fontSize: 10, fontFamily:"'Nunito'", fontWeight: 800, color: '#B5967A', textTransform:'uppercase' }}>Messages</span>
        </button>
        <button onClick={() => setShowPost(true)} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
          <span style={{ fontSize: 22 }}>➕</span>
          <span style={{ fontSize: 10, fontFamily:"'Nunito'", fontWeight: 800, color: '#B5967A', textTransform:'uppercase' }}>Poster</span>
        </button>
        <button onClick={() => setShowProfile(true)} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
          <span style={{ fontSize: 22 }}>🤠</span>
          <span style={{ fontSize: 10, fontFamily:"'Nunito'", fontWeight: 800, color: '#B5967A', textTransform:'uppercase' }}>Profil</span>
        </button>
      </div>
    </div>
  )
}