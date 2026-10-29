import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { RsvpForm } from './components/RsvpForm';
import { CoupleDashboard } from './components/CoupleDashboard';
import { TicketCardModal } from './components/TicketCardModal';
import { BrautpaarAuthModal } from './components/BrautpaarAuthModal';
import { Footer } from './components/Footer';
import { getRsvpEntries, subscribeToRsvpEntries } from './services/storage';
import { RsvpEntry } from './types';
import { ShieldCheck, Eye, LogOut, ArrowRight } from 'lucide-react';

export default function App() {
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [entries, setEntries] = useState<RsvpEntry[]>([]);
  const [isCardModalOpen, setIsCardModalOpen] = useState<boolean>(false);
  const [isCoupleAuthModalOpen, setIsCoupleAuthModalOpen] = useState<boolean>(false);
  const [isCoupleLoggedIn, setIsCoupleLoggedIn] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'guest' | 'couple'>('guest');

  const reloadEntries = () => {
    setEntries(getRsvpEntries());
  };

  useEffect(() => {
    // 1. Initial load & real-time cross-device Firestore subscription
    const unsubscribe = subscribeToRsvpEntries((liveEntries) => {
      setEntries(liveEntries);
    });

    // Check if the couple is already logged in on this browser
    const savedAuth = localStorage.getItem('brautpaar_authenticated') === 'true';
    setIsCoupleLoggedIn(savedAuth);

    // Check URL hash on load
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#brautpaar' || hash === '#admin') {
        if (savedAuth) {
          setViewMode('couple');
        } else {
          setIsCoupleAuthModalOpen(true);
        }
        return;
      }

      const targetId = window.location.hash.replace('#', '');
      const el = document.getElementById(targetId);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setActiveSection(targetId);
        }, 200);
      }
    }

    return () => {
      unsubscribe();
    };
  }, []);

  const handleNavigate = (sectionId: string) => {
    // If couple was in couple dashboard and clicks a guest tab, switch back to guest view smoothly
    if (viewMode === 'couple') {
      setViewMode('guest');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
    setActiveSection(sectionId);
  };

  const handleScrollToRsvp = () => {
    if (viewMode === 'couple') {
      setViewMode('guest');
    }
    setActiveSection('rsvp-form');
    setTimeout(() => {
      const el = document.getElementById('rsvp-form');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleAuthSuccess = () => {
    setIsCoupleLoggedIn(true);
    setIsCoupleAuthModalOpen(false);
    setViewMode('couple');
  };

  const handleLogout = () => {
    localStorage.removeItem('brautpaar_authenticated');
    setIsCoupleLoggedIn(false);
    setViewMode('guest');
  };

  return (
    <div className="min-h-screen bg-summer-canvas text-[#261c14] selection:bg-[#d7541d] selection:text-white flex flex-col font-sans">
      {/* Top Banner when Couple is logged in, allowing quick navigation between views */}
      {isCoupleLoggedIn && (
        <div className="bg-[#261c14] text-[#fffcf7] px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3 border-b border-[#eedcc8]/30">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <ShieldCheck className="w-4 h-4 text-[#df931d]" />
            <span className="font-semibold">Brautpaar-Modus (Katharina &amp; Ole)</span>
            <span className="hidden sm:inline text-white/60">
              · {entries.length} Rückmeldungen ({entries.filter(e => e.attending).reduce((sum, e) => sum + (e.guestCount || 0), 0)} Gäste zugesagt)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {viewMode === 'guest' ? (
              <button
                onClick={() => setViewMode('couple')}
                className="px-2.5 py-1 bg-[#d7541d] hover:bg-[#b84112] text-white rounded-lg font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
              >
                <span>Zur Brautpaar-Übersicht</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            ) : (
              <button
                onClick={() => setViewMode('guest')}
                className="px-2.5 py-1 bg-white/15 hover:bg-white/25 text-white rounded-lg font-medium text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Eye className="w-3 h-3 text-[#df931d]" />
                <span>Gäste-Dashboard ansehen</span>
              </button>
            )}

            <button
              onClick={handleLogout}
              className="px-2 py-1 text-white/60 hover:text-white text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
              title="Brautpaar-Bereich sperren"
            >
              <LogOut className="w-3 h-3" />
              <span className="hidden sm:inline">Abmelden</span>
            </button>
          </div>
        </div>
      )}

      {/* Top Navigation: Contains strictly the 3 tabs for guests */}
      <Navbar
        onNavigate={handleNavigate}
        activeSection={activeSection}
        onOpenCardModal={() => setIsCardModalOpen(true)}
        isCoupleLoggedIn={isCoupleLoggedIn}
        onOpenCoupleView={() => setViewMode('couple')}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {viewMode === 'couple' && isCoupleLoggedIn ? (
          /* BRAUTPAAR-PORTAL: Nur für Katharina & Ole sichtbar */
          <CoupleDashboard
            entries={entries}
            onRefresh={reloadEntries}
            onBackToGuestView={() => setViewMode('guest')}
            onLogout={handleLogout}
          />
        ) : (
          /* GÄSTE-DASHBOARD: Für alle Gäste & QR-Code-Scanner sichtbar */
          <>
            {/* Reiter 1 Ziel: Festival of Love Katharina und Ole */}
            <Hero
              onNavigateToRsvp={handleScrollToRsvp}
              onOpenCardModal={() => setIsCardModalOpen(true)}
            />

            {/* Reiter 2 & 3 Ziel: Rückmeldung & Jetzt Zusagen */}
            <RsvpForm onEntryAdded={reloadEntries} />
          </>
        )}
      </main>

      {/* Footer with subtle Brautpaar access */}
      <Footer
        onNavigate={handleNavigate}
        onOpenCardModal={() => setIsCardModalOpen(true)}
        isCoupleLoggedIn={isCoupleLoggedIn}
        onOpenCoupleAuth={() => setIsCoupleAuthModalOpen(true)}
        onOpenCoupleDashboard={() => setViewMode('couple')}
      />

      {/* PIN Authentication Modal for Couple */}
      <BrautpaarAuthModal
        isOpen={isCoupleAuthModalOpen}
        onClose={() => setIsCoupleAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Save the Date Card & Real QR-Code Modal */}
      <TicketCardModal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
      />
    </div>
  );
}
