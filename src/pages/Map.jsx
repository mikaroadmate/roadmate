import { useEffect, useRef, useState } from 'react'
import { supabase } from '../supabase'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useLanguage } from '../LanguageContext'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN

export default function Map({ user, onBack, onContact }) {
  const { lang } = useLanguage()
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
        zoom: 2.5
      })
    }
  }, [])

  useEffect(() => {
    if (!map.current || rides.length === 0) return

    const geojson = {
      type: 'FeatureCollection',
      features: rides
        .filter(r => r.from_lat && r.from_lng)
        .map((r) => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [
              r.from_lng + (Math.random() - 0.5) * 0.002,
              r.from_lat + (Math.random() - 0.5) * 0.002
            ]
          },
          properties: {
            id: r.id,
            user_id: r.user_id,
            from_city: r.from_city,
            to_city: r.to_city,
            date: r.date,
            seats: r.seats,
            price: r.price,
            type: r.type
          }
        }))
    }

    const setup = () => {
      if (map.current.getSource('rides')) return

      map.current.addSource('rides', {
        type: 'geojson',
        data: geojson,
        cluster: true,
        clusterMaxZoom: 12,
        clusterRadius: 50
      })

      map.current.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'rides',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#E8572A',
          'circle-radius': ['step', ['get', 'point_count'], 20, 5, 30, 10, 40],
          'circle-stroke-width': 3,
          'circle-stroke-color': '#3D2B1F'
        }
      })

      map.current.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'rides',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-size': 14,
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold']
        },
        paint: { 'text-color': '#fff' }
      })

      map.current.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'rides',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': ['match', ['get', 'type'], 'offer', '#E8572A', '#3B82F6'],
          'circle-radius': 18,
          'circle-stroke-width': 3,
          'circle-stroke-color': '#3D2B1F'
        }
      })

      map.current.on('click', 'clusters', (e) => {
        const features = map.current.queryRenderedFeatures(e.point, { layers: ['clusters'] })
        const clusterId = features[0].properties.cluster_id
        map.current.getSource('rides').getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return
          map.current.easeTo({ center: features[0].geometry.coordinates, zoom })
        })
      })

      map.current.on('click', 'unclustered-point', (e) => {
        const props = e.features[0].properties
        const coords = e.features[0].geometry.coordinates

        const popupEl = document.createElement('div')
        popupEl.style.cssText = 'font-family: Nunito, sans-serif; padding: 8px;'
        popupEl.innerHTML =
          '<div style="font-weight: 800; font-size: 15px; color: #3D2B1F;">' + props.from_city + ' → ' + props.to_city + '</div>' +
          '<div style="color: #B5967A; font-size: 12px; margin: 4px 0;">' + props.date + ' · ' + props.seats + ' place(s)</div>' +
          (props.price ? '<div style="color: #E8572A; font-weight: 800; font-size: 13px;">' + props.price + '$ / siège</div>' : '') +
          '<button id="contact-btn-' + props.id + '" style="margin-top: 8px; width: 100%; padding: 8px; border-radius: 10px; border: 2px solid #3D2B1F; background: #E8572A; color: #fff; font-weight: 800; cursor: pointer; font-size: 13px;">Contacter 🤙</button>'

        const popup = new mapboxgl.Popup({ offset: 25 })
          .setLngLat(coords)
          .setDOMContent(popupEl)
          .addTo(map.current)

        setTimeout(() => {
          const btn = document.getElementById('contact-btn-' + props.id)
          if (btn) {
            btn.addEventListener('click', () => {
              popup.remove()
              onContact(props.user_id)
            })
          }
        }, 100)
      })

      map.current.on('mouseenter', 'clusters', () => { map.current.getCanvas().style.cursor = 'pointer' })
      map.current.on('mouseleave', 'clusters', () => { map.current.getCanvas().style.cursor = '' })
      map.current.on('mouseenter', 'unclustered-point', () => { map.current.getCanvas().style.cursor = 'pointer' })
      map.current.on('mouseleave', 'unclustered-point', () => { map.current.getCanvas().style.cursor = '' })
    }

    if (map.current.loaded()) {
      setup()
    } else {
      map.current.on('load', setup)
    }
  }, [rides])

  const fetchRides = async () => {
    const { data } = await supabase
      .from('rides')
      .select('*, profiles(name, nationality)')
      .order('created_at', { ascending: false })
    setRides(data || [])
  }

  return (
    <div style={{ fontFamily: "'Fredoka One', cursive", background: '#F5EDD9', minHeight: '100vh', maxWidth: '100%', display: 'flex', flexDirection: 'column' }}>
      <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet" />

      <div style={{ background: '#3D2B1F', padding: 'calc(env(safe-area-inset-top) + 16px) 22px 18px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.1)', border: '2px solid rgba(255,255,255,0.2)', borderRadius: 12, padding: '8px 14px', color: '#fff', fontFamily: "'Nunito'", fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>
            ← Retour
          </button>
          <div style={{ fontSize: 22, fontFamily: "'Fredoka One'", color: '#fff' }}>Carte 🗺️</div>
        </div>
      </div>

      <div style={{ flex: 1, position: 'relative' }}>
  <div ref={mapContainer} style={{ position: 'absolute', inset: 0 }} />
        <div style={{ position: 'absolute', bottom: 30, left: 16, background: 'rgba(255,255,255,0.95)', borderRadius: 14, padding: '10px 14px', border: '2.5px solid #3D2B1F', boxShadow: '3px 3px 0 #3D2B1F', display: 'flex', flexDirection: 'column', gap: 6, zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#E8572A', border: '2px solid #3D2B1F', flexShrink: 0 }} />
            <span style={{ fontFamily: "'Nunito'", fontSize: 12, fontWeight: 800, color: '#3D2B1F' }}>{lang === 'fr' ? 'Offre' : 'Offer'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#3B82F6', border: '2px solid #3D2B1F', flexShrink: 0 }} />
            <span style={{ fontFamily: "'Nunito'", fontSize: 12, fontWeight: 800, color: '#3D2B1F' }}>{lang === 'fr' ? 'Cherche' : 'Seeking'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}