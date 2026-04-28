import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import Auth from './pages/Auth'
import Home from './pages/Home'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY

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

function CGU({ onBack, lang }) {
  return (
    <div style={{ fontFamily: "'Fredoka One', cursive", background: '#F5EDD9', minHeight: '100vh', maxWidth: '100%' }}>
      <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&family=Kalam:wght@700&display=swap" rel="stylesheet" />
      <div style={{ background: '#3D2B1F', padding: 'calc(env(safe-area-inset-top) + 16px) 22px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.1)', border: '2px solid rgba(255,255,255,0.2)', borderRadius: 12, padding: '8px 14px', color: '#fff', fontFamily: "'Nunito'", fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>
            {lang === 'fr' ? '← Retour' : '← Back'}
          </button>
          <div style={{ fontSize: 22, fontFamily: "'Fredoka One'", color: '#fff' }}>
            {lang === 'fr' ? "Conditions d'utilisation 📋" : 'Terms of Service 📋'}
          </div>
        </div>
      </div>
      <div style={{ padding: '20px 22px 60px' }}>
        {lang === 'fr' ? (
          <>
            <div style={{ background: '#fff', borderRadius: 20, padding: 18, border: '3px solid #3D2B1F', boxShadow: '4px 4px 0 #3D2B1F', marginBottom: 14 }}>
              <div style={{ fontSize: 16, fontFamily: "'Fredoka One'", color: '#E8572A', marginBottom: 8 }}>1. Objet et Présentation</div>
              <div style={{ fontSize: 13, fontFamily: "'Nunito'", fontWeight: 600, color: '#3D2B1F', lineHeight: 1.6 }}>
                RoadMate est une plateforme de mise en relation entre conducteurs et passagers pour des trajets en Australie, éditée par Mickael Beaudeau. L'application est accessible sur roadmateoz.app sous forme d'application mobile progressive (PWA). RoadMate agit uniquement en tant qu'intermédiaire de mise en relation et n'est partie à aucun accord conclu entre les utilisateurs.
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: 20, padding: 18, border: '3px solid #3D2B1F', boxShadow: '4px 4px 0 #3D2B1F', marginBottom: 14 }}>
              <div style={{ fontSize: 16, fontFamily: "'Fredoka One'", color: '#E8572A', marginBottom: 8 }}>2. Conditions d'Accès</div>
              <div style={{ fontSize: 13, fontFamily: "'Nunito'", fontWeight: 600, color: '#3D2B1F', lineHeight: 1.6 }}>
                L'utilisation de RoadMate est réservée aux personnes physiques âgées de 18 ans ou plus. Toute inscription par une personne mineure est strictement interdite. En créant un compte, vous déclarez avoir 18 ans ou plus et acceptez l'intégralité des présentes conditions.
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: 20, padding: 18, border: '3px solid #3D2B1F', boxShadow: '4px 4px 0 #3D2B1F', marginBottom: 14 }}>
              <div style={{ fontSize: 16, fontFamily: "'Fredoka One'", color: '#E8572A', marginBottom: 8 }}>3. Création de Compte</div>
              <div style={{ fontSize: 13, fontFamily: "'Nunito'", fontWeight: 600, color: '#3D2B1F', lineHeight: 1.6 }}>
                Lors de la création de votre compte, vous vous engagez à fournir des informations exactes et à les maintenir à jour. Vous êtes seul responsable de la confidentialité de vos identifiants et de toute activité effectuée sous votre compte. Il est interdit de créer plusieurs comptes ou d'utiliser l'identité d'un tiers.
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: 20, padding: 18, border: '3px solid #3D2B1F', boxShadow: '4px 4px 0 #3D2B1F', marginBottom: 14 }}>
              <div style={{ fontSize: 16, fontFamily: "'Fredoka One'", color: '#E8572A', marginBottom: 8 }}>4. Utilisation du Service</div>
              <div style={{ fontSize: 13, fontFamily: "'Nunito'", fontWeight: 600, color: '#3D2B1F', lineHeight: 1.6 }}>
                RoadMate est destiné exclusivement à la mise en relation entre conducteurs et passagers pour le partage de trajets. Toute utilisation à des fins commerciales ou professionnelles est interdite. En tant que conducteur, vous vous engagez à être titulaire d'un permis de conduire valide, disposer d'une assurance véhicule en cours de validité, ne proposer que des trajets réellement envisagés, informer vos passagers de tout changement ou annulation, et adopter un comportement responsable au volant. En tant que passager, vous vous engagez à adopter un comportement respectueux, informer le conducteur en cas d'empêchement, et respecter les horaires et lieux convenus.
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: 20, padding: 18, border: '3px solid #3D2B1F', boxShadow: '4px 4px 0 #3D2B1F', marginBottom: 14 }}>
              <div style={{ fontSize: 16, fontFamily: "'Fredoka One'", color: '#E8572A', marginBottom: 8 }}>5. Paiements et Participation aux Frais</div>
              <div style={{ fontSize: 13, fontFamily: "'Nunito'", fontWeight: 600, color: '#3D2B1F', lineHeight: 1.6 }}>
                Le prix affiché par siège représente une participation aux frais du trajet (carburant, péages, etc.). Le conducteur s'engage à ne pas réaliser de bénéfice via la plateforme. RoadMate n'intervient pas dans les transactions financières entre utilisateurs. Les paiements sont des arrangements directs entre conducteur et passager. Nous recommandons fortement le paiement en espèces lors de la rencontre afin d'éviter toute escroquerie. RoadMate décline toute responsabilité en cas de litige financier entre utilisateurs.
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: 20, padding: 18, border: '3px solid #3D2B1F', boxShadow: '4px 4px 0 #3D2B1F', marginBottom: 14 }}>
              <div style={{ fontSize: 16, fontFamily: "'Fredoka One'", color: '#E8572A', marginBottom: 8 }}>6. Responsabilités et Limitations</div>
              <div style={{ fontSize: 13, fontFamily: "'Nunito'", fontWeight: 600, color: '#3D2B1F', lineHeight: 1.6 }}>
                RoadMate ne peut être tenu responsable des accidents, blessures, retards ou dommages survenant lors d'un trajet, du comportement des utilisateurs avant, pendant ou après un trajet, des informations inexactes fournies par les utilisateurs, de l'annulation ou modification d'un trajet, ni des pertes financières résultant de transactions entre utilisateurs. Chaque utilisateur est seul responsable de ses actes et interactions sur la plateforme.
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: 20, padding: 18, border: '3px solid #3D2B1F', boxShadow: '4px 4px 0 #3D2B1F', marginBottom: 14 }}>
              <div style={{ fontSize: 16, fontFamily: "'Fredoka One'", color: '#E8572A', marginBottom: 8 }}>7. Comportement des Utilisateurs</div>
              <div style={{ fontSize: 13, fontFamily: "'Nunito'", fontWeight: 600, color: '#3D2B1F', lineHeight: 1.6 }}>
                Il est strictement interdit de publier des informations fausses ou trompeuses, harceler, menacer ou intimider d'autres utilisateurs, utiliser la plateforme à des fins frauduleuses ou illégales, tenter de contourner le système de mise en relation, ou publier du contenu offensant, discriminatoire ou illégal. Tout manquement peut entraîner la suspension ou suppression immédiate du compte.
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: 20, padding: 18, border: '3px solid #3D2B1F', boxShadow: '4px 4px 0 #3D2B1F', marginBottom: 14 }}>
              <div style={{ fontSize: 16, fontFamily: "'Fredoka One'", color: '#E8572A', marginBottom: 8 }}>8. Données Personnelles et RGPD</div>
              <div style={{ fontSize: 13, fontFamily: "'Nunito'", fontWeight: 600, color: '#3D2B1F', lineHeight: 1.6 }}>
                Conformément au RGPD, RoadMate collecte uniquement les données nécessaires au fonctionnement du service : email, prénom, nationalité, photo de profil, messages et tokens de notifications push. Vos données sont stockées de manière sécurisée via Supabase et ne sont jamais vendues à des tiers. Vos droits : accès à vos données, rectification, effacement (droit à l'oubli), portabilité, et opposition au traitement. Pour exercer ces droits : beaudeau_mickael@live.fr
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: 20, padding: 18, border: '3px solid #3D2B1F', boxShadow: '4px 4px 0 #3D2B1F', marginBottom: 14 }}>
              <div style={{ fontSize: 16, fontFamily: "'Fredoka One'", color: '#E8572A', marginBottom: 8 }}>9. Conservation et Suppression des Données</div>
              <div style={{ fontSize: 13, fontFamily: "'Nunito'", fontWeight: 600, color: '#3D2B1F', lineHeight: 1.6 }}>
                Vos données sont conservées tant que votre compte est actif. Vous pouvez demander la suppression de votre compte à tout moment en contactant beaudeau_mickael@live.fr. Vos données personnelles seront effacées dans un délai de 30 jours suivant la demande.
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: 20, padding: 18, border: '3px solid #3D2B1F', boxShadow: '4px 4px 0 #3D2B1F', marginBottom: 14 }}>
              <div style={{ fontSize: 16, fontFamily: "'Fredoka One'", color: '#E8572A', marginBottom: 8 }}>10. Sécurité</div>
              <div style={{ fontSize: 13, fontFamily: "'Nunito'", fontWeight: 600, color: '#3D2B1F', lineHeight: 1.6 }}>
                RoadMate met en oeuvre des mesures de sécurité techniques pour protéger vos données contre tout accès non autorisé, notamment le chiffrement des données et la sécurisation des accès via Row Level Security (RLS) sur Supabase.
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: 20, padding: 18, border: '3px solid #3D2B1F', boxShadow: '4px 4px 0 #3D2B1F', marginBottom: 14 }}>
              <div style={{ fontSize: 16, fontFamily: "'Fredoka One'", color: '#E8572A', marginBottom: 8 }}>11. Signalement et Modération</div>
              <div style={{ fontSize: 13, fontFamily: "'Nunito'", fontWeight: 600, color: '#3D2B1F', lineHeight: 1.6 }}>
                Tout utilisateur peut signaler un comportement inapproprié via la fonction de signalement intégrée à l'application. RoadMate se réserve le droit de suspendre ou supprimer tout compte en cas de violation des présentes conditions, sans préavis.
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: 20, padding: 18, border: '3px solid #3D2B1F', boxShadow: '4px 4px 0 #3D2B1F', marginBottom: 14 }}>
              <div style={{ fontSize: 16, fontFamily: "'Fredoka One'", color: '#E8572A', marginBottom: 8 }}>12. Propriété Intellectuelle</div>
              <div style={{ fontSize: 13, fontFamily: "'Nunito'", fontWeight: 600, color: '#3D2B1F', lineHeight: 1.6 }}>
                L'ensemble du contenu de RoadMate (logo, design, code, textes) est la propriété exclusive de Mickael Beaudeau et est protégé par les lois sur la propriété intellectuelle. Toute reproduction sans autorisation est interdite.
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: 20, padding: 18, border: '3px solid #3D2B1F', boxShadow: '4px 4px 0 #3D2B1F', marginBottom: 14 }}>
              <div style={{ fontSize: 16, fontFamily: "'Fredoka One'", color: '#E8572A', marginBottom: 8 }}>13. Droit Applicable</div>
              <div style={{ fontSize: 13, fontFamily: "'Nunito'", fontWeight: 600, color: '#3D2B1F', lineHeight: 1.6 }}>
                Les présentes conditions sont régies par le droit français pour les utilisateurs européens et par le droit australien pour les utilisateurs en Australie. Tout litige sera soumis aux juridictions compétentes.
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: 20, padding: 18, border: '3px solid #3D2B1F', boxShadow: '4px 4px 0 #3D2B1F', marginBottom: 14 }}>
              <div style={{ fontSize: 16, fontFamily: "'Fredoka One'", color: '#E8572A', marginBottom: 8 }}>14. Contact</div>
              <div style={{ fontSize: 13, fontFamily: "'Nunito'", fontWeight: 600, color: '#3D2B1F', lineHeight: 1.6 }}>
                Pour toute question : beaudeau_mickael@live.fr — Instagram : @all_in_mika
              </div>
            </div>

            <div style={{ fontSize: 11, fontFamily: "'Nunito'", fontWeight: 700, color: '#B5967A', textAlign: 'center', marginTop: 8 }}>
              Dernière mise à jour : Avril 2026
            </div>
          </>
        ) : (
          <>
            <div style={{ background: '#fff', borderRadius: 20, padding: 18, border: '3px solid #3D2B1F', boxShadow: '4px 4px 0 #3D2B1F', marginBottom: 14 }}>
              <div style={{ fontSize: 16, fontFamily: "'Fredoka One'", color: '#E8572A', marginBottom: 8 }}>1. Purpose and Presentation</div>
              <div style={{ fontSize: 13, fontFamily: "'Nunito'", fontWeight: 600, color: '#3D2B1F', lineHeight: 1.6 }}>
                RoadMate is a platform connecting drivers and passengers for rides across Australia, published by Mickael Beaudeau. The app is accessible at roadmateoz.app as a Progressive Web App (PWA). RoadMate acts solely as an intermediary and is not party to any agreement made between users.
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: 20, padding: 18, border: '3px solid #3D2B1F', boxShadow: '4px 4px 0 #3D2B1F', marginBottom: 14 }}>
              <div style={{ fontSize: 16, fontFamily: "'Fredoka One'", color: '#E8572A', marginBottom: 8 }}>2. Access Requirements</div>
              <div style={{ fontSize: 13, fontFamily: "'Nunito'", fontWeight: 600, color: '#3D2B1F', lineHeight: 1.6 }}>
                Use of RoadMate is reserved for individuals aged 18 or over. Registration by minors is strictly prohibited. By creating an account, you declare that you are 18 or older and accept these terms in full.
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: 20, padding: 18, border: '3px solid #3D2B1F', boxShadow: '4px 4px 0 #3D2B1F', marginBottom: 14 }}>
              <div style={{ fontSize: 16, fontFamily: "'Fredoka One'", color: '#E8572A', marginBottom: 8 }}>3. Account Creation</div>
              <div style={{ fontSize: 13, fontFamily: "'Nunito'", fontWeight: 600, color: '#3D2B1F', lineHeight: 1.6 }}>
                When creating your account, you agree to provide accurate information and keep it up to date. You are solely responsible for the confidentiality of your credentials and any activity under your account. Creating multiple accounts or using another person's identity is prohibited.
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: 20, padding: 18, border: '3px solid #3D2B1F', boxShadow: '4px 4px 0 #3D2B1F', marginBottom: 14 }}>
              <div style={{ fontSize: 16, fontFamily: "'Fredoka One'", color: '#E8572A', marginBottom: 8 }}>4. Use of the Service</div>
              <div style={{ fontSize: 13, fontFamily: "'Nunito'", fontWeight: 600, color: '#3D2B1F', lineHeight: 1.6 }}>
                RoadMate is intended exclusively for connecting drivers and passengers for ride sharing. Any commercial or professional use is prohibited. As a driver, you agree to hold a valid driver's licence, have valid vehicle insurance, only post rides you intend to complete, inform passengers of any changes or cancellations, and drive responsibly. As a passenger, you agree to behave respectfully towards the driver and vehicle, inform the driver if you cannot make the trip, and respect agreed times and meeting points.
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: 20, padding: 18, border: '3px solid #3D2B1F', boxShadow: '4px 4px 0 #3D2B1F', marginBottom: 14 }}>
              <div style={{ fontSize: 16, fontFamily: "'Fredoka One'", color: '#E8572A', marginBottom: 8 }}>5. Payments and Cost Sharing</div>
              <div style={{ fontSize: 13, fontFamily: "'Nunito'", fontWeight: 600, color: '#3D2B1F', lineHeight: 1.6 }}>
                The price displayed per seat represents a contribution to travel costs (fuel, tolls, etc.). Drivers agree not to make a profit through the platform. RoadMate does not intervene in financial transactions between users. Payments are direct arrangements between drivers and passengers. We strongly recommend paying in cash upon meeting to avoid scams. RoadMate accepts no responsibility for financial disputes between users.
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: 20, padding: 18, border: '3px solid #3D2B1F', boxShadow: '4px 4px 0 #3D2B1F', marginBottom: 14 }}>
              <div style={{ fontSize: 16, fontFamily: "'Fredoka One'", color: '#E8572A', marginBottom: 8 }}>6. Liability and Limitations</div>
              <div style={{ fontSize: 13, fontFamily: "'Nunito'", fontWeight: 600, color: '#3D2B1F', lineHeight: 1.6 }}>
                RoadMate cannot be held liable for accidents, injuries, delays or damages occurring during a ride, user behaviour before, during or after a ride, inaccurate information provided by users, cancellation or modification of a ride, or financial losses resulting from transactions between users. Each user is solely responsible for their actions and interactions on the platform.
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: 20, padding: 18, border: '3px solid #3D2B1F', boxShadow: '4px 4px 0 #3D2B1F', marginBottom: 14 }}>
              <div style={{ fontSize: 16, fontFamily: "'Fredoka One'", color: '#E8572A', marginBottom: 8 }}>7. User Conduct</div>
              <div style={{ fontSize: 13, fontFamily: "'Nunito'", fontWeight: 600, color: '#3D2B1F', lineHeight: 1.6 }}>
                It is strictly prohibited to post false or misleading information, harass, threaten or intimidate other users, use the platform for fraudulent or illegal purposes, attempt to bypass the matching system, or post offensive, discriminatory or illegal content. Any breach may result in immediate account suspension or deletion.
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: 20, padding: 18, border: '3px solid #3D2B1F', boxShadow: '4px 4px 0 #3D2B1F', marginBottom: 14 }}>
              <div style={{ fontSize: 16, fontFamily: "'Fredoka One'", color: '#E8572A', marginBottom: 8 }}>8. Personal Data and Privacy</div>
              <div style={{ fontSize: 13, fontFamily: "'Nunito'", fontWeight: 600, color: '#3D2B1F', lineHeight: 1.6 }}>
                RoadMate collects only the data necessary for the service to function: email, first name, nationality, profile photo, messages and push notification tokens. Your data is stored securely via Supabase and is never sold to third parties. Your rights: access to your data, rectification, erasure (right to be forgotten), portability, and objection to processing. To exercise these rights: beaudeau_mickael@live.fr
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: 20, padding: 18, border: '3px solid #3D2B1F', boxShadow: '4px 4px 0 #3D2B1F', marginBottom: 14 }}>
              <div style={{ fontSize: 16, fontFamily: "'Fredoka One'", color: '#E8572A', marginBottom: 8 }}>9. Data Retention and Deletion</div>
              <div style={{ fontSize: 13, fontFamily: "'Nunito'", fontWeight: 600, color: '#3D2B1F', lineHeight: 1.6 }}>
                Your data is retained for as long as your account is active. You may request account deletion at any time by contacting beaudeau_mickael@live.fr. Your personal data will be deleted within 30 days of the request.
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: 20, padding: 18, border: '3px solid #3D2B1F', boxShadow: '4px 4px 0 #3D2B1F', marginBottom: 14 }}>
              <div style={{ fontSize: 16, fontFamily: "'Fredoka One'", color: '#E8572A', marginBottom: 8 }}>10. Security</div>
              <div style={{ fontSize: 13, fontFamily: "'Nunito'", fontWeight: 600, color: '#3D2B1F', lineHeight: 1.6 }}>
                RoadMate implements technical security measures to protect your data against unauthorised access, including data encryption and access security via Row Level Security (RLS) on Supabase.
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: 20, padding: 18, border: '3px solid #3D2B1F', boxShadow: '4px 4px 0 #3D2B1F', marginBottom: 14 }}>
              <div style={{ fontSize: 16, fontFamily: "'Fredoka One'", color: '#E8572A', marginBottom: 8 }}>11. Reporting and Moderation</div>
              <div style={{ fontSize: 13, fontFamily: "'Nunito'", fontWeight: 600, color: '#3D2B1F', lineHeight: 1.6 }}>
                Any user can report inappropriate behaviour using the reporting feature built into the app. RoadMate reserves the right to suspend or delete any account that violates these terms, without notice.
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: 20, padding: 18, border: '3px solid #3D2B1F', boxShadow: '4px 4px 0 #3D2B1F', marginBottom: 14 }}>
              <div style={{ fontSize: 16, fontFamily: "'Fredoka One'", color: '#E8572A', marginBottom: 8 }}>12. Intellectual Property</div>
              <div style={{ fontSize: 13, fontFamily: "'Nunito'", fontWeight: 600, color: '#3D2B1F', lineHeight: 1.6 }}>
                All RoadMate content (logo, design, code, text) is the exclusive property of Mickael Beaudeau and is protected by intellectual property laws. Any reproduction without authorisation is prohibited.
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: 20, padding: 18, border: '3px solid #3D2B1F', boxShadow: '4px 4px 0 #3D2B1F', marginBottom: 14 }}>
              <div style={{ fontSize: 16, fontFamily: "'Fredoka One'", color: '#E8572A', marginBottom: 8 }}>13. Applicable Law</div>
              <div style={{ fontSize: 13, fontFamily: "'Nunito'", fontWeight: 600, color: '#3D2B1F', lineHeight: 1.6 }}>
                These terms are governed by French law for European users and by Australian law for users in Australia. Any dispute will be submitted to the competent courts.
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: 20, padding: 18, border: '3px solid #3D2B1F', boxShadow: '4px 4px 0 #3D2B1F', marginBottom: 14 }}>
              <div style={{ fontSize: 16, fontFamily: "'Fredoka One'", color: '#E8572A', marginBottom: 8 }}>14. Contact</div>
              <div style={{ fontSize: 13, fontFamily: "'Nunito'", fontWeight: 600, color: '#3D2B1F', lineHeight: 1.6 }}>
                For any questions: beaudeau_mickael@live.fr — Instagram: @all_in_mika
              </div>
            </div>

            <div style={{ fontSize: 11, fontFamily: "'Nunito'", fontWeight: 700, color: '#B5967A', textAlign: 'center', marginTop: 8 }}>
              Last updated: April 2026
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function ResetPassword() {
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [done, setDone] = useState(false)

  const handleReset = async () => {
    if (!newPassword.trim() || newPassword.length < 8) {
      setMessage('Minimum 8 caractères !')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (!error) {
      setDone(true)
      setMessage('Mot de passe mis à jour ! ✅')
      setTimeout(() => { window.location.href = '/' }, 2000)
    } else {
      setMessage(error.message)
    }
    setLoading(false)
  }

  return (
    <div style={{ fontFamily: "'Fredoka One', cursive", background: 'linear-gradient(170deg, #E8572A 0%, #C4622D 50%, #8B3A0F 100%)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&family=Kalam:wght@700&display=swap" rel="stylesheet" />
      <div style={{ fontSize: 48, fontFamily: "'Fredoka One'", color: '#fff', marginBottom: 8 }}>
        Road<span style={{ color: '#F5A623' }}>Mate</span>
      </div>
      <div style={{ fontSize: 16, fontFamily: "'Kalam', cursive", color: 'rgba(255,255,255,0.85)', marginBottom: 40 }}>
        Nouveau mot de passe 🔒
      </div>
      <div style={{ background: '#F5EDD9', borderRadius: 24, padding: 28, width: '100%', maxWidth: 400, border: '3px solid #3D2B1F', boxShadow: '6px 6px 0 #3D2B1F' }}>
        <div style={{ fontSize: 20, fontFamily: "'Fredoka One'", color: '#3D2B1F', marginBottom: 20, textAlign: 'center' }}>
          Choisis un nouveau mot de passe
        </div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontFamily: "'Nunito'", fontWeight: 800, color: '#7B5C42', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>🔒 Nouveau mot de passe</div>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Min. 8 caractères"
              style={{ width: '100%', padding: '13px 48px 13px 16px', borderRadius: 14, border: '3px solid #EDE0CC', background: '#fff', fontSize: 15, fontFamily: "'Nunito'", fontWeight: 600, color: '#3D2B1F', boxSizing: 'border-box' }}
            />
            <button onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
        </div>
        {message && (
          <div style={{ padding: '12px 16px', borderRadius: 12, background: done ? '#E8F8EF' : '#FFF0EE', border: done ? '2px solid #4CAF7D' : '2px solid #E8572A', marginBottom: 16, fontSize: 13, fontFamily: "'Nunito'", fontWeight: 700, color: '#3D2B1F' }}>
            {message}
          </div>
        )}
        <button onClick={handleReset} disabled={loading || done}
          style={{ width: '100%', padding: '16px', borderRadius: 16, border: '3px solid #3D2B1F', cursor: 'pointer', background: '#E8572A', color: '#fff', fontSize: 18, fontFamily: "'Fredoka One'", boxShadow: '5px 5px 0 #3D2B1F' }}>
          {loading ? 'Sauvegarde...' : 'Valider 🤙'}
        </button>
      </div>
    </div>
  )
}

function Onboarding({ user, onDone }) {
  const lang = navigator.language?.startsWith('fr') ? 'fr' : 'en'
  const [name, setName] = useState('')
  const [nationality, setNationality] = useState('')
  const [saving, setSaving] = useState(false)
  const [showCGU, setShowCGU] = useState(false)

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    await supabase.from('profiles').upsert({ id: user.id, name: name.trim(), nationality })
    setSaving(false)
    onDone()
  }

  if (showCGU) return <CGU onBack={() => setShowCGU(false)} lang={lang} />

  return (
    <div style={{ fontFamily: "'Fredoka One', cursive", background: 'linear-gradient(170deg, #E8572A 0%, #C4622D 50%, #8B3A0F 100%)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&family=Kalam:wght@700&display=swap" rel="stylesheet" />
      <div style={{ fontSize: 48, fontFamily: "'Fredoka One'", color: '#fff', marginBottom: 8 }}>
        Road<span style={{ color: '#F5A623' }}>Mate</span>
      </div>
      <div style={{ fontSize: 16, fontFamily: "'Kalam', cursive", color: 'rgba(255,255,255,0.85)', marginBottom: 40 }}>
        {lang === 'fr' ? 'Avant de commencer... 🤙' : 'Before we start... 🤙'}
      </div>
      <div style={{ background: '#F5EDD9', borderRadius: 24, padding: 28, width: '100%', maxWidth: 400, border: '3px solid #3D2B1F', boxShadow: '6px 6px 0 #3D2B1F' }}>
        <div style={{ fontSize: 20, fontFamily: "'Fredoka One'", color: '#3D2B1F', marginBottom: 20, textAlign: 'center' }}>
          {lang === 'fr' ? "Comment tu t'appelles ? 👋" : "What's your name? 👋"}
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontFamily: "'Nunito'", fontWeight: 800, color: '#7B5C42', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>
            📝 {lang === 'fr' ? 'Prénom' : 'First name'}
          </div>
          <input value={name} onChange={e => setName(e.target.value)}
            placeholder={lang === 'fr' ? 'Ton prénom' : 'Your name'}
            style={{ width: '100%', padding: '13px 16px', borderRadius: 14, border: '3px solid #EDE0CC', background: '#fff', fontSize: 15, fontFamily: "'Nunito'", fontWeight: 600, color: '#3D2B1F', boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontFamily: "'Nunito'", fontWeight: 800, color: '#7B5C42', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>
            🌍 {lang === 'fr' ? 'Nationalité' : 'Nationality'}
          </div>
          <input value={nationality} onChange={e => setNationality(e.target.value)}
            placeholder={lang === 'fr' ? 'Ex: Française, Belge...' : 'Ex: Australian, British...'}
            style={{ width: '100%', padding: '13px 16px', borderRadius: 14, border: '3px solid #EDE0CC', background: '#fff', fontSize: 15, fontFamily: "'Nunito'", fontWeight: 600, color: '#3D2B1F', boxSizing: 'border-box' }} />
        </div>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <button onClick={() => setShowCGU(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontFamily: "'Nunito'", fontWeight: 800, color: '#E8572A', textDecoration: 'underline' }}>
            {lang === 'fr' ? "Lire les conditions d'utilisation" : 'Read terms of service'}
          </button>
        </div>
        <button onClick={handleSave} disabled={saving || !name.trim()}
          style={{ width: '100%', padding: '16px', borderRadius: 16, border: '3px solid #3D2B1F', cursor: name.trim() ? 'pointer' : 'not-allowed', background: name.trim() ? '#E8572A' : '#EDE0CC', color: '#fff', fontSize: 18, fontFamily: "'Fredoka One'", boxShadow: name.trim() ? '5px 5px 0 #3D2B1F' : 'none' }}>
          {saving ? (lang === 'fr' ? 'Sauvegarde...' : 'Saving...') : (lang === 'fr' ? "C'est parti 🦘" : "Let's go 🦘")}
        </button>
      </div>
    </div>
  )
}

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [hasProfile, setHasProfile] = useState(true)
  const [isRecovery, setIsRecovery] = useState(false)
  const [showCGU, setShowCGU] = useState(false)

  const lang = navigator.language?.startsWith('fr') ? 'fr' : 'en'

  useEffect(() => {
    const hash = window.location.hash
    if (hash.includes('type=recovery')) {
      setIsRecovery(true)
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setTimeout(() => setLoading(false), 500)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
        setUser(session?.user ?? null)
      }
      if (event === 'SIGNED_OUT') {
        setUser(null)
        setIsRecovery(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (user && !isRecovery) {
      registerPush(user.id)
      checkProfile(user.id)
    }
  }, [user?.id, isRecovery])

  const checkProfile = async (userId) => {
    const { data } = await supabase.from('profiles').select('name').eq('id', userId).single()
    setHasProfile(!!(data?.name))
  }

  const registerPush = async (userId) => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
    try {
      const reg = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') return
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      })
      await supabase.from('push_subscriptions').upsert({
        user_id: userId,
        subscription: JSON.stringify(sub)
      }, { onConflict: 'user_id' })
    } catch (e) {
      console.log('Erreur push:', e)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#E8572A' }}>
      <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Kalam:wght@700&display=swap" rel="stylesheet" />
      <div style={{ fontSize: 72, fontFamily: "'Fredoka One'", color: '#fff', lineHeight: 1 }}>Road</div>
      <div style={{ fontSize: 72, fontFamily: "'Fredoka One'", color: '#F5A623', lineHeight: 1 }}>Mate</div>
      <div style={{ fontSize: 16, fontFamily: "'Kalam', cursive", color: '#fff', marginTop: 12 }}>
        {lang === 'fr' ? "Le co-voit' des backpackers 🤙" : "The backpackers' rideshare 🤙"}
      </div>
    </div>
  )

  if (showCGU) return <CGU onBack={() => setShowCGU(false)} lang={lang} />
  if (isRecovery) return <ResetPassword />
  if (!user) return <Auth />
  if (!hasProfile) return <Onboarding user={user} onDone={() => setHasProfile(true)} />
  return <Home user={user} onSignOut={handleSignOut} showCGU={() => setShowCGU(true)} />
}