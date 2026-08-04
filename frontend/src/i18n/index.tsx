import React, { createContext, useContext, useEffect, useState } from "react";
import { storage } from "@/src/utils/storage";

export type Lang = "en" | "de";
const LANG_KEY = "localloop_lang";

const DICT: Record<Lang, Record<string, string>> = {
  en: {
    // tabs
    tab_map: "Map", tab_explore: "Explore", tab_create: "Create", tab_chats: "Chats", tab_profile: "Profile",
    // categories
    cat_all: "All", cat_sports: "Sports & Fitness", cat_nightlife: "Nightlife & Clubs", cat_rooftop: "Rooftop & Bar",
    cat_food: "Food & Culinary", cat_arts: "Arts & Culture", cat_networking: "Networking", cat_gaming: "Gaming & E-Sports",
    cat_outdoor: "Outdoor & Nature", cat_workshops: "Workshops", cat_music: "Music & Concerts",
    // quick filters
    quick_today: "Today", quick_free: "Free Entry", quick_outdoor: "Outdoor", quick_near: "Near Me",
    // search
    search_placeholder: "Search events, categories, cities...",
    // welcome
    slogan: "The city's pulse. Live on your map.",
    google: "Continue with Google", facebook: "Continue with Facebook", email: "Sign up with Email",
    business: "For Organizers: Business Login", demo: "Explore as demo",
    soon: "Coming soon — Google login works now 🎉",
    // profile
    my_profile: "My Profile", display_name: "Display Name", bio: "Bio", instagram: "Instagram",
    save_profile: "Save Profile", saved: "Saved ✓",
    // settings
    settings: "Settings", language: "Language", german: "Deutsch", english: "English",
    notifications: "Notifications", notif_events: "New event alerts", notif_messages: "New message alerts",
    location_services: "Location Services", gps_tracking: "GPS location tracking",
    legal: "Legal", terms: "Terms of Service", privacy: "Privacy Policy", logout: "Log Out",
    terms_body: "By using LocalLoop you agree to discover and share local events responsibly. This is a demo build; no warranties are provided.",
    privacy_body: "LocalLoop stores your profile, check-ins and messages to power the map and chats. Your location is used only to center the map and is never shared without consent.",
    // onboarding
    onb_choose_role: "How will you use LocalLoop?", role_visitor: "I'm a Visitor", role_visitor_desc: "Discover events & meet people",
    role_business: "Organizer / Business", role_business_desc: "List your venue & host events",
    onb_your_profile: "Your Profile", onb_business_profile: "Business Profile",
    onb_birthdate: "Birthdate", onb_birthdate_hint: "Select your date of birth", years_old: "years old",
    onb_age_error: "You must be at least 16 to use LocalLoop.", onb_name_error: "Please enter your name.",
    onb_biz_error: "Business name is required.", onb_continue: "Continue", onb_finish: "Finish Setup",
    biz_name: "Business Name", biz_category: "Category", biz_address: "Address", biz_website: "Website", biz_instagram: "Instagram",
    // reviews
    verified: "Verified", reviews: "reviews", reviews_title: "Reviews", rate_venue: "Rate this venue",
    your_rating: "Your rating", write_review: "Share your experience (optional)", submit_review: "Submit Review",
    no_reviews: "No reviews yet — be the first!", review_need_checkin: "Check in to leave a review", review_thanks: "Thanks for your review! 🌟",
    age_restricted_note: "18+ events are hidden based on your age",
    // rsvp privacy + capacity + phase 3
    rsvp_title: "How do you want to attend?",
    rsvp_public: "Public", rsvp_public_desc: "Name & avatar visible to everyone",
    rsvp_friends: "Friends Only", rsvp_friends_desc: "Only your contacts can see you",
    rsvp_anon: "Anonymous", rsvp_anon_desc: "Hidden from the attendee list",
    event_full: "Event is full", sold_out: "Sold Out", spots_free: "spots left", spots_taken_label: "taken",
    reservation_link: "Reservation Link", reserve: "Reserve a Table", capacity_label: "Max Capacity (optional)",
    radius: "Radius", radius_all: "All", at_venue: "At Venue", live_badge: "Live",
    date_any: "Any date", pick_dates: "Dates", clear: "Clear", apply: "Apply",
    // explore
    explore_title: "Explore", no_match: "No events match your filters.",
    // create
    host_event: "Host an Event", event_banner: "Event Banner", upload_banner: "Upload banner image", change_banner: "Change banner",
    event_title: "Event Title", category: "Category", date: "Date", time: "Time",
    recurring_q: "Recurring Event?", repeat_this: "Repeat this event · Wiederkehrend?",
    freq_weekly: "Every week", freq_biweekly: "Every two weeks", freq_monthly: "Every month",
    location: "Location", venue_ph: "Venue name / address (optional)", description: "Description", whats_happening: "What's happening?",
    ig_handle: "Instagram Handle", website: "Website / Homepage", ticket_link: "Ticket Link", publish: "Publish Event",
    title_required: "Event title is required", create_failed: "Could not create event. Please try again.",
    // event sheet
    going: "You're going!", checkin_cta: "I'm going / Check in", heading_now: "heading here now", checked_in: "checked in",
    buy_tickets: "Buy Tickets", moments: "Moments · disappear in 24h", attendees: "Attendees",
    open_chat: "Open Group Chat", unlock_chat: "Check in to unlock group chat",
    first_moment: "Be the first to post a moment", checkin_to_share: "Check in to share a moment",
    // chats
    chats_title: "Chats", event_chats: "Event Group Chats", your_crews: "Your Crews",
    checkin_unlock: "Check into an event to unlock its group chat.", new_crew_ph: "New crew name",
    join_code_ph: "Join with INVITE CODE", tap_to_chat: "tap to chat", attending: "attending",
    // chat room
    message_ph: "Message the crew...", say_hi: "Say hi to everyone heading here! 👋",
    // map
    surprise_me: "Surprise Me",
    // chat + crew
    chat_group: "Group Chat", crew_not_found: "Crew not found",
    invite_code_label: "INVITE CODE", invite: "Invite",
    member_one: "Member", member_other: "Members", guest: "Guest",
    crew_vote_title: "Where to tonight? · Vote 🗳️",
    no_suggestions: "No suggestions yet. Add the first idea below.",
    sug_map: "📍 Map event", sug_idea: "💬 Idea",
    vote_one: "vote", vote_other: "votes",
    suggest_map_event: "Suggest a map event", suggest_idea_ph: "Suggest an idea...",
    pick_event: "Pick an event",
  },
  de: {
    tab_map: "Karte", tab_explore: "Entdecken", tab_create: "Erstellen", tab_chats: "Chats", tab_profile: "Profil",
    cat_all: "Alle", cat_sports: "Sport & Fitness", cat_nightlife: "Nachtleben & Clubs", cat_rooftop: "Rooftop & Bar",
    cat_food: "Essen & Kulinarik", cat_arts: "Kunst & Kultur", cat_networking: "Networking", cat_gaming: "Gaming & E-Sport",
    cat_outdoor: "Natur & Outdoor", cat_workshops: "Workshops", cat_music: "Musik & Konzerte",
    quick_today: "Heute", quick_free: "Freier Eintritt", quick_outdoor: "Draußen", quick_near: "In der Nähe",
    search_placeholder: "Events, Kategorien, Städte suchen...",
    slogan: "Dein Stadtpuls. Live auf der Karte.",
    google: "Weiter mit Google", facebook: "Weiter mit Facebook", email: "Mit E-Mail registrieren",
    business: "Für Veranstalter: Business Login", demo: "Als Demo erkunden",
    soon: "Bald verfügbar — Google Login funktioniert jetzt 🎉",
    my_profile: "Mein Profil", display_name: "Anzeigename", bio: "Über mich", instagram: "Instagram",
    save_profile: "Profil speichern", saved: "Gespeichert ✓",
    settings: "Einstellungen", language: "Sprache", german: "Deutsch", english: "English",
    notifications: "Benachrichtigungen", notif_events: "Neue Event-Hinweise", notif_messages: "Neue Nachrichten-Hinweise",
    location_services: "Standortdienste", gps_tracking: "GPS-Standortverfolgung",
    legal: "Rechtliches", terms: "Nutzungsbedingungen", privacy: "Datenschutz", logout: "Abmelden",
    terms_body: "Mit der Nutzung von LocalLoop stimmst du zu, lokale Events verantwortungsvoll zu entdecken und zu teilen. Dies ist eine Demo-Version ohne Gewährleistung.",
    privacy_body: "LocalLoop speichert dein Profil, Check-ins und Nachrichten für Karte und Chats. Dein Standort wird nur zum Zentrieren der Karte genutzt und niemals ohne Zustimmung geteilt.",
    explore_title: "Entdecken", no_match: "Keine Events für deine Filter.",
    onb_choose_role: "Wie nutzt du LocalLoop?", role_visitor: "Ich bin Besucher", role_visitor_desc: "Events entdecken & Leute treffen",
    role_business: "Veranstalter / Business", role_business_desc: "Deine Location eintragen & Events hosten",
    onb_your_profile: "Dein Profil", onb_business_profile: "Business-Profil",
    onb_birthdate: "Geburtsdatum", onb_birthdate_hint: "Wähle dein Geburtsdatum", years_old: "Jahre alt",
    onb_age_error: "Du musst mindestens 16 sein, um LocalLoop zu nutzen.", onb_name_error: "Bitte gib deinen Namen ein.",
    onb_biz_error: "Business-Name ist erforderlich.", onb_continue: "Weiter", onb_finish: "Einrichtung abschließen",
    biz_name: "Business-Name", biz_category: "Kategorie", biz_address: "Adresse", biz_website: "Webseite", biz_instagram: "Instagram",
    verified: "Verifiziert", reviews: "Bewertungen", reviews_title: "Bewertungen", rate_venue: "Location bewerten",
    your_rating: "Deine Bewertung", write_review: "Teile deine Erfahrung (optional)", submit_review: "Bewertung senden",
    no_reviews: "Noch keine Bewertungen — sei der Erste!", review_need_checkin: "Check-in, um zu bewerten", review_thanks: "Danke für deine Bewertung! 🌟",
    age_restricted_note: "18+ Events sind je nach Alter ausgeblendet",
    rsvp_title: "Wie möchtest du teilnehmen?",
    rsvp_public: "Öffentlich", rsvp_public_desc: "Name & Avatar für alle sichtbar",
    rsvp_friends: "Nur Freunde", rsvp_friends_desc: "Nur deine Kontakte sehen dich",
    rsvp_anon: "Anonym", rsvp_anon_desc: "In der Teilnehmerliste verborgen",
    event_full: "Event ist voll", sold_out: "Ausverkauft", spots_free: "Plätze frei", spots_taken_label: "belegt",
    reservation_link: "Reservierungslink", reserve: "Tisch reservieren", capacity_label: "Max. Kapazität (optional)",
    radius: "Umkreis", radius_all: "Alle", at_venue: "Vor Ort", live_badge: "Live",
    date_any: "Beliebig", pick_dates: "Datum", clear: "Löschen", apply: "Anwenden",
    host_event: "Event veranstalten", event_banner: "Event-Banner", upload_banner: "Bannerbild hochladen", change_banner: "Banner ändern",
    event_title: "Event-Titel", category: "Kategorie", date: "Datum", time: "Uhrzeit",
    recurring_q: "Wiederkehrendes Event?", repeat_this: "Event wiederholen · Wiederkehrend?",
    freq_weekly: "Jede Woche", freq_biweekly: "Alle zwei Wochen", freq_monthly: "Jeden Monat",
    location: "Ort", venue_ph: "Veranstaltungsort / Adresse (optional)", description: "Beschreibung", whats_happening: "Was ist los?",
    ig_handle: "Instagram-Handle", website: "Webseite / Homepage", ticket_link: "Ticket-Link", publish: "Event veröffentlichen",
    title_required: "Event-Titel ist erforderlich", create_failed: "Event konnte nicht erstellt werden. Bitte erneut versuchen.",
    going: "Du bist dabei!", checkin_cta: "Ich bin dabei / Check-in", heading_now: "gerade auf dem Weg", checked_in: "eingecheckt",
    buy_tickets: "Tickets kaufen", moments: "Momente · verschwinden in 24h", attendees: "Teilnehmer",
    open_chat: "Gruppenchat öffnen", unlock_chat: "Check-in, um den Gruppenchat freizuschalten",
    first_moment: "Poste den ersten Moment", checkin_to_share: "Check-in, um einen Moment zu teilen",
    chats_title: "Chats", event_chats: "Event-Gruppenchats", your_crews: "Deine Crews",
    checkin_unlock: "Checke bei einem Event ein, um den Gruppenchat freizuschalten.", new_crew_ph: "Neuer Crew-Name",
    join_code_ph: "Mit EINLADUNGSCODE beitreten", tap_to_chat: "tippen zum Chatten", attending: "dabei",
    message_ph: "Nachricht an die Crew...", say_hi: "Sag allen Hallo, die herkommen! 👋",
    surprise_me: "Überrasch mich",
    chat_group: "Gruppenchat", crew_not_found: "Crew nicht gefunden",
    invite_code_label: "EINLADUNGSCODE", invite: "Einladen",
    member_one: "Mitglied", member_other: "Mitglieder", guest: "Gast",
    crew_vote_title: "Wohin heute Abend? · Abstimmen 🗳️",
    no_suggestions: "Noch keine Vorschläge. Füge unten die erste Idee hinzu.",
    sug_map: "📍 Karten-Event", sug_idea: "💬 Idee",
    vote_one: "Stimme", vote_other: "Stimmen",
    suggest_map_event: "Karten-Event vorschlagen", suggest_idea_ph: "Idee vorschlagen...",
    pick_event: "Event auswählen",
  },
};

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: string) => string };
const I18nCtx = createContext<Ctx>({ lang: "en", setLang: () => {}, t: (k) => k });

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  useEffect(() => {
    (async () => {
      const saved = await storage.getItem<string>(LANG_KEY, "");
      if (saved === "en" || saved === "de") setLangState(saved);
    })();
  }, []);
  const setLang = (l: Lang) => { setLangState(l); storage.setItem(LANG_KEY, l); };
  const t = (k: string) => DICT[lang][k] ?? DICT.en[k] ?? k;
  return <I18nCtx.Provider value={{ lang, setLang, t }}>{children}</I18nCtx.Provider>;
}

export const useI18n = () => useContext(I18nCtx);
