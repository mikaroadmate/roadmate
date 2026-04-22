export const translations = {
  fr: {
    // Home
    tagline: "Le co-voit' des backpackers !",
    search_placeholder: "Ou tu vas ?",
    filter_all: "Tous",
    filter_offer: "🚗 Offre",
    filter_seek: "🙋 Cherche",
    no_rides: "Aucun trajet",
    no_rides_sub: "Sois le premier a poster ! 🤙",
    no_rides_search: "Essaie une autre ville !",
    loading: "Chargement... 🚐",
    contact: "Contacter 🤙",
    logout: "Deco 👋",
    women_only_filter: "👩 Femmes only",

    // Categories
    cat_all: "Tous",
    cat_travel: "Voyage",
    cat_work: "Travail",
    cat_daytrip: "Excursion",
    cat_roadtrip: "Road Trip",

    // PostRide
    post_type: "Je suis...",
    post_offer: "🚗 J'offre un trajet",
    post_seek: "🙋 Je cherche un trajet",
    post_category: "Catégorie",
    post_from: "📍 Départ",
    post_to: "🏁 Destination",
    post_date: "📅 Date",
    post_time: "⏰ Heure",
    post_seats: "💺 Places",
    post_price: "💰 Prix $ / siège",
    post_note: "📝 Note (optionnel)",
    post_women: "👩 Réservé aux femmes ?",
    post_women_yes: "👩 Oui, femmes uniquement ✓",
    post_women_no: "👥 Non, tout le monde",
    post_preview: "Aperçu",
    post_publish: "Publier 🚀",
    post_next: "Suivant →",
    post_back: "← Retour",
    post_step: "Étape",
    post_of: "sur",
    post_error: "Erreur lors de la publication. Réessaie !",
    post_city_placeholder: "Ville ou région",
    post_note_placeholder: "Bonne musique, chien ok, no smoke... 🎵",
    post_found: "📍 Position trouvée ✓",

    // Messages
    messages_title: "Messages 💬",
    messages_sub: "tes conversations",
    messages_empty: "Aucun message",
    messages_empty_sub: "Contacte quelqu'un depuis un trajet ! 🤙",
    messages_placeholder: "Tape un message...",
    messages_home: "Home",
    messages_start: "Commence la conversation ! 🤙",

    // Profile
    profile_edit: "Modifier",
    profile_save: "Sauvegarder",
    profile_traveler: "INFOS VOYAGEUR",
    profile_nationality: "NATIONALITE",
    profile_visa: "VISA",
    profile_bio: "BIO",
    profile_whatsapp: "WHATSAPP",
    profile_instagram: "INSTAGRAM",
    profile_vehicle: "VEHICULE",
    profile_brand: "MARQUE",
    profile_model: "MODELE",
    profile_color: "COULEUR",
    profile_verified: "✅ Profil vérifié",
    profile_not_verified: "⏳ En attente de vérification",

    // Map
    map_title: "Carte 🗺️",
  },

  en: {
    // Home
    tagline: "The backpackers' rideshare !",
    search_placeholder: "Where are you going?",
    filter_all: "All",
    filter_offer: "🚗 Offering",
    filter_seek: "🙋 Looking",
    no_rides: "No rides",
    no_rides_sub: "Be the first to post! 🤙",
    no_rides_search: "Try another city!",
    loading: "Loading... 🚐",
    contact: "Contact 🤙",
    logout: "Logout 👋",
    women_only_filter: "👩 Women only",

    // Categories
    cat_all: "All",
    cat_travel: "Travel",
    cat_work: "Work",
    cat_daytrip: "Day Trip",
    cat_roadtrip: "Road Trip",

    // PostRide
    post_type: "I am...",
    post_offer: "🚗 Offering a ride",
    post_seek: "🙋 Looking for a ride",
    post_category: "Category",
    post_from: "📍 Departure",
    post_to: "🏁 Destination",
    post_date: "📅 Date",
    post_time: "⏰ Time",
    post_seats: "💺 Seats",
    post_price: "💰 Price $ / seat",
    post_note: "📝 Note (optional)",
    post_women: "👩 Women only?",
    post_women_yes: "👩 Yes, women only ✓",
    post_women_no: "👥 No, everyone welcome",
    post_preview: "Preview",
    post_publish: "Publish 🚀",
    post_next: "Next →",
    post_back: "← Back",
    post_step: "Step",
    post_of: "of",
    post_error: "Error publishing. Try again!",
    post_city_placeholder: "City or region",
    post_note_placeholder: "Good music, dog ok, no smoke... 🎵",
    post_found: "📍 Location found ✓",

    // Messages
    messages_title: "Messages 💬",
    messages_sub: "your conversations",
    messages_empty: "No messages",
    messages_empty_sub: "Contact someone from a ride! 🤙",
    messages_placeholder: "Type a message...",
    messages_home: "Home",
    messages_start: "Start the conversation! 🤙",

    // Profile
    profile_edit: "Edit",
    profile_save: "Save",
    profile_traveler: "TRAVELER INFO",
    profile_nationality: "NATIONALITY",
    profile_visa: "VISA",
    profile_bio: "BIO",
    profile_whatsapp: "WHATSAPP",
    profile_instagram: "INSTAGRAM",
    profile_vehicle: "VEHICLE",
    profile_brand: "BRAND",
    profile_model: "MODEL",
    profile_color: "COLOR",
    profile_verified: "✅ Verified profile",
    profile_not_verified: "⏳ Pending verification",

    // Map
    map_title: "Map 🗺️",
  }
}

export function detectLanguage() {
  const saved = localStorage.getItem('roadmate_lang')
  if (saved) return saved
  const browserLang = navigator.language?.slice(0, 2)
  return browserLang === 'fr' ? 'fr' : 'en'
}

export function setLanguage(lang) {
  localStorage.setItem('roadmate_lang', lang)
}