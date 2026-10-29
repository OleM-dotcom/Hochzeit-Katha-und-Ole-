import React, { useState, useEffect, useCallback } from 'react';
import QRCode from 'qrcode';
import { Download, QrCode, X, Sparkles, Smartphone, Copy, Check, ExternalLink, Globe, AlertCircle, HelpCircle, ShieldAlert } from 'lucide-react';
import { getPublicRsvpUrl, SHARED_PUBLIC_APP_URL } from '../utils/url';

interface TicketCardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TicketCardModal: React.FC<TicketCardModalProps> = ({ isOpen, onClose }) => {
  // Default to the real live Shared App URL so the QR code actually points to this running app!
  const liveSharedUrl = SHARED_PUBLIC_APP_URL + '#rsvp-form';
  const [urlMode, setUrlMode] = useState<'aistudio' | 'custom'>('aistudio');
  const [customDomain, setCustomDomain] = useState<string>('');
  const [targetUrl, setTargetUrl] = useState<string>(liveSharedUrl);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [renderedCardDataUrl, setRenderedCardDataUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [showHostingGuide, setShowHostingGuide] = useState<boolean>(false);

  // Calibrated coordinates for 2752 x 1536 image
  const posX = 2280;
  const posY = 808;
  const size = 300;
  const originalImageSrc = '/assets/aistudio/Gemini_Generated_Image_wskbk9wskbk9wskb_00ff483a.jpeg';

  // Synchronize targetUrl based on mode
  useEffect(() => {
    if (urlMode === 'custom') {
      setTargetUrl(customDomain.trim() || 'https://katharina-und-ole.de');
    } else {
      setTargetUrl(liveSharedUrl);
    }
  }, [urlMode, customDomain, liveSharedUrl]);

  // Generate QR code data URL
  useEffect(() => {
    let isMounted = true;
    const finalUrl = targetUrl.trim() || 'https://katharina-und-ole.de';

    QRCode.toDataURL(finalUrl, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 900,
      color: {
        dark: '#1a130f',
        light: '#ffffff',
      },
    })
      .then((url) => {
        if (isMounted) {
          setQrDataUrl(url);
        }
      })
      .catch((err) => {
        console.error('Error generating QR code', err);
      });

    return () => {
      isMounted = false;
    };
  }, [targetUrl]);

