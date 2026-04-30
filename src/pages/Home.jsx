import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import PostRide from './PostRide'
import Messages from './Messages'
import Profile from './Profile'
import Map from './Map'
import { useLanguage } from '../LanguageContext'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY

const CATEGORIES_FR = [
  { id: 'all', label: 'Tous', icon: '🛣️' },
  { id: 'travel', label: 'Voyage', icon: '✈️' },
  { id: 'work', label: 'Travail', icon: '💼' },
  { id: 'daytrip', label: 'Excursion', icon: '🌊' },
  { id: 'roadtrip', label: 'Road Trip', icon: '🚐' },
]

const CATEGORIES_EN = [
  { id: 'all', label: 'All', icon: '🛣️' },
  { id: 'travel', label: 'Travel', icon: '✈️' },
  { id: 'work', label: 'Work', icon: '💼' },
  { id: 'daytrip', label: 'Day Trip', icon: '🌊' },
  { id: 'roadtrip', label: 'Road Trip', icon: '🚐' },
]

const CAT_COLORS = {
  travel: { bg: '#E0F7F9', color: '#5BC8D4' },
  work: { bg: '#E8F8EF', color: '#4CAF7D' },
  daytrip: { bg: '#FFF3E0', color: '#F97316' },
  roadtrip: { bg: '#F3EFFE', color: '#8B5CF6' },
}

const PAGE_SIZE = 15

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

const cleanPastRides = async () => {
  const { data: rides } = await supabase.from('rides').select('id, date, time')
  if (!rides) return
  const now = new Date()
  const toDelete = []
  rides.forEach(ride => {
    try {
      const parts = ride.date?.split('-')
      if (!parts || parts.length !== 3) return
      const [year, month, day] = parts
      const timeParts = (ride.time || '00:00').split(':')
      const hours = parseInt(timeParts[0]) || 0
      const minutes = parseInt(timeParts[1]) || 0
      const departure = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), hours, minutes)
      const deleteAfter = new Date(departure.getTime() + 8 * 60 * 60 * 1000)
      if (now > deleteAfter) toDelete.push(ride.id)
    } catch (e) {}
  })
  if (toDelete.length > 0) {
    await supabase.from('rides').delete().in('id', toDelete)
  }
}

const shareRide = async (ride, lang) => {
  const text = lang === 'fr'
    ? '🚗 Trajet RoadMate\n' + ride.from_city + ' → ' + ride.to_city + '\n📅 ' + (ride.date ? ride.date.split('-').reverse().join('/') : '') + (ride.price ? '\n💰 ' + ride.price + '$' : '') + '\n\nRejoins RoadMate 🤙\nhttps://www.roadmateoz.app'
    : '🚗 RoadMate Ride\n' + ride.from_city + ' → ' + ride.to_city + '\n📅 ' + (ride.date ? ride.date.split('-').reverse().join('/') : '') + (ride.price ? '\n💰 ' + ride.price + '$' : '') + '\n\nJoin RoadMate 🤙\nhttps://www.roadmateoz.app'
  if (navigator.share) {
    try { await navigator.share({ title: 'RoadMate', text }) } catch (e) {}
  } else {
    await navigator.clipboard.writeText(text)
  }
}

