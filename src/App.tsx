import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { RsvpForm } from './components/RsvpForm';
import { CoupleDashboard } from './components/CoupleDashboard';
import { TicketCardModal } from './components/TicketCardModal';
import { Footer } from './components/Footer';
import { getRsvpEntries } from './services/storage';
import { RsvpEntry } from './types';

export default function App() {
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [entries, setEntries] = useState<RsvpEntry[]>([]);
  const [isCardModalOpen, setIsCardModalOpen] = useState<boolean>(false);

  const reloadEntries = () => {
    setEntries(getRsvpEntries());
  };

  useEffect(() => {
    reloadEntries();

    // Check hash on load (e.g. #rsvp-form when scanned by the QR code!)
    if (typeof window !== 'undefined' && window.location.hash) {
      const targetId = window.location.hash.replace('#', '');
      const el = document.getElementById(targetId);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setActiveSection(targetId);
        }, 200);
      }
    }
  }, []);

  const handleNavigate = (sectionId: string) => {
    setActiveSection(sectionId);
  };

  const handleScrollToRsvp = () => {
    setActiveSection('rsvp-form');
    const el = document.getElementById('rsvp-form');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-wood-canvas text-[#f6eedf] selection:bg-[#d6611e] selection:text-white flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        onNavigate={handleNavigate}
        activeSection={activeSection}
        onOpenCardModal={() => setIsCardModalOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero with Festival of Love and Countdown */}
        <Hero
          onNavigateToRsvp={handleScrollToRsvp}
          onOpenCardModal={() => setIsCardModalOpen(true)}
        />

        {/* RSVP Form ("Gebt uns Bescheid") */}
        <RsvpForm onEntryAdded={reloadEntries} />

        {/* Couple & Admin Guest List Management */}
        <CoupleDashboard entries={entries} onRefresh={reloadEntries} />
      </main>

      {/* Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenCardModal={() => setIsCardModalOpen(true)}
      />

      {/* Save the Date Card & Real QR-Code Modal */}
      <TicketCardModal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
      />
    </div>
  );
}
