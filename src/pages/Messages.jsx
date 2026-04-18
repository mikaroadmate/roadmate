import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabase'
import { useLanguage } from '../LanguageContext'

export default function Messages({ user, contactId, onBack, onViewProfile }) {
  const { t, lang } = useLanguage()
  const [conversations, setConversations] = useState([])
  const [activeConv, setActiveConv] = useState(contactId || null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [profiles, setProfiles] = useState({})
  const bottomRef = useRef(null)

  useEffect(() => { fetchConversations() }, [])
  useEffect(() => {
    if (activeConv) {
      fetchMessages(activeConv)
      const channel = supabase.channel('messages-' + activeConv)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        }, (payload) => {
          const msg = payload.new
          if (
            (msg.sender_id === user.id && msg.receiver_id === activeConv) ||
            (msg.sender_id === activeConv && msg.receiver_id === user.id)
          ) {
            setMessages(prev => [...prev, msg])
          }
        })
        .subscribe()
      return () => supabase.removeChannel(channel)
    }
  }, [activeConv])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const fetchConversations = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('messages')
      .select('*, sender:profiles!messages_sender_id_fkey(id, name, nationality), receiver:profiles!messages_receiver_id_fkey(id, name, nationality)')
      .or('sender_id.eq.' + user.id + ',receiver_id.eq.' + user.id)
      .order('created_at', { ascending: false })

    if (data) {
      const convMap = {}
      data.forEach(msg => {
        const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id
        const otherProfile = msg.sender_id === user.id ? msg.receiver : msg.sender
        if (!convMap[otherId]) {
          convMap[otherId] = { otherId, otherProfile, lastMsg: msg }
        }
      })
      setConversations(Object.values(convMap))
    }

    if (contactId) {
      const { data: profileData } = await supabase.from('profiles').select('id, name, nationality').eq('id', contactId).single()
      if (profileData) setProfiles(p => ({ ...p, [contactId]: profileData }))
    }

    setLoading(false)
  }

  const fetchMessages = async (otherId) => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or('and(sender_id.eq.' + user.id + ',receiver_id.eq.' + otherId + '),and(sender_id.eq.' + otherId + ',receiver_id.eq.' + user.id + ')')
      .order('created_at', { ascending: true })
    setMessages(data || [])
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConv) return
    const { error } = await supabase.from('messages').insert({
      sender_id: user.id,
      receiver_id: activeConv,
      content: newMessage.trim(),
    })
    if (!error) {
      setNewMessage('')
      fetchConversations()
      const { data: subData } = await supabase
        .from('push_subscriptions')
        .select('subscription')
        .eq('user_id', activeConv)
        .maybeSingle()
      if (subData) {
        await fetch('/api/send-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subscription: subData.subscription,
            title: lang === 'fr' ? 'Nouveau message RoadMate 🤙' : 'New message RoadMate 🤙',
            body: newMessage.trim()
          })
        })
      }
    }
  }

  const getOtherName = (id) => {
    const conv = conversations.find(c => c.otherId === id)
    if (conv?.otherProfile?.name) return conv.otherProfile.name
    if (profiles[id]?.name) return profiles[id].name
    return lang === 'fr' ? 'Utilisateur' : 'User'
  }

  const quickReplies = lang === 'fr'
    ? ["Je suis in ! 🤙", "C'est quand ? ⏰", "Quel prix ? 💰", "OK parfait ✓"]
    : ["I'm in! 🤙", "When is it? ⏰", "What's the price? 💰", "OK perfect ✓"]

  if (activeConv) {
    return (
      <div style={{ fontFamily: "'Fredoka One', cursive", background: '#F5EDD9', minHeight: '100vh', maxWidth: '100%', display: 'flex', flexDirection: 'column' }}>
        <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&family=Kalam:wght@700&display=swap" rel="stylesheet" />

        <div style={{ background: '#5BC8D4', padding: '48px 22px 18px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setActiveConv(null)}
              style={{ background: 'rgba(255,255,255,0.25)', border: '2px solid rgba(255,255,255,0.4)', borderRadius: 12, padding: '8px 14px', color: '#3D2B1F', fontFamily: "'Nunito'", fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>
              {t('post_back')}
            </button>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, border: '2.5px solid #3D2B1F' }}>🤙</div>
            <div>
              <button onClick={() => onViewProfile && onViewProfile(activeConv)}
                style={{ fontSize: 20, fontFamily: "'Fredoka One'", color: '#3D2B1F', cursor: 'pointer', textDecoration: 'underline', background: 'none', border: 'none', padding: 0 }}>
                {getOtherName(activeConv)}
              </button>
              <div style={{ fontSize: 11, fontFamily: "'Kalam', cursive", color: 'rgba(61,43,31,0.7)' }}>RoadMate</div>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, fontFamily: "'Kalam', cursive", color: '#B5967A', fontSize: 16 }}>
              {t('messages_start')}
            </div>
          )}
          {messages.map(msg => (
            <div key={msg.id} style={{ display: 'flex', justifyContent: msg.sender_id === user.id ? 'flex-end' : 'flex-start' }}>
              <div style={{ maxWidth: '75%', padding: '10px 14px', borderRadius: msg.sender_id === user.id ? '18px 18px 4px 18px' : '18px 18px 18px 4px', background: msg.sender_id === user.id ? '#E8572A' : '#fff', border: msg.sender_id === user.id ? '2.5px solid #3D2B1F' : '2.5px solid #EDE0CC', boxShadow: msg.sender_id === user.id ? '3px 3px 0 #3D2B1F' : '2px 2px 0 #EDE0CC' }}>
                <div style={{ fontSize: 14, fontFamily: "'Nunito'", fontWeight: 600, color: msg.sender_id === user.id ? '#fff' : '#3D2B1F', lineHeight: 1.5 }}>{msg.content}</div>
                <div style={{ fontSize: 10, fontFamily: "'Nunito'", fontWeight: 700, color: msg.sender_id === user.id ? 'rgba(255,255,255,0.7)' : '#B5967A', marginTop: 3, textAlign: msg.sender_id === user.id ? 'right' : 'left' }}>
                  {new Date(msg.created_at).toLocaleTimeString(lang === 'fr' ? 'fr-FR' : 'en-AU', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div style={{ padding: '8px 18px 0', display: 'flex', gap: 7, overflowX: 'auto', flexShrink: 0 }}>
          {quickReplies.map(r => (
            <button key={r} onClick={() => setNewMessage(r)}
              style={{ flexShrink: 0, padding: '6px 12px', borderRadius: 20, border: '2.5px solid #EDE0CC', background: '#fff', fontSize: 12, fontFamily: "'Nunito'", fontWeight: 700, color: '#7B5C42', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              {r}
            </button>
          ))}
        </div>

        <div style={{ padding: '10px 18px 32px', display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
          <input value={newMessage} onChange={e => setNewMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder={t('messages_placeholder')}
            style={{ flex: 1, padding: '12px 16px', borderRadius: 18, border: '3px solid #EDE0CC', background: '#fff', fontSize: 14, fontFamily: "'Nunito'", fontWeight: 600, color: '#3D2B1F' }} />
          <button onClick={sendMessage}
            style={{ width: 48, height: 48, borderRadius: 16, border: '3px solid #3D2B1F', background: newMessage.trim() ? '#E8572A' : '#EDE0CC', cursor: 'pointer', fontSize: 20, boxShadow: '4px 4px 0 #3D2B1F', flexShrink: 0 }}>
            🤙
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: "'Fredoka One', cursive", background: '#F5EDD9', minHeight: '100vh', maxWidth: '100%' }}>
      <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&family=Kalam:wght@700&display=swap" rel="stylesheet" />

      <div style={{ background: '#3D2B1F', padding: '48px 22px 22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 26, fontFamily: "'Fredoka One'", color: '#fff' }}>{t('messages_title')}</div>
            <div style={{ fontSize: 13, fontFamily: "'Kalam', cursive", color: 'rgba(255,255,255,0.65)' }}>{t('messages_sub')}</div>
          </div>
          <button onClick={onBack}
            style={{ background: 'rgba(255,255,255,0.1)', border: '2px solid rgba(255,255,255,0.2)', borderRadius: 12, padding: '8px 14px', color: '#fff', fontFamily: "'Nunito'", fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>
            {t('messages_home')}
          </button>
        </div>
      </div>

      <div style={{ flex: 1 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, fontFamily: "'Kalam', cursive", color: '#B5967A', fontSize: 18 }}>{t('loading')} 💬</div>
        ) : conversations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
            <div style={{ fontFamily: "'Fredoka One'", fontSize: 20, color: '#3D2B1F', marginBottom: 6 }}>{t('messages_empty')}</div>
            <div style={{ fontFamily: "'Kalam', cursive", color: '#B5967A', fontSize: 15 }}>{t('messages_empty_sub')}</div>
          </div>
        ) : conversations.map(conv => (
          <div key={conv.otherId} onClick={() => setActiveConv(conv.otherId)}
            style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 22px', cursor: 'pointer', borderBottom: '1.5px solid #EDE0CC' }}>
            <div style={{ width: 54, height: 54, borderRadius: 18, background: '#E8572A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, border: '3px solid #3D2B1F', flexShrink: 0 }}>🤙</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "'Fredoka One'", fontSize: 16, color: '#3D2B1F', marginBottom: 3 }}>{conv.otherProfile?.name || (lang === 'fr' ? 'Utilisateur' : 'User')}</div>
              <div style={{ fontSize: 13, fontFamily: "'Nunito'", fontWeight: 600, color: '#B5967A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{conv.lastMsg.content}</div>
            </div>
            <div style={{ fontSize: 11, fontFamily: "'Nunito'", fontWeight: 700, color: '#B5967A', flexShrink: 0 }}>
              {new Date(conv.lastMsg.created_at).toLocaleTimeString(lang === 'fr' ? 'fr-FR' : 'en-AU', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}