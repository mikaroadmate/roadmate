import { useEffect, useRef, useState } from 'react'
import { supabase } from '../supabase'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN

export default function Map({ user, onBack, onContact }) {
  const mapContainer = useRef(null)
  const map = useRef(null)
  const [rides, setRides] = useState([])

  useEffect(() => {
    fetchRides()
  }, [])

  useEffect(() => {
    if (!map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [133.7751, -25.2744],
        zoom: 4
      })
    }
  }, [])

  useEffect(() => {
    if (!map.current || rides.length === 0) return
    map.current.on('load', () => {
      rides.forEach(ride => {
        if (!ride.from_lng || !ride.from_lat) return
        const el = document.createElement('div')
        el.style.cssText = `
          width: 36px; height: 36px; border-radius: 50%;
          background: #E8572A; border: 3px solid #3D2B1F;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; cursor: pointer; box-shadow: 2px 2px 0 #3D2B1F;
        `
        el.innerHTML = ride.type === 'offer' ? '🚗' : '🙋'
        new mapboxgl.Marker(el)
          .setLngLat([ride.from_lng, ride.from_lat])
          .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div style="font-family: 'Nunito', sans-serif; padding: 8px;">
              <div style="font-weight: 800; font-size: 15px;">${ride.from_city} → ${ride.to_city}</div>
              <div style="color: #B5967A; font-size: 12px;">${ride.date} · ${ride.seats} place(s)</div>
              ${ride.price ? <div style="color: #E8572A; font-weight: 800;">${ride.price}$ / siège</div> : ''}
            </div>
          `))
          .addTo(map.current)
      })
    })
  }, [rides])

  const fetchRides = async () => {
    const { data } = await supabase
      .from('rides')
      .select('*, profiles(name, nationality)')
      .order('created_at', { ascending: false })
    setRides(data || [])
  }

  return (
    <div style={{ fontFamily: "'Fredoka One', cursive", background: '#F5EDD9', minHeight: '100vh', maxWidth: 430, margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
      <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
      
      <div style={{ background: '#3D2B1F', padding: '48px 22px 18px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.1)', border: '2px solid rgba(255,255,255,0.2)', borderRadius: 12, padding: '8px 14px', color: '#fff', fontFamily: "'Nunito'", fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>
            ← Retour
          </button>
          <div style={{ fontSize: 22, fontFamily: "'Fredoka One'", color: '#fff' }}>Carte 🗺️</div>
        </div>
      </div>

      <div ref={mapContainer} style={{ flex: 1, minHeight: '80vh' }} />
    </div>
  )
}