  // Render combined high-res card onto canvas
  const renderCard = useCallback(async () => {
    if (!qrDataUrl) return;
    setIsGenerating(true);

    try {
      const baseImg = new Image();
      baseImg.crossOrigin = 'anonymous';
      baseImg.src = originalImageSrc;

      await new Promise<void>((resolve, reject) => {
        baseImg.onload = () => resolve();
        baseImg.onerror = (e) => reject(e);
      });

      const qrImg = new Image();
      qrImg.src = qrDataUrl;
      await new Promise<void>((resolve, reject) => {
        qrImg.onload = () => resolve();
        qrImg.onerror = (e) => reject(e);
      });

      const canvas = document.createElement('canvas');
      canvas.width = baseImg.naturalWidth || 2752;
      canvas.height = baseImg.naturalHeight || 1536;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 1. Draw base ticket
      ctx.drawImage(baseImg, 0, 0, canvas.width, canvas.height);

      // 2. Draw white backdrop plate with rounded corner
      const drawX = posX - size / 2;
      const drawY = posY - size / 2;
      const cornerR = 8;

      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(drawX, drawY, size, size, cornerR);
      } else {
        ctx.rect(drawX, drawY, size, size);
      }
      ctx.fill();

      // 3. Draw high-res scannable QR code
      ctx.drawImage(qrImg, drawX, drawY, size, size);
      ctx.restore();

      const fullResUrl = canvas.toDataURL('image/png', 0.98);
      setRenderedCardDataUrl(fullResUrl);
    } catch (err) {
      console.error('Failed to compose card image', err);
    } finally {
      setIsGenerating(false);
    }
  }, [qrDataUrl, originalImageSrc]);

  useEffect(() => {
    if (isOpen) {
      renderCard();
    }
  }, [isOpen, renderCard]);

  if (!isOpen) return null;

  const handleDownloadCard = () => {
    if (!renderedCardDataUrl) return;
    const a = document.createElement('a');
    a.href = renderedCardDataUrl;
    a.download = `Save_the_Date_Katharina_Ole_27_08_2027_Druckkarte.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadQrOnly = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `QR_Code_Katharina_Ole_Hochzeit.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(targetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#1c130d] border border-[#523320] rounded-3xl max-w-4xl w-full p-5 sm:p-8 text-[#f6eedf] shadow-2xl relative my-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#2a1c13] hover:bg-[#3a271a] text-[#cbb59f] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-5">
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#d6611e] font-semibold mb-1">
            <Sparkles className="w-4 h-4 text-[#d6611e]" />
            <span>Save the Date Karte &amp; QR-Code Generator</span>
          </div>
          <h3 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-wide">
            QR-Code Zieladresse festlegen
          </h3>
          <p className="text-xs sm:text-sm text-[#a69280] mt-1.5">
            Hier legst du fest, wohin der QR-Code auf eurer Druckkarte führt, damit Gäste <strong>ohne Google-Login</strong> direkt auf die Rückmeldeseite gelangen.
          </p>
        </div>

        {/* Important Explanation Box regarding Google AI Studio vs Public Domain */}
        <div className="mb-5 p-4 bg-[#26170e] border border-[#d6611e]/40 rounded-2xl text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-[#d6611e]">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>Warum verlangt Google derzeit einen Login beim Scannen der AI Studio Test-URL?</span>
          </div>
          <p className="text-[#c5b19e] leading-relaxed">
            Die URL <code className="bg-[#140e09] px-1.5 py-0.5 rounded text-amber-200 font-mono">ais-dev-...run.app</code> ist Googles <strong>interne Entwicklungsumgebung</strong>. Google Cloud Run schützt diese Umgebung standardmäßig durch einen Google-Login.
          </p>
          <p className="text-[#c5b19e] leading-relaxed font-medium">
            💡 <strong>Für eure echten Hochzeitsgäste (und den Kartendruck):</strong> Tragt unten eure eigene Wunsch-Adresse ein (z.B. <code className="text-[#f6eedf]">katharina-und-ole.de</code> oder eine kostenlose Vercel/Netlify-URL). Sobald der QR-Code gedruckt ist, führt er eure Gäste direkt und ohne Google-Konto auf eure Seite!
          </p>
        </div>

        {/* Target URL Selector */}
        <div className="mb-5 p-4 bg-[#140e09] border border-[#3d2719] rounded-2xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#2d1b11] pb-3">
            <span className="font-bold text-xs uppercase tracking-wider text-[#d6611e]">
              1. Wähle die gewünschte Ziel-URL für den QR-Code:
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setUrlMode('custom')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  urlMode === 'custom'
                    ? 'bg-[#d6611e] text-white shadow'
                    : 'bg-[#22160e] text-[#a69280] hover:text-[#f6eedf]'
                }`}
              >
                Eigene Wunsch-Domain (Empfohlen für Druck)
              </button>
              <button
                type="button"
                onClick={() => setUrlMode('aistudio')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  urlMode === 'aistudio'
                    ? 'bg-[#d6611e] text-white shadow'
                    : 'bg-[#22160e] text-[#a69280] hover:text-[#f6eedf]'
                }`}
              >
                AI Studio Test-Link
              </button>
            </div>
          </div>

          {urlMode === 'custom' ? (
            <div className="space-y-2">
              <label className="block text-xs text-[#a69280]">
                Trage eure Wunsch-Adresse für die Einladungskarte ein:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  placeholder="https://katharina-und-ole.de"
                  className="flex-1 px-3 py-2.5 bg-[#1c130d] border border-[#523320] focus:border-[#d6611e] rounded-xl text-white font-mono text-xs focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-[#8a7667]">
                Der QR-Code auf der Karte aktualisiert sich automatisch in Echtzeit auf diese Adresse!
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <label className="block text-xs text-[#a69280]">
                AI Studio Vorschau-Link:
              </label>
              <div className="p-2.5 bg-[#1c130d] border border-[#3d2719] rounded-xl font-mono text-xs text-[#c5b19e] break-all">
                {SHARED_PUBLIC_APP_URL}#rsvp-form
              </div>
              <p className="text-[11px] text-amber-400/80">
                Hinweis: Um diesen Link extern freizuschalten, klicke in Google AI Studio oben rechts auf <strong>„Share“ (Freigeben)</strong>.
              </p>
            </div>
          )}
        </div>

        {/* Live Card Preview with embedded QR Code */}
        <div className="relative aspect-[2752/1536] w-full overflow-hidden rounded-2xl bg-[#120b07] border border-[#3d2719] shadow-2xl mb-5">
          {renderedCardDataUrl ? (
            <img
              src={renderedCardDataUrl}
              alt="Save the Date Karte mit scanbarem QR-Code"
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-[#a69280]">
              Lade Karte...
            </div>
          )}

          <div className="absolute top-3 right-3 bg-[#160f0a]/90 text-[#f6eedf] text-[11px] px-3 py-1.5 rounded-lg border border-[#523320] backdrop-blur-md flex items-center gap-1.5 shadow-lg">
            <Smartphone className="w-3.5 h-3.5 text-[#d6611e]" />
            <span>Live-Vorschau mit dem neu generierten QR-Code</span>
          </div>
        </div>

        {/* Download & Actions Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <button
            onClick={handleDownloadCard}
            disabled={isGenerating || !renderedCardDataUrl}
            className="w-full py-3.5 px-4 bg-[#d6611e] hover:bg-[#b84c12] active:bg-[#a0400d] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-white" />
            <span>Fertige Karte herunterladen (2752×1536 px)</span>
          </button>

          <button
            onClick={handleDownloadQrOnly}
            disabled={!qrDataUrl}
            className="w-full py-3.5 px-4 bg-[#261910] hover:bg-[#332216] text-[#f6eedf] border border-[#4d301e] font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-[#d6611e]" />
            <span>QR-Code einzeln speichern (PNG)</span>
          </button>
        </div>

        {/* URL Verification Bar & Free Hosting Guide Toggle */}
        <div className="p-4 bg-[#140e09] border border-[#332014] rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#a69280]">
          <div className="flex items-center gap-2 overflow-hidden w-full sm:w-auto">
            <Globe className="w-4 h-4 text-[#d6611e] shrink-0" />
            <span className="truncate font-mono text-[#f6eedf] font-semibold">{targetUrl}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowHostingGuide(!showHostingGuide)}
              className="px-3 py-1.5 bg-[#261910] hover:bg-[#382418] text-[#cfa052] border border-[#523320] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{showHostingGuide ? 'Anleitung schließen' : 'Kostenlose Veröffentlichung (ohne Google-Login)'}</span>
            </button>
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 bg-[#261910] hover:bg-[#382418] text-[#f6eedf] border border-[#4d301e] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#d6611e]" />}
              <span>{copied ? 'Kopiert!' : 'Kopieren'}</span>
            </button>
          </div>
        </div>

        {/* Step-by-Step Free Hosting Guide for Guests */}
        {showHostingGuide && (
          <div className="mt-4 p-5 bg-[#20150e] border border-[#523320] rounded-2xl text-xs space-y-3 animate-in fade-in duration-200">
            <h4 className="font-bold text-sm text-[#f6eedf] flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#d6611e]" />
              <span>3 einfache Wege, wie eure Gäste 100% ohne Google-Login auf die Website kommen:</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[#c5b19e]">
              <div className="p-3 bg-[#140e09] rounded-xl border border-[#332014]">
                <strong className="block text-[#f6eedf] mb-1">1. Eigene Wunsch-Domain</strong>
                <span>Registriert z.B. <em>katharina-und-ole.de</em> bei Strato/Ionos/Namecheap (ca. 1€ im Monat). Tragt diese Adresse oben ein – der QR-Code ist sofort druckfertig.</span>
              </div>
              <div className="p-3 bg-[#140e09] rounded-xl border border-[#332014]">
                <strong className="block text-[#f6eedf] mb-1">2. Kostenloses Vercel / Netlify</strong>
                <span>Diese App ist 100% statisch. Ihr könnt das Projekt mit einem Klick kostenlos auf Vercel oder Netlify hochladen (z.B. <em>festival-of-love.vercel.app</em>). Weltweit frei für alle Gäste erreichbar.</span>
              </div>
              <div className="p-3 bg-[#140e09] rounded-xl border border-[#332014]">
                <strong className="block text-[#f6eedf] mb-1">3. AI Studio „Share“-Button</strong>
                <span>Klickt in der oberen Leiste von Google AI Studio auf den Button <strong>„Share“ (Freigeben)</strong> und wählt „Jeder mit dem Link“, um die Berechtigung direkt in Google freizugeben.</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
