import webpush from 'web-push'

webpush.setVapidDetails(
  process.env.VAPID_EMAIL,
  process.env.VITE_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).end()

  const { subscription, title, body } = req.body

  try {
    await webpush.sendNotification(
      JSON.parse(subscription),
      JSON.stringify({ title, body })
    )
    res.status(200).json({ success: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}