export default function Home({ user, onSignOut, showCGU }) {
  const { t, lang, toggleLanguage } = useLanguage()
  const CATEGORIES = lang === 'fr' ? CATEGORIES_FR : CATEGORIES_EN

  const [rides, setRides] = useState([])
  const [filterCat, setFilterCat] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [filterWomen, setFilterWomen] = useState(false)
  const [filterDate, setFilterDate] = useState('')
  const [filterDateMode, setFilterDateMode] = useState('exact')
  const [filterFavorites, setFilterFavorites] = useState(false)
  const [favorites, setFavorites] = useState([])
  const [searchFrom, setSearchFrom] = useState('')
  const [searchTo, setSearchTo] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  const [showPost, setShowPost] = useState(false)
  const [showMessages, setShowMessages] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [showOtherProfile, setShowOtherProfile] = useState(false)
  const [otherUserId, setOtherUserId] = useState(null)
  const [contactId, setContactId] = useState(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [pendingBookings, setPendingBookings] = useState(0)
  const [shareToast, setShareToast] = useState(false)

  useEffect(() => { fetchRides(true) }, [filterCat, filterType, filterWomen, filterDate, filterDateMode])
  useEffect(() => { fetchUnread() }, [])
  useEffect(() => { fetchPendingBookings() }, [])
  useEffect(() => { fetchFavorites() }, [])
  useEffect(() => { if (!showMessages) { fetchUnread(); fetchPendingBookings() } }, [showMessages])
  useEffect(() => {
    cleanPastRides()
    const interval = setInterval(cleanPastRides, 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])
  useEffect(() => {
    const interval = setInterval(() => { fetchUnread(); fetchPendingBookings() }, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchUnread = async () => {
    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', user.id)
      .eq('read', false)
    setUnreadCount(count || 0)
  }

  const fetchPendingBookings = async () => {
    const { count } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('driver_id', user.id)
      .eq('status', 'pending')
    setPendingBookings(count || 0)
  }

  const fetchFavorites = async () => {
    const { data } = await supabase
      .from('favorites')
      .select('ride_id')
      .eq('user_id', user.id)
    setFavorites(data?.map(f => f.ride_id) || [])
  }

  const toggleFavorite = async (rideId) => {
    const isFav = favorites.includes(rideId)
    if (isFav) {
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('ride_id', rideId)
      setFavorites(prev => prev.filter(id => id !== rideId))
    } else {
      await supabase.from('favorites').insert({ user_id: user.id, ride_id: rideId })
      setFavorites(prev => [...prev, rideId])
    }
  }

  const buildQuery = (currentPage) => {
    let query = supabase.from('rides')
      .select('*, profiles(name, nationality, verified, avatar_url, whatsapp, instagram)')
      .order('date', { ascending: true })
      .order('time', { ascending: true })
      .range(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE - 1)
      .eq('active', true)
    if (filterCat !== 'all') query = query.eq('category', filterCat)
    if (filterType !== 'all') query = query.eq('type', filterType)
    if (filterWomen) query = query.eq('women_only', true)
    if (filterDate) query = filterDateMode === 'exact' ? query.eq('date', filterDate) : query.gte('date', filterDate)
    return query
  }

  const fetchRides = async (reset = false) => {
    setLoading(true)
    setHasMore(true)
    setPage(0)
    const { data } = await buildQuery(0)
    setRides(data || [])
    if (!data || data.length < PAGE_SIZE) setHasMore(false)
    setLoading(false)
  }

  const loadMore = async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    const nextPage = page + 1
    setPage(nextPage)
    const { data } = await buildQuery(nextPage)
    setRides(prev => [...prev, ...(data || [])])
    if (!data || data.length < PAGE_SIZE) setHasMore(false)
    setLoadingMore(false)
  }

  const filteredRides = rides.filter(ride => {
    const matchFrom = !searchFrom.trim() || ride.from_city?.toLowerCase().includes(searchFrom.toLowerCase())
    const matchTo = !searchTo.trim() || ride.to_city?.toLowerCase().includes(searchTo.toLowerCase())
    const matchFav = !filterFavorites || favorites.includes(ride.id)
    return matchFrom && matchTo && matchFav
  })

  const handleBooking = async (ride) => {
    const { data: existing } = await supabase
      .from('bookings')
      .select('id, status')
      .eq('ride_id', ride.id)
      .eq('passenger_id', user.id)
      .in('status', ['pending', 'accepted'])
      .maybeSingle()

    if (existing) {
      alert(lang === 'fr' ? 'Tu as déjà une demande pour ce trajet !' : 'You already have a request for this ride!')
      return
    }

    const { error } = await supabase.from('bookings').insert({
      ride_id: ride.id,
      passenger_id: user.id,
      driver_id: ride.user_id,
      status: 'pending'
    })

    if (!error) {
      const { data: subData } = await supabase
        .from('push_subscriptions')
        .select('subscription')
        .eq('user_id', ride.user_id)
        .maybeSingle()

      if (subData) {
        await fetch('/api/send-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subscription: subData.subscription,
            title: lang === 'fr' ? '🤝 Nouvelle demande de réservation !' : '🤝 New booking request!',
            body: ride.from_city + ' → ' + ride.to_city
          })
        })
      }
      alert(lang === 'fr' ? 'Demande envoyée ! ✅' : 'Request sent! ✅')
    }
  }

  const handleShare = async (ride) => {
    await shareRide(ride, lang)
    setShareToast(true)
    setTimeout(() => setShareToast(false), 2500)
  }

  const registerPush = async (userId) => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      alert('Push non supporté')
      return
    }
    try {
      const reg = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') { alert('Permission refusée'); return }
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      })
      const { error } = await supabase.from('push_subscriptions').upsert({
        user_id: userId,
        subscription: JSON.stringify(sub)
      }, { onConflict: 'user_id' })
      if (error) alert('Erreur: ' + error.message)
      else alert('Notifications activées ! ✅')
    } catch (e) {
      alert('Erreur: ' + e.message)
    }
  }

  if (showPost) return <PostRide user={user} onBack={() => setShowPost(false)} onSuccess={() => { setShowPost(false); fetchRides(true) }} />
  if (showMessages) return <Messages user={user} contactId={contactId} onBack={() => { setShowMessages(false); setContactId(null) }} onViewProfile={(id) => { setShowMessages(false); setOtherUserId(id); setShowOtherProfile(true) }} />
  if (showProfile) return <Profile user={user} onBack={() => { setShowProfile(false); fetchRides(true) }} onShowCGU={showCGU} />
  if (showOtherProfile) return <Profile user={user} viewedUserId={otherUserId} onBack={() => { setShowOtherProfile(false); setOtherUserId(null) }} onShowCGU={showCGU} />
  if (showMap) return <Map user={user} onBack={() => setShowMap(false)} onContact={(userId) => { setContactId(userId); setShowMessages(true) }} />

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

  const totalBadge = unreadCount + pendingBookings

  return (
    <div style={{ fontFamily: "'Fredoka One', cursive", background: '#F5EDD9', minHeight: '100vh', maxWidth: '100%' }}>
      <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&family=Kalam:wght@700&display=swap" rel="stylesheet" />

      {shareToast && (
        <div style={{ position: 'fixed', top: 60, left: '50%', transform: 'translateX(-50%)', background: '#3D2B1F', color: '#fff', padding: '10px 20px', borderRadius: 14, fontFamily: "'Nunito'", fontWeight: 800, fontSize: 13, zIndex: 9999, boxShadow: '3px 3px 0 #B5967A' }}>
          {lang === 'fr' ? '✅ Trajet partagé !' : '✅ Ride shared!'}
        </div>
      )}

      <div style={{ background: '#E8572A', padding: 'calc(env(safe-area-inset-top) + 30px) 22px 22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
          <div>
            <div style={{ fontSize: 42, fontFamily: "'Fredoka One'", color: '#fff' }}>Road<span style={{ color: '#F5A623' }}>Mate</span></div>
            <div style={{ fontSize: 15, fontFamily: "'Kalam', cursive", color: '#fff', marginTop: 8 }}>{t('tagline')}</div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button onClick={toggleLanguage} style={{ background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.4)', borderRadius: 12, padding: '8px 12px', color: '#fff', fontFamily: "'Nunito'", fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>
              {lang === 'fr' ? '🇬🇧' : '🇫🇷'}
            </button>
            <button onClick={() => registerPush(user.id)} style={{ background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.4)', borderRadius: 12, padding: '8px 12px', color: '#fff', fontFamily: "'Nunito'", fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>
              🔔
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '10px 16px', border: '3px solid #3D2B1F', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 16 }}>📍</span>
            <input value={searchFrom} onChange={e => setSearchFrom(e.target.value)} placeholder={lang === 'fr' ? "D'où tu pars ?" : 'From where?'} type="search" autoComplete="off"
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: 16, fontFamily: "'Nunito'", fontWeight: 700, color: '#3D2B1F', background: 'transparent', WebkitAppearance: 'none' }} />
            {searchFrom && <button onClick={() => setSearchFrom('')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#B5967A' }}>✕</button>}
          </div>
          <div style={{ background: '#fff', borderRadius: 16, padding: '10px 16px', border: '3px solid #3D2B1F', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 16 }}>🏁</span>
            <input value={searchTo} onChange={e => setSearchTo(e.target.value)} placeholder={lang === 'fr' ? 'Où tu vas ?' : 'Where to?'} type="search" autoComplete="off"
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: 16, fontFamily: "'Nunito'", fontWeight: 700, color: '#3D2B1F', background: 'transparent', WebkitAppearance: 'none' }} />
            {searchTo && <button onClick={() => setSearchTo('')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#B5967A' }}>✕</button>}
          </div>
        </div>
      </div>

      <div style={{ padding: '14px 22px 0' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          {[['all', t('filter_all')], ['offer', t('filter_offer')], ['seek', t('filter_seek')]].map(([id, label]) => (
            <button key={id} onClick={() => setFilterType(id)} style={getTypeStyle(id)}>{label}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 6 }}>
          {CATEGORIES.map(c => (
            <button key={c.id} onClick={() => setFilterCat(c.id)} style={getCatStyle(c.id)}>{c.icon} {c.label}</button>
          ))}
        </div>
        <div style={{ marginTop: 8, marginBottom: 4, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => setFilterWomen(!filterWomen)}
            style={{ padding: '6px 14px', borderRadius: 20, border: '2.5px solid ' + (filterWomen ? '#E8572A' : '#EDE0CC'), background: filterWomen ? '#FFF0EE' : '#fff', color: filterWomen ? '#E8572A' : '#B5967A', fontSize: 12, fontFamily: "'Nunito'", fontWeight: 800, cursor: 'pointer' }}>
            {t('women_only_filter')}
          </button>
          <button onClick={() => setFilterFavorites(!filterFavorites)}
            style={{ padding: '6px 14px', borderRadius: 20, border: '2.5px solid ' + (filterFavorites ? '#F5A623' : '#EDE0CC'), background: filterFavorites ? '#FFF8EE' : '#fff', color: filterFavorites ? '#F5A623' : '#B5967A', fontSize: 12, fontFamily: "'Nunito'", fontWeight: 800, cursor: 'pointer' }}>
            {filterFavorites ? '⭐' : '☆'} {lang === 'fr' ? 'Favoris' : 'Favorites'}
          </button>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
              style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer', zIndex: 2 }} />
            <div style={{ padding: '6px 14px', borderRadius: 20, border: '2.5px solid ' + (filterDate ? '#E8572A' : '#EDE0CC'), background: filterDate ? '#FFF0EE' : '#fff', color: filterDate ? '#E8572A' : '#B5967A', fontSize: 12, fontFamily: "'Nunito'", fontWeight: 800, pointerEvents: 'none', whiteSpace: 'nowrap' }}>
              {filterDate ? '📅 ' + filterDate.split('-').reverse().join('/') : '📅 Date'}
            </div>
            {filterDate && (
              <button onClick={() => setFilterDate('')} style={{ marginLeft: 4, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#E8572A', fontWeight: 900, zIndex: 3, position: 'relative' }}>✕</button>
            )}
            {filterDate && (
              <button onClick={() => setFilterDateMode(filterDateMode === 'exact' ? 'from' : 'exact')}
                style={{ marginLeft: 4, background: filterDateMode === 'from' ? '#E8572A' : '#fff', border: '2px solid ' + (filterDateMode === 'from' ? '#E8572A' : '#EDE0CC'), borderRadius: 10, cursor: 'pointer', fontSize: 11, fontFamily: "'Nunito'", fontWeight: 800, color: filterDateMode === 'from' ? '#fff' : '#B5967A', padding: '3px 8px', zIndex: 3, position: 'relative' }}>
                {filterDateMode === 'exact' ? '= Exact' : (lang === 'fr' ? '≥ À partir' : '≥ From')}
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={{ padding: '12px 22px 100px' }}>
        {(searchFrom.trim() || searchTo.trim() || filterDate || filterFavorites) && (
          <div style={{ fontFamily: "'Nunito'", fontWeight: 700, fontSize: 13, color: '#B5967A', marginBottom: 10 }}>
            {filteredRides.length} {lang === 'fr' ? 'trajet(s) trouvé(s)' : 'ride(s) found'}
            {searchFrom ? ' — 📍 ' + searchFrom : ''}
            {searchTo ? ' — 🏁 ' + searchTo : ''}
            {filterDate ? ' — 📅 ' + filterDate.split('-').reverse().join('/') : ''}
            {filterFavorites ? ' — ⭐ ' + (lang === 'fr' ? 'Favoris' : 'Favorites') : ''}
          </div>
        )}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, fontFamily: "'Kalam', cursive", color: '#B5967A', fontSize: 18 }}>{t('loading')}</div>
        ) : filteredRides.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>{filterFavorites ? '⭐' : '🚐'}</div>
            <div style={{ fontFamily: "'Fredoka One'", fontSize: 20, color: '#3D2B1F', marginBottom: 6 }}>
              {filterFavorites ? (lang === 'fr' ? 'Aucun favori' : 'No favorites yet') : t('no_rides')}
            </div>
            <div style={{ fontFamily: "'Kalam', cursive", color: '#B5967A', fontSize: 15 }}>
              {filterFavorites ? (lang === 'fr' ? 'Appuie sur ☆ Save pour sauvegarder un trajet' : 'Tap ☆ Save to save a ride') : searchFrom || searchTo || filterDate ? t('no_rides_search') : t('no_rides_sub')}
            </div>
          </div>
        ) : (
          <>
            {filteredRides.map(ride => {
              const cat = CATEGORIES.find(c => c.id === ride.category)
              const colors = CAT_COLORS[ride.category] || { bg: '#F5EDD9', color: '#EDE0CC' }
              const isFav = favorites.includes(ride.id)
              return (
                <div key={ride.id} style={{ background: '#fff', borderRadius: 20, padding: 16, border: '3px solid #3D2B1F', boxShadow: '4px 4px 0 #3D2B1F', marginBottom: 12 }}>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
                      <span style={{ fontSize: 11, fontFamily: "'Nunito'", fontWeight: 800, padding: '4px 10px', borderRadius: 20, background: colors.bg, color: '#3D2B1F', border: '2px solid ' + colors.color }}>
                        {cat?.icon} {cat?.label}
                      </span>
                      <span style={{ fontSize: 11, fontFamily: "'Nunito'", fontWeight: 800, padding: '4px 10px', borderRadius: 20, background: ride.type === 'offer' ? '#E8F8EF' : '#EFF6FF', color: ride.type === 'offer' ? '#4CAF7D' : '#3B82F6', border: '2px solid ' + (ride.type === 'offer' ? '#4CAF7D' : '#3B82F6') }}>
                        {ride.type === 'offer' ? t('filter_offer') : t('filter_seek')}
                      </span>
                      <button onClick={() => toggleFavorite(ride.id)}
                        style={{ marginLeft: 'auto', fontSize: 11, fontFamily: "'Nunito'", fontWeight: 800, padding: '4px 10px', borderRadius: 20, border: '2px solid ' + (isFav ? '#F5A623' : '#EDE0CC'), background: isFav ? '#FFF8EE' : '#F5EDD9', color: isFav ? '#F5A623' : '#7B5C42', cursor: 'pointer' }}>
                        {isFav ? '⭐ Favori' : '☆ Save'}
                      </button>
                    </div>
                    {ride.women_only && (
                      <div style={{ marginTop: 6 }}>
                        <span style={{ fontSize: 11, fontFamily: "'Nunito'", fontWeight: 800, padding: '4px 10px', borderRadius: 20, background: '#FFF0EE', color: '#E8572A', border: '2px solid #E8572A' }}>
                          👩 {lang === 'fr' ? 'Femmes' : 'Women'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <div style={{ width: 44, height: 44, borderRadius: 14, background: '#E8572A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, border: '2.5px solid #3D2B1F', overflow: 'hidden' }}>
                        {ride.profiles?.avatar_url ? <img src={ride.profiles.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🤙'}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <button onClick={() => { setOtherUserId(ride.user_id); setShowOtherProfile(true) }}
                            style={{ fontFamily: "'Fredoka One'", fontSize: 20, color: '#E8572A', cursor: 'pointer', textDecoration: 'none', background: 'none', border: 'none', padding: 0, fontWeight: 900 }}>
                            {ride.profiles?.name || 'Anonyme'}
                          </button>
                          {(ride.profiles?.whatsapp || ride.profiles?.instagram) && (
                            <span style={{ fontSize: 13 }}>✅</span>
                          )}
                        </div>
                        <div style={{ fontSize: 11, fontFamily: "'Nunito'", fontWeight: 700, color: '#B5967A' }}>{ride.profiles?.nationality || ''}</div>
                      </div>
                    </div>
                    {ride.price && (
                      <div style={{ background: '#F5A623', borderRadius: 14, padding: '6px 12px', border: '2.5px solid #3D2B1F', boxShadow: '3px 3px 0 #3D2B1F', textAlign: 'center' }}>
                        <div style={{ fontSize: 18, fontFamily: "'Fredoka One'", color: '#3D2B1F' }}>{ride.price}$</div>
                        <div style={{ fontSize: 9, fontFamily: "'Nunito'", fontWeight: 800, color: '#7B3F00' }}>{lang === 'fr' ? '/siege' : '/seat'}</div>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <div style={{ flex: 1, background: '#F5EDD9', borderRadius: 12, padding: '8px 12px', border: '2px solid #EDE0CC' }}>
                      <div style={{ fontSize: 10, fontFamily: "'Nunito'", fontWeight: 800, color: '#B5967A', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>{lang === 'fr' ? 'De' : 'From'}</div>
                      <div style={{ fontSize: 15, fontFamily: "'Fredoka One'", color: '#3D2B1F' }}>{ride.from_city}</div>
                    </div>
                    <span style={{ fontSize: 18 }}>→</span>
                    <div style={{ flex: 1, background: '#F5EDD9', borderRadius: 12, padding: '8px 12px', border: '2px solid #EDE0CC' }}>
                      <div style={{ fontSize: 10, fontFamily: "'Nunito'", fontWeight: 800, color: '#B5967A', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>{lang === 'fr' ? 'À' : 'To'}</div>
                      <div style={{ fontSize: 15, fontFamily: "'Fredoka One'", color: '#3D2B1F' }}>{ride.to_city}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 6, marginBottom: ride.note ? 10 : 12, alignItems: 'center' }}>
                    <span style={{ fontSize: 11, fontFamily: "'Nunito'", fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: '#F5EDD9', color: '#7B5C42', border: '1.5px solid #EDE0CC' }}>
                      📅 {ride.date ? ride.date.split('-').reverse().join('/') : ''}{ride.time ? ' · ' + ride.time : ''}
                    </span>
                    <span style={{ fontSize: 11, fontFamily: "'Nunito'", fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: ride.seats === 0 ? '#FFF0EE' : '#F5EDD9', color: ride.seats === 0 ? '#E8572A' : '#7B5C42', border: '1.5px solid ' + (ride.seats === 0 ? '#E8572A' : '#EDE0CC') }}>
  💺 {ride.seats} {lang === 'fr' ? 'dispo' : 'left'} / {ride.total_seats || ride.seats}
</span>
                    <button onClick={() => handleShare(ride)}
                      style={{ marginLeft: 'auto', fontSize: 11, fontFamily: "'Nunito'", fontWeight: 700, padding: '3px 10px', borderRadius: 20, border: '1.5px solid #EDE0CC', background: '#F5EDD9', color: '#7B5C42', cursor: 'pointer' }}>
                      {lang === 'fr' ? '↗ Partager' : '↗ Share'}
                    </button>
                  </div>

                  {ride.note && (
                    <div style={{ background: '#FFF8EE', borderRadius: 12, padding: '8px 12px', border: '2px dashed #F5A623', marginBottom: 12 }}>
                      <span style={{ fontSize: 13, fontFamily: "'Kalam', cursive", color: '#7B5C42' }}>"{ride.note}"</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => { setContactId(ride.user_id); setShowMessages(true) }}
                      style={{ flex: 1, padding: '12px', borderRadius: 14, border: '3px solid #3D2B1F', cursor: 'pointer', background: '#F5EDD9', color: '#3D2B1F', fontSize: 15, fontFamily: "'Fredoka One'", boxShadow: '4px 4px 0 #3D2B1F' }}>
                      💬 {t('contact')}
                    </button>
                    {ride.user_id !== user.id && ride.type === 'offer' && (
                      <button onClick={() => handleBooking(ride)}
                        style={{ flex: 1, padding: '12px', borderRadius: 14, border: '3px solid #3D2B1F', cursor: 'pointer', background: '#E8572A', color: '#fff', fontSize: 15, fontFamily: "'Fredoka One'", boxShadow: '4px 4px 0 #3D2B1F' }}>
                        🤝 {lang === 'fr' ? 'Réserver' : 'Book'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}

            {hasMore && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <button onClick={loadMore} disabled={loadingMore}
                  style={{ padding: '12px 24px', borderRadius: 14, border: '3px solid #3D2B1F', background: loadingMore ? '#EDE0CC' : '#E8572A', color: '#fff', fontSize: 15, fontFamily: "'Fredoka One'", boxShadow: loadingMore ? 'none' : '4px 4px 0 #3D2B1F', cursor: loadingMore ? 'not-allowed' : 'pointer' }}>
                  {loadingMore ? (lang === 'fr' ? 'Chargement...' : 'Loading...') : (lang === 'fr' ? 'Voir plus 🚗' : 'Load more 🚗')}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430, background: '#fff', borderTop: '3px solid #3D2B1F', padding: '12px 0 20px', display: 'flex', justifyContent: 'space-around' }}>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <span style={{ fontSize: 22 }}>🏠</span>
          <span style={{ fontSize: 10, fontFamily: "'Nunito'", fontWeight: 800, color: '#E8572A', textTransform: 'uppercase' }}>Home</span>
        </button>
        <button onClick={() => setShowMap(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <span style={{ fontSize: 22 }}>🗺️</span>
          <span style={{ fontSize: 10, fontFamily: "'Nunito'", fontWeight: 800, color: '#B5967A', textTransform: 'uppercase' }}>{lang === 'fr' ? 'Carte' : 'Map'}</span>
        </button>
        <button onClick={() => setShowMessages(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, position: 'relative' }}>
          <span style={{ fontSize: 22 }}>📬</span>
          {totalBadge > 0 && (
            <div style={{ position: 'absolute', top: -4, right: -4, background: '#E8572A', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>
              <span style={{ fontSize: 10, fontFamily: "'Nunito'", fontWeight: 800, color: '#fff' }}>{totalBadge > 9 ? '9+' : totalBadge}</span>
            </div>
          )}
          <span style={{ fontSize: 10, fontFamily: "'Nunito'", fontWeight: 800, color: '#B5967A', textTransform: 'uppercase' }}>{lang === 'fr' ? 'Activité' : 'Activity'}</span>
        </button>
        <button onClick={() => setShowPost(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <span style={{ fontSize: 22 }}>➕</span>
          <span style={{ fontSize: 10, fontFamily: "'Nunito'", fontWeight: 800, color: '#B5967A', textTransform: 'uppercase' }}>{lang === 'fr' ? 'Poster' : 'Post'}</span>
        </button>
        <button onClick={() => setShowProfile(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <span style={{ fontSize: 22 }}>🤠</span>
          <span style={{ fontSize: 10, fontFamily: "'Nunito'", fontWeight: 800, color: '#B5967A', textTransform: 'uppercase' }}>{lang === 'fr' ? 'Profil' : 'Profile'}</span>
        </button>
      </div>
    </div>
  )
}
