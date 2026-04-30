import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { useLanguage } from '../LanguageContext'

export default function Bookings({ user, onBack, onContact, embedded = false }) {
  const { lang } = useLanguage()
  const [tab, setTab] = useState('received')
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchBookings() }, [tab])

  useEffect(() => {
    const channel = supabase.channel('bookings-realtime')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'bookings' }, (payload) => {
        const updated = payload.new
        const isDriver = tab === 'received'
        const hiddenForMe = isDriver ? updated.hidden_by_driver : updated.hidden_by_passenger
        if (hiddenForMe) {
          setBookings(prev => prev.filter(b => b.id !== updated.id))
        } else {
          setBookings(prev => prev.map(b => b.id === updated.id ? { ...b, status: updated.status, hidden_by_driver: updated.hidden_by_driver, hidden_by_passenger: updated.hidden_by_passenger } : b))
        }
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [tab])

  const fetchBookings = async () => {
    setLoading(true)
    let query = supabase
      .from('bookings')
      .select('*, rides(from_city, to_city, date, seats)')
      .order('created_at', { ascending: false })

    if (tab === 'received') {
      query = query.eq('driver_id', user.id).eq('hidden_by_driver', false)
    } else {
      query = query.eq('passenger_id', user.id).eq('hidden_by_passenger', false)
    }

    const { data } = await query
    if (data) {
      const enriched = await Promise.all(data.map(async (booking) => {
        const { data: passenger } = await supabase.from('profiles').select('name, avatar_url').eq('id', booking.passenger_id).single()
        const { data: driver } = await supabase.from('profiles').select('name, avatar_url').eq('id', booking.driver_id).single()
        return { ...booking, profiles: passenger, driver }
      }))
      setBookings(enriched)
    } else {
      setBookings([])
    }
    setLoading(false)
  }

  const handleAcceptRefuse = async (bookingId, status) => {
  const booking = bookings.find(b => b.id === bookingId)
  await supabase.from('bookings').update({ status }).eq('id', bookingId)
  setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b))

  // Déduire une place si accepté
  if (status === 'accepted' && booking?.ride_id) {
    const currentSeats = booking.rides?.seats || 1
    await supabase.from('rides').update({ seats: Math.max(0, currentSeats - 1) }).eq('id', booking.ride_id)
  }

  // Notifier le passager
  const { data: subData } = await supabase
    .from('push_subscriptions')
    .select('subscription')
    .eq('user_id', booking.passenger_id)
    .maybeSingle()

  if (subData) {
    const title = status === 'accepted'
      ? (lang === 'fr' ? '✅ Réservation acceptée !' : '✅ Booking accepted!')
      : (lang === 'fr' ? '❌ Réservation refusée' : '❌ Booking refused')
    const body = (booking.rides?.from_city || '') + ' → ' + (booking.rides?.to_city || '')
    await fetch('/api/send-notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription: subData.subscription, title, body })
    })
  }
}

  const handleCancel = async (bookingId, isDriver) => {
  const booking = bookings.find(b => b.id === bookingId)
  const updateData = isDriver
    ? { status: 'cancelled', hidden_by_driver: true }
    : { status: 'cancelled', hidden_by_passenger: true }
  await supabase.from('bookings').update(updateData).eq('id', bookingId)
  setBookings(prev => prev.filter(b => b.id !== bookingId))

  // Remettre la place si c'était accepté
  if (booking?.status === 'accepted' && booking?.ride_id) {
    const currentSeats = booking.rides?.seats || 0
    await supabase.from('rides').update({ seats: currentSeats + 1 }).eq('id', booking.ride_id)
  }

  // Notifier l'autre personne
  const notifyUserId = isDriver ? booking.passenger_id : booking.driver_id
  const { data: subData } = await supabase
    .from('push_subscriptions')
    .select('subscription')
    .eq('user_id', notifyUserId)
    .maybeSingle()

  if (subData) {
    const title = lang === 'fr' ? '🚫 Réservation annulée' : '🚫 Booking cancelled'
    const body = (booking.rides?.from_city || '') + ' → ' + (booking.rides?.to_city || '')
    await fetch('/api/send-notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription: subData.subscription, title, body })
    })
  }
}

  const handleHide = async (bookingId, isDriver) => {
    // L'autre qui veut faire disparaître la carte annulée
    const updateData = isDriver ? { hidden_by_driver: true } : { hidden_by_passenger: true }
    await supabase.from('bookings').update(updateData).eq('id', bookingId)
    setBookings(prev => prev.filter(b => b.id !== bookingId))
  }

  const statusLabel = (status) => {
    const labels = {
      pending: { fr: '⏳ En attente', en: '⏳ Pending', color: '#F5A623' },
      accepted: { fr: '✅ Accepté', en: '✅ Accepted', color: '#4CAF7D' },
      refused: { fr: '❌ Refusé', en: '❌ Refused', color: '#E8572A' },
      cancelled: { fr: '🚫 Annulé', en: '🚫 Cancelled', color: '#B5967A' },
    }
    return labels[status] || labels.pending
  }

  return (
    <div style={{ fontFamily: "'Fredoka One', cursive", background: '#F5EDD9', minHeight: '100vh' }}>
      <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&family=Kalam:wght@700&display=swap" rel="stylesheet" />

      {!embedded && (
        <div style={{ background: '#E8572A', padding: 'calc(env(safe-area-inset-top) + 20px) 22px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 12, padding: '8px 12px', color: '#fff', fontSize: 18, cursor: 'pointer' }}>←</button>
            <div style={{ fontSize: 26, fontFamily: "'Fredoka One'", color: '#fff' }}>
              {lang === 'fr' ? '🤝 Réservations' : '🤝 Bookings'}
            </div>
          </div>
        </div>
      )}

      <div style={{ padding: '12px 22px' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {['received', 'sent'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ flex: 1, padding: '10px', borderRadius: 14, border: '2.5px solid #3D2B1F', cursor: 'pointer', fontFamily: "'Fredoka One'", fontSize: 14, background: tab === t ? '#3D2B1F' : '#fff', color: tab === t ? '#fff' : '#7B5C42' }}>
              {t === 'received' ? (lang === 'fr' ? '📥 Reçues' : '📥 Received') : (lang === 'fr' ? '📤 Envoyées' : '📤 Sent')}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '4px 22px 100px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, fontFamily: "'Kalam', cursive", color: '#B5967A', fontSize: 18 }}>
            {lang === 'fr' ? 'Chargement...' : 'Loading...'}
          </div>
        ) : bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🤝</div>
            <div style={{ fontFamily: "'Fredoka One'", fontSize: 20, color: '#3D2B1F', marginBottom: 6 }}>
              {lang === 'fr' ? 'Aucune réservation' : 'No bookings yet'}
            </div>
            <div style={{ fontFamily: "'Kalam', cursive", color: '#B5967A', fontSize: 15 }}>
              {tab === 'received'
                ? (lang === 'fr' ? 'Les demandes de place apparaîtront ici' : 'Seat requests will appear here')
                : (lang === 'fr' ? 'Tes demandes envoyées apparaîtront ici' : 'Your sent requests will appear here')}
            </div>
          </div>
        ) : (
          bookings.map(booking => {
            const status = statusLabel(booking.status)
            const isDriver = tab === 'received'
            const person = isDriver ? booking.profiles : booking.driver
            const isCancelled = booking.status === 'cancelled'
            return (
              <div key={booking.id} style={{ background: '#fff', borderRadius: 20, padding: 16, border: '3px solid #3D2B1F', boxShadow: '4px 4px 0 #3D2B1F', marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: '#E8572A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, border: '2px solid #3D2B1F', overflow: 'hidden' }}>
                      {person?.avatar_url ? <img src={person.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🤙'}
                    </div>
                    <div style={{ fontFamily: "'Fredoka One'", fontSize: 18, color: '#E8572A' }}>{person?.name || 'Anonyme'}</div>
                  </div>
                  <div style={{ fontSize: 12, fontFamily: "'Nunito'", fontWeight: 800, padding: '4px 10px', borderRadius: 20, background: status.color + '22', color: status.color, border: '2px solid ' + status.color }}>
                    {lang === 'fr' ? status.fr : status.en}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <div style={{ flex: 1, background: '#F5EDD9', borderRadius: 12, padding: '8px 12px', border: '2px solid #EDE0CC' }}>
                    <div style={{ fontSize: 10, fontFamily: "'Nunito'", fontWeight: 800, color: '#B5967A', textTransform: 'uppercase', marginBottom: 2 }}>{lang === 'fr' ? 'De' : 'From'}</div>
                    <div style={{ fontSize: 15, fontFamily: "'Fredoka One'", color: '#3D2B1F' }}>{booking.rides?.from_city}</div>
                  </div>
                  <span style={{ fontSize: 18 }}>→</span>
                  <div style={{ flex: 1, background: '#F5EDD9', borderRadius: 12, padding: '8px 12px', border: '2px solid #EDE0CC' }}>
                    <div style={{ fontSize: 10, fontFamily: "'Nunito'", fontWeight: 800, color: '#B5967A', textTransform: 'uppercase', marginBottom: 2 }}>{lang === 'fr' ? 'À' : 'To'}</div>
                    <div style={{ fontSize: 15, fontFamily: "'Fredoka One'", color: '#3D2B1F' }}>{booking.rides?.to_city}</div>
                  </div>
                </div>

                <div style={{ fontSize: 12, fontFamily: "'Nunito'", fontWeight: 700, color: '#7B5C42', marginBottom: 12 }}>
                  📅 {booking.rides?.date ? booking.rides.date.split('-').reverse().join('/') : ''}
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  {!isCancelled && (
                    <button onClick={() => onContact(isDriver ? booking.passenger_id : booking.driver_id)}
                      style={{ flex: 1, padding: '10px', borderRadius: 12, border: '2.5px solid #3D2B1F', cursor: 'pointer', background: '#F5EDD9', color: '#3D2B1F', fontSize: 13, fontFamily: "'Fredoka One'" }}>
                      💬 {lang === 'fr' ? 'Contacter' : 'Contact'}
                    </button>
                  )}

                  {isDriver && booking.status === 'pending' && (
                    <>
                      <button onClick={() => handleAcceptRefuse(booking.id, 'accepted')}
                        style={{ flex: 1, padding: '10px', borderRadius: 12, border: '2.5px solid #4CAF7D', cursor: 'pointer', background: '#E8F8EF', color: '#4CAF7D', fontSize: 13, fontFamily: "'Fredoka One'" }}>
                        ✅ {lang === 'fr' ? 'Accepter' : 'Accept'}
                      </button>
                      <button onClick={() => handleAcceptRefuse(booking.id, 'refused')}
                        style={{ flex: 1, padding: '10px', borderRadius: 12, border: '2.5px solid #E8572A', cursor: 'pointer', background: '#FFF0EE', color: '#E8572A', fontSize: 13, fontFamily: "'Fredoka One'" }}>
                        ❌ {lang === 'fr' ? 'Refuser' : 'Refuse'}
                      </button>
                    </>
                  )}

                  {!isCancelled && ((!isDriver && (booking.status === 'pending' || booking.status === 'accepted')) || (isDriver && booking.status === 'accepted')) && (
                    <button onClick={() => handleCancel(booking.id, isDriver)}
                      style={{ flex: 1, padding: '10px', borderRadius: 12, border: '2.5px solid #B5967A', cursor: 'pointer', background: '#F5EDD9', color: '#B5967A', fontSize: 13, fontFamily: "'Fredoka One'" }}>
                      🚫 {lang === 'fr' ? 'Annuler' : 'Cancel'}
                    </button>
                  )}

                  {(isCancelled || booking.status === 'refused') && (
  <button onClick={() => handleHide(booking.id, isDriver)}
    style={{ flex: 1, padding: '10px', borderRadius: 12, border: '2.5px solid #B5967A', cursor: 'pointer', background: '#F5EDD9', color: '#B5967A', fontSize: 13, fontFamily: "'Fredoka One'" }}>
    🗑️ {lang === 'fr' ? 'Supprimer' : 'Remove'}
  </button>
)}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}