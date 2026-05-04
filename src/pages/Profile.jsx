import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabase'
import { useLanguage } from '../LanguageContext'

const VISAS = ['WHV', 'Student', 'Tourist', 'Work', 'Resident', 'Other']

export default function Profile({ user, viewedUserId, onBack, onShowCGU }) {
  const { t, lang } = useLanguage()
  const isOwnProfile = !viewedUserId || viewedUserId === user.id
  const targetId = isOwnProfile ? user.id : viewedUserId

  const [profile, setProfile] = useState(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: '', nationality: '', visa: 'WHV', bio: '', whatsapp: '', instagram: '', show_whatsapp: false, show_instagram: false, vehicle_brand: '', vehicle_model: '', vehicle_color: '' })
  const [rides, setRides] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [canReview, setCanReview] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [editingRide, setEditingRide] = useState(null)
  const [showReportForm, setShowReportForm] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [submittingReport, setSubmittingReport] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => { fetchProfile() }, [targetId])

  const fetchProfile = async () => {
    setLoading(true)
    const { data: profileData } = await supabase.from('profiles').select('*').eq('id', targetId).single()
    const { data: ridesData } = await supabase.from('rides').select('*').eq('user_id', targetId).order('created_at', { ascending: false })
    const { data: reviewsData } = await supabase.from('reviews').select('*').eq('reviewed_id', targetId).order('created_at', { ascending: false })
    if (profileData) {
      setProfile(profileData)
      setForm({
        name: profileData.name || '',
        nationality: profileData.nationality || '',
        visa: profileData.visa || 'WHV',
        bio: profileData.bio || '',
        whatsapp: profileData.whatsapp || '',
        instagram: profileData.instagram || '',
        show_whatsapp: profileData.show_whatsapp || false,
        show_instagram: profileData.show_instagram || false,
        vehicle_brand: profileData.vehicle_brand || '',
        vehicle_model: profileData.vehicle_model || '',
        vehicle_color: profileData.vehicle_color || ''
      })
    }
    setRides(ridesData || [])
    let reviewsWithNames = reviewsData || []
    if (reviewsData && reviewsData.length > 0) {
      const reviewerIds = [...new Set(reviewsData.map(r => r.reviewer_id))]
      const { data: reviewerProfiles } = await supabase.from('profiles').select('id, name').in('id', reviewerIds)
      reviewsWithNames = reviewsData.map(r => ({
        ...r,
        reviewer: reviewerProfiles?.find(p => p.id === r.reviewer_id) || null
      }))
    }
    setReviews(reviewsWithNames)
    if (!isOwnProfile) {
  const { data: bookingCheck } = await supabase
    .from('bookings')
    .select('id')
    .eq('status', 'accepted')
    .or('and(passenger_id.eq.' + user.id + ',driver_id.eq.' + targetId + '),and(passenger_id.eq.' + targetId + ',driver_id.eq.' + user.id + ')')
    .maybeSingle()
  setCanReview(!!bookingCheck)
}
    setLoading(false)
  }

  const uploadAvatar = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploadingPhoto(true)
    const ext = file.name.split('.').pop()
    const fileName = `${user.id}/${user.id}.${ext}`
    const { error } = await supabase.storage.from('avatars').upload(fileName, file, { upsert: true })
    if (!error) {
      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName)
      await supabase.from('profiles').upsert({ id: user.id, avatar_url: data.publicUrl })
      fetchProfile()
      setMessage(lang === 'fr' ? 'Photo mise a jour ! ✅' : 'Photo updated! ✅')
      setTimeout(() => setMessage(''), 3000)
    }
    setUploadingPhoto(false)
  }

  const saveProfile = async () => {
    setSaving(true)
    const { error } = await supabase.from('profiles').upsert({ id: user.id, ...form })
    if (!error) {
      setMessage(lang === 'fr' ? 'Profil sauvegarde ! ✅' : 'Profile saved! ✅')
      setEditing(false)
      fetchProfile()
    } else {
      setMessage(lang === 'fr' ? 'Erreur lors de la sauvegarde' : 'Error saving profile')
    }
    setSaving(false)
    setTimeout(() => setMessage(''), 3000)
  }

  const deleteRide = async (rideId) => {
    await supabase.from('rides').delete().eq('id', rideId)
    fetchProfile()
  }

  const toggleRideActive = async (ride) => {
    await supabase.from('rides').update({ active: !ride.active }).eq('id', ride.id)
    fetchProfile()
  }

  const saveRide = async (ride) => {
    await supabase.from('rides').update({
      from_city: ride.from_city,
      to_city: ride.to_city,
      date: ride.date,
      seats: parseInt(ride.seats),
      price: ride.price || null,
      note: ride.note || null
    }).eq('id', ride.id)
    setEditingRide(null)
    fetchProfile()
  }

  const submitReview = async () => {
    setSubmittingReview(true)
    const { error } = await supabase.from('reviews').insert({
      reviewer_id: user.id,
      reviewed_id: targetId,
      rating,
      comment
    })
    if (!error) {
      setMessage(lang === 'fr' ? 'Avis envoye ! ✅' : 'Review sent! ✅')
      setShowReviewForm(false)
      setComment('')
      setRating(5)
      fetchProfile()
    }
    setSubmittingReview(false)
    setTimeout(() => setMessage(''), 3000)
  }

  const submitReport = async () => {
    if (!reportReason.trim()) return
    setSubmittingReport(true)
    await supabase.from('reports').insert({
      reporter_id: user.id,
      reported_id: targetId,
      reason: reportReason
    })
    setSubmittingReport(false)
    setShowReportForm(false)
    setReportReason('')
    setMessage(lang === 'fr' ? 'Signalement envoyé ✅' : 'Report sent ✅')
    setTimeout(() => setMessage(''), 3000)
  }

  const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : null
  const isVerified = !!(profile?.whatsapp || profile?.instagram)

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#F5EDD9', fontFamily: "'Kalam', cursive", fontSize: 20, color: '#B5967A' }}>
      {lang === 'fr' ? 'Chargement... 🤙' : 'Loading... 🤙'}
    </div>
  )

  return (
    <div style={{ fontFamily: "'Fredoka One', cursive", background: '#F5EDD9', minHeight: '100vh', maxWidth: '100%' }}>
      <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&family=Kalam:wght@700&family=Dancing+Script:wght@700&display=swap" rel="stylesheet" />

      {/* HEADER */}
      <div style={{ background: 'linear-gradient(135deg, #E8572A, #C4622D)', padding: 'calc(env(safe-area-inset-top) + 16px) 20px 20px' }}>
        <div style={{ marginBottom: 20 }}>
  <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.4)', borderRadius: 12, padding: '8px 14px', color: '#fff', fontFamily: "'Nunito'", fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>
    {t('post_back')}
  </button>
