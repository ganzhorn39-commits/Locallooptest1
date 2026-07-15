import React, { createContext, useContext, useEffect, useState } from "react";
import { storage } from "@/src/utils/storage";

export type Lang = "en" | "de";
const LANG_KEY = "localloop_lang";

const DICT: Record<Lang, Record<string, string>> = {
  en: {
    // tabs
    tab_map: "Map", tab_explore: "Explore", tab_create: "Create", tab_chats: "Chats", tab_profile: "Profile",
    // categories
    cat_all: "All", cat_nightlife: "Nightlife", cat_food: "Food", cat_sports: "Sports", cat_culture: "Culture",
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
  },
  de: {
    tab_map: "Karte", tab_explore: "Entdecken", tab_create: "Erstellen", tab_chats: "Chats", tab_profile: "Profil",
    cat_all: "Alle", cat_nightlife: "Nachtleben", cat_food: "Essen", cat_sports: "Sport", cat_culture: "Kultur",
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
