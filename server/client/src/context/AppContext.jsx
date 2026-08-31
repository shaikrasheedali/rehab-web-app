import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { en } from '../i18n/en.js';
import { te } from '../i18n/te.js';
import { hi } from '../i18n/hi.js';
import * as api from '../services/api.js';

const I18N_MAP = { en, te, hi };

export const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

export function AppProvider({ children }) {
  // Navigation & Routing (Hash based for SPA stability across dev/prod)
  const [route, setRoute] = useState(() => window.location.hash.slice(1) || '/');

  // Accessibility & Preferences
  const [lang, setLang] = useState(() => localStorage.getItem('st-lang') || 'en');
  const [theme, setTheme] = useState(() => localStorage.getItem('st-theme') || 'light');
  const [largeText, setLargeText] = useState(() => localStorage.getItem('st-large-text') === 'true');

  // Care Basket
  const [basket, setBasket] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('st-care-basket')) || [];
    } catch {
      return [];
    }
  });

  // UI Modals & Popups
  const [toast, setToast] = useState(null);
  const [commandOpen, setCommandOpen] = useState(false);
  const [admissionDraft, setAdmissionDraft] = useState(null);

  // Core Data Cache
  const [services, setServices] = useState([]);
  const [packages, setPackages] = useState([]);
  const [mediaItems, setMediaItems] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [admissions, setAdmissions] = useState([]);
  const [accommodations, setAccommodations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  // Translation helper
  const t = useCallback((key) => {
    const dict = I18N_MAP[lang] || I18N_MAP.en;
    return dict[key] || I18N_MAP.en[key] || key;
  }, [lang]);

  // Toast notification helper
  const notify = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // Navigation action
  const nav = useCallback((path) => {
    window.location.hash = path;
    setRoute(path);
    requestAnimationFrame(() => {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    });
  }, []);

  // Sync Preferences to DOM & LocalStorage
  useEffect(() => {
    localStorage.setItem('st-lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('st-theme', theme);
    localStorage.setItem('st-large-text', String(largeText));
    document.body.className = (theme === 'light' ? '' : theme) + (largeText ? ' large-text' : '');
  }, [theme, largeText]);

  useEffect(() => {
    localStorage.setItem('st-care-basket', JSON.stringify(basket));
  }, [basket]);

  // Window hash change and keyboard listeners
  useEffect(() => {
    const onHashChange = () => {
      setRoute(window.location.hash.slice(1) || '/');
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      });
    };
    const onKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandOpen(open => !open);
      }
      if (e.key === 'Escape') {
        setCommandOpen(false);
      }
    };

    window.addEventListener('hashchange', onHashChange);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('hashchange', onHashChange);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  // Fetch functions from backend
  const fetchServices = useCallback(async () => {
    try {
      const data = await api.getServices();
      setServices(data || []);
    } catch (err) {
      console.error('Failed to fetch services:', err);
    }
  }, []);

  const fetchPackages = useCallback(async () => {
    try {
      const data = await api.getPackages();
      setPackages(data || []);
    } catch (err) {
      console.error('Failed to fetch packages:', err);
    }
  }, []);

  const fetchMedia = useCallback(async () => {
    try {
      const data = await api.getMediaItems();
      setMediaItems(data || []);
    } catch (err) {
      console.error('Failed to fetch media:', err);
    }
  }, []);

  const fetchInquiries = useCallback(async () => {
    try {
      const data = await api.getInquiries();
      setInquiries(data || []);
    } catch (err) {
      console.error('Failed to fetch inquiries:', err);
    }
  }, []);

  const fetchAdmissions = useCallback(async () => {
    try {
      const data = await api.getAdmissions();
      setAdmissions(data || []);
    } catch (err) {
      console.error('Failed to fetch admissions:', err);
    }
  }, []);

  const fetchAccommodations = useCallback(async () => {
    try {
      const data = await api.getAccommodations();
      setAccommodations(data || []);
    } catch (err) {
      console.error('Failed to fetch accommodations:', err);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    await Promise.allSettled([
      fetchServices(),
      fetchPackages(),
      fetchMedia(),
      fetchInquiries(),
      fetchAdmissions(),
      fetchAccommodations(),
      fetchStats()
    ]);
    setLoading(false);
  }, [
    fetchServices,
    fetchPackages,
    fetchMedia,
    fetchInquiries,
    fetchAdmissions,
    fetchAccommodations,
    fetchStats
  ]);

  // Initial Load
  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Basket helper
  const addItem = useCallback((item) => {
    setBasket((prev) => {
      if (prev.some(x => x.id === item.id)) return prev;
      return [...prev, { ...item, duration: '30 days' }];
    });
    notify(`${item.title} added to your care basket`);
    try {
      confetti({
        particleCount: 35,
        spread: 55,
        origin: { x: 0.86, y: 0.2 },
        colors: ['#0f5d5e', '#e96f51', '#bdd6c9']
      });
    } catch {
      // safe fallback
    }
  }, [notify]);

  // Inquiry Conversion
  const beginAdmission = useCallback((inquiry) => {
    const start = inquiry?.start || new Date().toISOString().slice(0, 10);
    const durationDays =
      inquiry?.duration === '14 days'
        ? 14
        : inquiry?.duration === '60–90 days' || inquiry?.duration === 'Ongoing care'
        ? 90
        : 30;
    const discharge = new Date(`${start}T00:00:00Z`);
    discharge.setUTCDate(discharge.getUTCDate() + durationDays - 1);

    setAdmissionDraft(
      inquiry
        ? {
            patient: inquiry.patient,
            contact: inquiry.contact,
            phone: inquiry.phone || '',
            need: inquiry.need,
            admissionDate: start,
            expectedDischarge: discharge.toISOString().slice(0, 10),
            language: inquiry.language || 'English',
            currentLocation: inquiry.currentLocation || 'At home',
            roomPreference: inquiry.room || 'No preference',
            packageId: inquiry.packageId || '',
            offPackageServiceIds: inquiry.offPackageServiceIds || [],
            sourceInquiryId: inquiry.id
          }
        : {}
    );
    nav('/admin/admissions');
  }, [nav]);

  const value = {
    route,
    nav,
    lang,
    setLang,
    theme,
    setTheme,
    largeText,
    setLargeText,
    basket,
    setBasket,
    addItem,
    toast,
    setToast,
    notify,
    commandOpen,
    setCommandOpen,
    admissionDraft,
    setAdmissionDraft,
    beginAdmission,
    t,
    // Data & Fetchers
    services,
    setServices,
    packages,
    setPackages,
    mediaItems,
    setMediaItems,
    inquiries,
    setInquiries,
    admissions,
    setAdmissions,
    accommodations,
    setAccommodations,
    stats,
    loading,
    refreshAll,
    fetchServices,
    fetchPackages,
    fetchMedia,
    fetchInquiries,
    fetchAdmissions,
    fetchAccommodations,
    fetchStats
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