</div>

<div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
  <div style={{ position: 'relative' }}>
    <div style={{ width: 72, height: 72, borderRadius: 22, background: '#E8572A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, border: '3px solid #3D2B1F', boxShadow: '4px 4px 0 rgba(0,0,0,0.2)', overflow: 'hidden' }}>
      {profile?.avatar_url ? <img src={profile.avatar_url} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🤙'}
    </div>
    {isOwnProfile && (
      <>
        <button onClick={() => fileInputRef.current.click()} disabled={uploadingPhoto}
          style={{ position: 'absolute', bottom: -6, right: -6, width: 26, height: 26, borderRadius: 8, background: '#fff', border: '2px solid #3D2B1F', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {uploadingPhoto ? '⏳' : '📷'}
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={uploadAvatar} style={{ display: 'none' }} />
      </>
    )}
  </div>
  <div style={{ flex: 1 }}>
    {editing ? (
      <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
        placeholder={lang === 'fr' ? 'Ton prenom' : 'Your name'}
        style={{ fontSize: 22, fontFamily: "'Fredoka One'", color: '#3D2B1F', background: 'rgba(255,255,255,0.9)', border: '2px solid #3D2B1F', borderRadius: 10, padding: '4px 10px' }} />
    ) : (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 26, fontFamily: "'Fredoka One'", color: '#fff' }}>{profile?.name || 'Anonyme'}</div>
        {isOwnProfile && (
          <button onClick={() => editing ? saveProfile() : setEditing(true)} disabled={saving}
  style={{ background: '#F5EDD9', border: '2px solid #3D2B1F', borderRadius: 20, padding: '5px 14px', color: '#3D2B1F', fontFamily: "'Nunito'", fontWeight: 800, fontSize: 12, cursor: 'pointer', boxShadow: '2px 2px 0 #3D2B1F' }}>
  {saving ? (lang === 'fr' ? 'Sauvegarde...' : 'Saving...') : editing ? (lang === 'fr' ? '✅ Sauvegarder' : '✅ Save') : (lang === 'fr' ? '✏️ Modifier' : '✏️ Edit')}
</button>
        )}
      </div>
    )}
    {isVerified && (
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4 }}>
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="7" fill="#4CAF7D"/>
          <path d="M3.5 7L6 9.5L10.5 5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span style={{ fontFamily: "'Dancing Script', cursive", fontSize: 14, fontWeight: 700, color: '#fff', fontStyle: 'italic' }}>
          {lang === 'fr' ? 'profil vérifié' : 'verified profile'}
        </span>
      </div>
    )}
  </div>
</div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            ['🚐', rides.length, lang === 'fr' ? 'Trajets' : 'Rides'],
            ['⭐', avgRating || '0', lang === 'fr' ? 'Avis' : 'Reviews'],
            ['🌍', profile?.nationality || '-', lang === 'fr' ? 'Nationalité' : 'Nationality']
          ].map(([icon, val, label]) => (
            <div key={label} style={{ flex: 1, background: '#F5EDD9', border: '2px solid #3D2B1F', borderRadius: 20, padding: '8px 4px', textAlign: 'center', boxShadow: '2px 2px 0 #3D2B1F' }}>
  <div style={{ fontSize: 14 }}>{icon}</div>
  <div style={{ fontSize: 13, fontFamily: "'Fredoka One'", color: '#3D2B1F', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{val}</div>
  <div style={{ fontSize: 8, fontFamily: "'Nunito'", fontWeight: 800, color: '#B5967A', textTransform: 'uppercase' }}>{label}</div>
</div>
          ))}
        </div>
      </div>

      {message && (
        <div style={{ margin: '12px 20px 0', padding: '10px 14px', borderRadius: 12, background: '#E8F8EF', border: '2px solid #4CAF7D', fontSize: 13, fontFamily: "'Nunito'", fontWeight: 700, color: '#3D2B1F' }}>{message}</div>
      )}

      <div style={{ padding: '16px 20px 100px', display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* TRAVELER INFO */}
        <div style={{ background: '#fff', borderRadius: 20, padding: 16, border: '3px solid #3D2B1F', boxShadow: '4px 4px 0 #3D2B1F' }}>
         <div style={{ marginBottom: 12 }}>
  <div style={{ fontSize: 10, fontFamily: "'Nunito'", fontWeight: 800, color: '#B5967A', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{t('profile_bio')}</div>
  {editing ? (
    <textarea value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
      placeholder={lang === 'fr' ? 'Parle de toi...' : 'Tell us about yourself...'}
      rows={3} style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '2.5px solid #EDE0CC', background: '#fff', fontSize: 14, fontFamily: "'Kalam', cursive", color: '#3D2B1F', resize: 'none', boxSizing: 'border-box', lineHeight: 1.6 }} />
  ) : (
    <div style={{ fontSize: 14, fontFamily: "'Kalam', cursive", color: '#7B5C42', lineHeight: 1.6 }}>{profile?.bio || (lang === 'fr' ? 'Aucune bio' : 'No bio')}</div>
  )}
</div>

<div style={{ marginBottom: 12 }}>
  <div style={{ fontSize: 10, fontFamily: "'Nunito'", fontWeight: 800, color: '#B5967A', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>📋 {t('profile_visa')}</div>
  {editing ? (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {VISAS.map(v => (
        <button key={v} onClick={() => setForm(p => ({ ...p, visa: v }))}
          style={{ padding: '5px 10px', borderRadius: 20, border: '2.5px solid ' + (form.visa === v ? '#3D2B1F' : '#EDE0CC'), background: form.visa === v ? '#E8572A' : '#fff', color: form.visa === v ? '#fff' : '#7B5C42', fontSize: 12, fontFamily: "'Nunito'", fontWeight: 800, cursor: 'pointer' }}>
          {v}
        </button>
      ))}
    </div>
  ) : (
    <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 20, background: '#FFF3E0', border: '2px solid #F97316', fontSize: 13, fontFamily: "'Nunito'", fontWeight: 800, color: '#F97316' }}>
      {profile?.visa || '-'}
    </div>
  )} 
          </div>

          {/* WHATSAPP */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 10, fontFamily: "'Nunito'", fontWeight: 800, color: '#B5967A', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>📱 {t('profile_whatsapp')}</div>
            {editing ? (
              <div>
                <input value={form.whatsapp} onChange={e => setForm(p => ({ ...p, whatsapp: e.target.value }))}
                  placeholder="+61 4XX XXX XXX"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '2.5px solid #EDE0CC', background: '#fff', fontSize: 14, fontFamily: "'Nunito'", fontWeight: 700, color: '#3D2B1F', boxSizing: 'border-box', marginBottom: 8 }} />
                {form.whatsapp && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ fontSize: 12, fontFamily: "'Nunito'", fontWeight: 700, color: '#7B5C42' }}>{lang === 'fr' ? 'Visible publiquement' : 'Visible publicly'}</div>
                    <button onClick={() => setForm(p => ({ ...p, show_whatsapp: !p.show_whatsapp }))}
                      style={{ width: 44, height: 24, borderRadius: 12, border: '2px solid #3D2B1F', background: form.show_whatsapp ? '#4CAF7D' : '#EDE0CC', cursor: 'pointer', position: 'relative' }}>
                      <div style={{ width: 16, height: 16, borderRadius: 8, background: '#fff', border: '2px solid #3D2B1F', position: 'absolute', top: 2, left: form.show_whatsapp ? 22 : 2 }} />
                    </button>
                    <div style={{ fontSize: 11, fontFamily: "'Nunito'", fontWeight: 800, color: form.show_whatsapp ? '#4CAF7D' : '#B5967A' }}>{form.show_whatsapp ? 'ON' : 'OFF'}</div>
                  </div>
                )}
              </div>
            ) : profile?.whatsapp && profile?.show_whatsapp ? (
              <a href={'https://wa.me/' + profile.whatsapp.replace(/\D/g, '')} target="_blank" rel="noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 20, background: '#E8F8EF', border: '2px solid #4CAF7D', fontSize: 12, fontFamily: "'Nunito'", fontWeight: 800, color: '#4CAF7D', textDecoration: 'none' }}>
                📱 {profile.whatsapp}
              </a>
            ) : profile?.whatsapp && isOwnProfile ? (
              <div style={{ fontSize: 13, fontFamily: "'Nunito'", fontWeight: 700, color: '#B5967A' }}>{profile.whatsapp} {lang === 'fr' ? '(non visible)' : '(not visible)'}</div>
            ) : (
              <div style={{ fontSize: 13, fontFamily: "'Nunito'", fontWeight: 700, color: '#B5967A' }}>{lang === 'fr' ? 'Non renseigné' : 'Not specified'}</div>
            )}
          </div>

          {/* INSTAGRAM */}
          <div>
            <div style={{ fontSize: 10, fontFamily: "'Nunito'", fontWeight: 800, color: '#B5967A', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>📷 {t('profile_instagram')}</div>
            {editing ? (
              <div>
                <input value={form.instagram} onChange={e => setForm(p => ({ ...p, instagram: e.target.value }))}
                  placeholder="@your_handle"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '2.5px solid #EDE0CC', background: '#fff', fontSize: 14, fontFamily: "'Nunito'", fontWeight: 700, color: '#3D2B1F', boxSizing: 'border-box', marginBottom: 8 }} />
                {form.instagram && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ fontSize: 12, fontFamily: "'Nunito'", fontWeight: 700, color: '#7B5C42' }}>{lang === 'fr' ? 'Visible publiquement' : 'Visible publicly'}</div>
                    <button onClick={() => setForm(p => ({ ...p, show_instagram: !p.show_instagram }))}
                      style={{ width: 44, height: 24, borderRadius: 12, border: '2px solid #3D2B1F', background: form.show_instagram ? '#4CAF7D' : '#EDE0CC', cursor: 'pointer', position: 'relative' }}>
                      <div style={{ width: 16, height: 16, borderRadius: 8, background: '#fff', border: '2px solid #3D2B1F', position: 'absolute', top: 2, left: form.show_instagram ? 22 : 2 }} />
                    </button>
                    <div style={{ fontSize: 11, fontFamily: "'Nunito'", fontWeight: 800, color: form.show_instagram ? '#4CAF7D' : '#B5967A' }}>{form.show_instagram ? 'ON' : 'OFF'}</div>
                  </div>
                )}
              </div>
            ) : profile?.instagram && profile?.show_instagram ? (
              <a href={'https://instagram.com/' + profile.instagram.replace('@', '')} target="_blank" rel="noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 20, background: '#FFF0F8', border: '2px solid #E1306C', fontSize: 12, fontFamily: "'Nunito'", fontWeight: 800, color: '#E1306C', textDecoration: 'none' }}>
                📷 {profile.instagram}
              </a>
            ) : profile?.instagram && isOwnProfile ? (
              <div style={{ fontSize: 13, fontFamily: "'Nunito'", fontWeight: 700, color: '#B5967A' }}>{profile.instagram} {lang === 'fr' ? '(non visible)' : '(not visible)'}</div>
            ) : (
              <div style={{ fontSize: 13, fontFamily: "'Nunito'", fontWeight: 700, color: '#B5967A' }}>{lang === 'fr' ? 'Non renseigné' : 'Not specified'}</div>
            )}
          </div>
        </div>

        {/* VEHICLE */}
        {(profile?.vehicle_brand || profile?.vehicle_model || editing) && (
          <div style={{ background: '#fff', borderRadius: 20, padding: 16, border: '3px solid #3D2B1F', boxShadow: '4px 4px 0 #3D2B1F' }}>
            <div style={{ fontSize: 16, fontFamily: "'Fredoka One'", color: '#E8572A', marginBottom: 12 }}>🚗 {t('profile_vehicle')}</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, fontFamily: "'Nunito'", fontWeight: 800, color: '#B5967A', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{t('profile_brand')}</div>
                {editing ? (
                  <input value={form.vehicle_brand} onChange={e => setForm(p => ({ ...p, vehicle_brand: e.target.value }))}
                    placeholder="Ex: Toyota"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 10, border: '2.5px solid #EDE0CC', fontSize: 13, fontFamily: "'Nunito'", fontWeight: 700, color: '#3D2B1F', boxSizing: 'border-box' }} />
                ) : (
                  <div style={{ fontSize: 14, fontFamily: "'Nunito'", fontWeight: 700, color: '#3D2B1F' }}>{profile?.vehicle_brand || '-'}</div>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, fontFamily: "'Nunito'", fontWeight: 800, color: '#B5967A', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{t('profile_model')}</div>
                {editing ? (
                  <input value={form.vehicle_model} onChange={e => setForm(p => ({ ...p, vehicle_model: e.target.value }))}
                    placeholder="Ex: HiAce"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 10, border: '2.5px solid #EDE0CC', fontSize: 13, fontFamily: "'Nunito'", fontWeight: 700, color: '#3D2B1F', boxSizing: 'border-box' }} />
                ) : (
                  <div style={{ fontSize: 14, fontFamily: "'Nunito'", fontWeight: 700, color: '#3D2B1F' }}>{profile?.vehicle_model || '-'}</div>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, fontFamily: "'Nunito'", fontWeight: 800, color: '#B5967A', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{t('profile_color')}</div>
                {editing ? (
                  <input value={form.vehicle_color} onChange={e => setForm(p => ({ ...p, vehicle_color: e.target.value }))}
                    placeholder="Ex: White"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 10, border: '2.5px solid #EDE0CC', fontSize: 13, fontFamily: "'Nunito'", fontWeight: 700, color: '#3D2B1F', boxSizing: 'border-box' }} />
                ) : (
                  <div style={{ fontSize: 14, fontFamily: "'Nunito'", fontWeight: 700, color: '#3D2B1F' }}>{profile?.vehicle_color || '-'}</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* MY RIDES */}
        {isOwnProfile && (
          <div style={{ background: '#fff', borderRadius: 20, padding: 16, border: '3px solid #3D2B1F', boxShadow: '4px 4px 0 #3D2B1F' }}>
            <div style={{ fontSize: 16, fontFamily: "'Fredoka One'", color: '#E8572A', marginBottom: 12 }}>{lang === 'fr' ? '🚐 Mes trajets' : '🚐 My Rides'}</div>
            {rides.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0', fontFamily: "'Kalam', cursive", color: '#B5967A', fontSize: 15 }}>
                {lang === 'fr' ? 'Aucun trajet posté 🌊' : 'No rides posted 🌊'}
              </div>
            ) : rides.map((ride, index) => (
              <div key={ride.id} style={{ padding: '10px 0', borderBottom: index < rides.length - 1 ? '1.5px solid #EDE0CC' : 'none' }}>
                {editingRide?.id === ride.id ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input value={editingRide.from_city} onChange={e => setEditingRide(r => ({ ...r, from_city: e.target.value }))}
                        placeholder={lang === 'fr' ? 'De' : 'From'}
                        style={{ width: '50%', padding: '8px 12px', borderRadius: 10, border: '2px solid #EDE0CC', fontSize: 13, fontFamily: "'Nunito'", fontWeight: 700, color: '#3D2B1F', boxSizing: 'border-box' }} />
                      <input value={editingRide.to_city} onChange={e => setEditingRide(r => ({ ...r, to_city: e.target.value }))}
                        placeholder={lang === 'fr' ? 'A' : 'To'}
                        style={{ width: '50%', padding: '8px 12px', borderRadius: 10, border: '2px solid #EDE0CC', fontSize: 13, fontFamily: "'Nunito'", fontWeight: 700, color: '#3D2B1F', boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input type="date" value={editingRide.date} onChange={e => setEditingRide(r => ({ ...r, date: e.target.value }))}
                        style={{ flex: 1, padding: '8px 12px', borderRadius: 10, border: '2px solid #EDE0CC', fontSize: 13, fontFamily: "'Nunito'", fontWeight: 700, color: '#3D2B1F', boxSizing: 'border-box' }} />
                      <input type="number" value={editingRide.seats} onChange={e => setEditingRide(r => ({ ...r, seats: e.target.value }))}
                        placeholder={lang === 'fr' ? 'Places' : 'Seats'}
                        style={{ width: 70, padding: '8px 12px', borderRadius: 10, border: '2px solid #EDE0CC', fontSize: 13, fontFamily: "'Nunito'", fontWeight: 700, color: '#3D2B1F', boxSizing: 'border-box' }} />
                    </div>
                    <input value={editingRide.price || ''} onChange={e => setEditingRide(r => ({ ...r, price: e.target.value }))}
                      placeholder={lang === 'fr' ? 'Prix ($) optionnel' : 'Price ($) optional'}
                      style={{ padding: '8px 12px', borderRadius: 10, border: '2px solid #EDE0CC', fontSize: 13, fontFamily: "'Nunito'", fontWeight: 700, color: '#3D2B1F', boxSizing: 'border-box', width: '100%' }} />
                    <textarea value={editingRide.note || ''} onChange={e => setEditingRide(r => ({ ...r, note: e.target.value }))}
                      placeholder={lang === 'fr' ? 'Note (optionnel)' : 'Note (optional)'}
                      rows={2} style={{ padding: '8px 12px', borderRadius: 10, border: '2px solid #EDE0CC', fontSize: 13, fontFamily: "'Kalam', cursive", color: '#3D2B1F', resize: 'none', boxSizing: 'border-box', width: '100%' }} />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => setEditingRide(null)}
                        style={{ flex: 1, padding: '8px', borderRadius: 10, border: '2px solid #EDE0CC', background: '#fff', fontSize: 13, fontFamily: "'Nunito'", fontWeight: 800, color: '#7B5C42', cursor: 'pointer' }}>
                        {lang === 'fr' ? 'Annuler' : 'Cancel'}
                      </button>
                      <button onClick={() => saveRide(editingRide)}
                        style={{ flex: 2, padding: '8px', borderRadius: 10, border: '2.5px solid #3D2B1F', background: '#4CAF7D', fontSize: 13, fontFamily: "'Nunito'", fontWeight: 800, color: '#fff', cursor: 'pointer', boxShadow: '2px 2px 0 #3D2B1F' }}>
                        {lang === 'fr' ? 'Sauvegarder ✓' : 'Save ✓'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
  <div style={{ flex: 1, minWidth: 0 }}>
    <div style={{ fontSize: 14, fontFamily: "'Fredoka One'", color: ride.active ? '#3D2B1F' : '#B5967A' }}>
      {ride.from_city} → {ride.to_city}
    </div>
    <div style={{ fontSize: 11, fontFamily: "'Nunito'", fontWeight: 700, color: '#B5967A' }}>
      {ride.date ? ride.date.split('-').reverse().join('/') : ''} · {ride.seats} {lang === 'fr' ? 'place(s)' : 'seat(s)'}
    </div>
  </div>
  <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
    <button onClick={() => toggleRideActive(ride)}
      style={{ background: ride.active ? '#E8F8EF' : '#FFF0EE', border: '2px solid ' + (ride.active ? '#4CAF7D' : '#E8572A'), borderRadius: 10, padding: '6px 8px', cursor: 'pointer', fontSize: 11, fontFamily: "'Nunito'", fontWeight: 800, color: ride.active ? '#4CAF7D' : '#E8572A', width: 76, textAlign: 'center' }}>
      {ride.active ? (lang === 'fr' ? '✅ Actif' : '✅ Active') : (lang === 'fr' ? '🔴 Complet' : '🔴 Full')}
    </button>
    <button onClick={() => setEditingRide({ ...ride })}
      style={{ background: '#FFF3E0', border: '2px solid #F97316', borderRadius: 10, padding: '6px 10px', cursor: 'pointer', fontSize: 14 }}>✏️</button>
    <button onClick={() => deleteRide(ride.id)}
      style={{ background: '#FFF0EE', border: '2px solid #E8572A', borderRadius: 10, padding: '6px 10px', cursor: 'pointer', fontSize: 14 }}>🗑️</button>
  </div>
</div>
                )}
              </div>
            ))}
          </div>
        )}

       

        {reviews.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 20, padding: 16, border: '3px solid #3D2B1F', boxShadow: '4px 4px 0 #3D2B1F' }}>
            <div style={{ fontSize: 16, fontFamily: "'Fredoka One'", color: '#E8572A', marginBottom: 12 }}>⭐ {lang === 'fr' ? 'Avis' : 'Reviews'} ({reviews.length})</div>
            {reviews.map((review, index) => (
              <div key={review.id} style={{ paddingBottom: 12, marginBottom: 12, borderBottom: index < reviews.length - 1 ? '1.5px solid #EDE0CC' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <div style={{ fontFamily: "'Fredoka One'", fontSize: 14, color: '#3D2B1F' }}>{review.reviewer?.name || 'Anonyme'}</div>
                  <div style={{ fontSize: 13 }}>{'⭐'.repeat(review.rating)}</div>
                </div>
                {review.comment && (
                  <div style={{ fontSize: 13, fontFamily: "'Kalam', cursive", color: '#7B5C42', lineHeight: 1.5 }}>{review.comment}</div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* SIGNALEMENT */}
        {!isOwnProfile && (
          !showReportForm ? (
            <button onClick={() => setShowReportForm(true)}
              style={{ width: '100%', padding: '12px', borderRadius: 14, border: '2.5px solid #EDE0CC', cursor: 'pointer', background: '#fff', color: '#B5967A', fontSize: 14, fontFamily: "'Fredoka One'" }}>
              🚩 {lang === 'fr' ? 'Signaler cet utilisateur' : 'Report this user'}
            </button>
          ) : (
            <div style={{ background: '#fff', borderRadius: 20, padding: 16, border: '3px solid #3D2B1F', boxShadow: '4px 4px 0 #3D2B1F' }}>
              <div style={{ fontSize: 16, fontFamily: "'Fredoka One'", color: '#E8572A', marginBottom: 12 }}>🚩 {lang === 'fr' ? 'Signaler' : 'Report'}</div>
              <textarea value={reportReason} onChange={e => setReportReason(e.target.value)}
                placeholder={lang === 'fr' ? 'Raison du signalement...' : 'Reason for report...'}
                rows={3} style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '2.5px solid #EDE0CC', background: '#fff', fontSize: 14, fontFamily: "'Nunito'", fontWeight: 600, color: '#3D2B1F', resize: 'none', boxSizing: 'border-box', marginBottom: 10 }} />
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setShowReportForm(false)}
                  style={{ flex: 1, padding: '10px', borderRadius: 12, border: '2.5px solid #EDE0CC', background: '#fff', fontSize: 14, fontFamily: "'Nunito'", fontWeight: 800, color: '#7B5C42', cursor: 'pointer' }}>
                  {lang === 'fr' ? 'Annuler' : 'Cancel'}
                </button>
                <button onClick={submitReport} disabled={submittingReport || !reportReason.trim()}
                  style={{ flex: 2, padding: '10px', borderRadius: 12, border: '3px solid #3D2B1F', background: '#E8572A', fontSize: 14, fontFamily: "'Nunito'", fontWeight: 800, color: '#fff', cursor: 'pointer', boxShadow: '3px 3px 0 #3D2B1F' }}>
                  {submittingReport ? (lang === 'fr' ? 'Envoi...' : 'Sending...') : (lang === 'fr' ? 'Envoyer 🚩' : 'Send 🚩')}
                </button>
              </div>
            </div>
          )
        )}

        {/* TERMS + SIGN OUT */}
        {isOwnProfile && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button onClick={() => onShowCGU && onShowCGU()}
              style={{ width: '100%', padding: '12px', borderRadius: 14, border: '3px solid #EDE0CC', cursor: 'pointer', background: '#fff', color: '#7B5C42', fontSize: 15, fontFamily: "'Fredoka One'", boxShadow: '4px 4px 0 #EDE0CC' }}>
              {lang === 'fr' ? "Conditions d'utilisation 📋" : 'Terms of Service 📋'}
            </button>
            <button onClick={() => supabase.auth.signOut()}
              style={{ width: '100%', padding: '12px', borderRadius: 14, border: '3px solid #3D2B1F', cursor: 'pointer', background: '#fff', color: '#E8572A', fontSize: 15, fontFamily: "'Fredoka One'", boxShadow: '4px 4px 0 #3D2B1F' }}>
              {lang === 'fr' ? 'Se déconnecter 👋' : 'Sign out 👋'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}