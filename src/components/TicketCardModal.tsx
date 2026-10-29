import React, { useState, useEffect, useCallback } from 'react';
import QRCode from 'qrcode';
import { Download, QrCode, X, Sparkles, Smartphone, Copy, Check, ExternalLink, Globe, AlertCircle, HelpCircle, ShieldAlert, Home, ArrowLeft } from 'lucide-react';
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

      const canvas = document.createElement('canvas');
      canvas.width = baseImg.naturalWidth || 2752;
      canvas.height = baseImg.naturalHeight || 1536;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw original ticket base
      ctx.drawImage(baseImg, 0, 0, canvas.width, canvas.height);

      // Load generated QR code image
      const qrImg = new Image();
      qrImg.src = qrDataUrl;
      await new Promise<void>((resolve, reject) => {
        qrImg.onload = () => resolve();
        qrImg.onerror = (e) => reject(e);
      });

      // Sample border color from the orange ticket stub
      const sampleX = Math.min(canvas.width - 50, posX + size / 2);
      const sampleY = Math.max(50, posY - 25);
      const pixel = ctx.getImageData(sampleX, sampleY, 1, 1).data;
      const stubBg = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;

      // 1. Draw smooth background patch to cover old dummy QR code
      const pad = 12;
      ctx.fillStyle = stubBg;
      ctx.fillRect(posX - pad, posY - pad, size + pad * 2, size + pad * 2);

      // 2. White sticker container with rounded corners
      const stickerPad = 8;
      const rx = posX - stickerPad;
      const ry = posY - stickerPad;
      const rw = size + stickerPad * 2;
      const rh = size + stickerPad * 2;
      const cornerRadius = 14;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(rx + cornerRadius, ry);
      ctx.lineTo(rx + rw - cornerRadius, ry);
      ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + cornerRadius);
      ctx.lineTo(rx + rw, ry + rh - cornerRadius);
      ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - cornerRadius, ry + rh);
      ctx.lineTo(rx + cornerRadius, ry + rh);
      ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - cornerRadius);
      ctx.lineTo(rx, ry + cornerRadius);
      ctx.quadraticCurveTo(rx, ry, rx + cornerRadius, ry);
      ctx.closePath();

      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0,0,0,0.35)';
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = 6;
      ctx.fill();
      ctx.restore();

      // 3. Draw high-res, crisp QR code
      ctx.drawImage(qrImg, posX, posY, size, size);

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

  const handleReturnToHome = () => {
    onClose();
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto">
      <div className="bg-[#ffffff] border border-[#eedcc8] rounded-2xl sm:rounded-3xl max-w-4xl w-full p-3.5 sm:p-8 text-[#261c14] shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto">
        {/* Top Control Bar: Return to Startseite & Close */}
        <div className="flex items-center justify-between gap-2 mb-3.5 sm:mb-4 pb-2.5 sm:pb-3 border-b border-[#eedcc8]">
          <button
            onClick={handleReturnToHome}
            className="px-3 py-1.5 bg-[#faebd7] hover:bg-[#f5dbc0] text-[#261c14] border border-[#e2cca9] hover:border-[#d7541d] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            title="Zur Startseite zurückkehren"
          >
            <Home className="w-4 h-4 text-[#d7541d]" />
            <span>Zur Startseite</span>
          </button>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#faebd7] hover:bg-[#f0d8bd] text-[#665444] hover:text-[#261c14] flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Schließen"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-5">
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#d7541d] font-bold mb-1 px-3 py-1 bg-[#faebd7] border border-[#f0d4b4] rounded-full">
            <Sparkles className="w-4 h-4 text-[#cf3464]" />
            <span>Save the Date Karte &amp; QR-Code Generator</span>
          </div>
          <h3 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-wide text-[#261c14] mt-2">
            QR-Code Zieladresse festlegen
          </h3>
          <p className="text-xs sm:text-sm text-[#665444] mt-1.5 leading-relaxed">
            Hier legst du fest, wohin der QR-Code auf eurer Druckkarte führt, damit Gäste <strong>ohne Google-Login</strong> direkt auf die Rückmeldeseite gelangen.
          </p>
        </div>

        {/* Important Explanation Box regarding Google AI Studio vs Public Domain */}
        <div className="mb-5 p-4 bg-[#fffaf2] border border-[#f0d4b4] rounded-2xl text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-[#d7541d]">
            <ShieldAlert className="w-4 h-4 text-[#cf3464] shrink-0" />
            <span>Warum verlangt Google derzeit einen Login beim Scannen der AI Studio Test-URL?</span>
          </div>
          <p className="text-[#665444] leading-relaxed">
            Die URL <code className="bg-[#faebd7] px-1.5 py-0.5 rounded text-[#92092f] font-mono">ais-dev-...run.app</code> ist Googles <strong>interne Entwicklungsumgebung</strong>. Google Cloud Run schützt diese Umgebung standardmäßig durch einen Google-Login und Safari bricht wegen Cookie-Prüfungen ab.
          </p>
          <p className="text-[#261c14] leading-relaxed font-medium">
            💡 <strong>Für eure echten Hochzeitsgäste (und den Kartendruck):</strong> Tragt unten eure eigene Wunsch-Adresse ein (z.B. <code className="text-[#d7541d] font-bold">katharina-und-ole.de</code> oder eine kostenlose Netlify/Vercel-URL). Sobald der QR-Code gedruckt ist, führt er eure Gäste direkt und ohne Google-Konto auf eure Seite!
          </p>
        </div>

        {/* Target URL Selector */}
        <div className="mb-5 p-4 bg-[#fffcf7] border border-[#eedcc8] rounded-2xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#eedcc8] pb-3">
            <span className="font-bold text-xs uppercase tracking-wider text-[#d7541d]">
              1. Wähle die gewünschte Ziel-URL für den QR-Code:
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setUrlMode('custom')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  urlMode === 'custom'
                    ? 'bg-[#d7541d] text-white shadow-xs'
                    : 'bg-[#faebd7] text-[#665444] hover:text-[#261c14]'
                }`}
              >
                Eigene Wunsch-Domain (Empfohlen für Druck)
              </button>
              <button
                type="button"
                onClick={() => setUrlMode('aistudio')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  urlMode === 'aistudio'
                    ? 'bg-[#d7541d] text-white shadow-xs'
                    : 'bg-[#faebd7] text-[#665444] hover:text-[#261c14]'
                }`}
              >
                AI Studio Test-Link
              </button>
            </div>
          </div>

          {urlMode === 'custom' ? (
            <div className="space-y-2">
              <label className="block text-xs text-[#665444] font-medium">
                Trage eure Wunsch-Adresse für die Einladungskarte ein:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  placeholder="https://katharina-und-ole.de"
                  className="flex-1 px-3 py-2.5 bg-[#ffffff] border border-[#d9c7af] focus:border-[#d7541d] rounded-xl text-[#261c14] font-mono text-xs focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-[#786757]">
                Der QR-Code auf der Karte aktualisiert sich automatisch in Echtzeit auf diese Adresse!
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <label className="block text-xs text-[#665444] font-medium">
                AI Studio Vorschau-Link:
              </label>
              <div className="p-2.5 bg-[#fffaf2] border border-[#eedcc8] rounded-xl font-mono text-xs text-[#665444] break-all">
                {SHARED_PUBLIC_APP_URL}#rsvp-form
              </div>
              <p className="text-[11px] text-[#d7541d]">
                Hinweis: Um diesen Link extern freizuschalten, klicke in Google AI Studio oben rechts auf <strong>„Share“ (Freigeben)</strong>.
              </p>
            </div>
          )}
        </div>

        {/* Live Card Preview with embedded QR Code */}
        <div className="relative aspect-[2752/1536] w-full overflow-hidden rounded-2xl bg-[#f5ede3] border border-[#eedcc8] shadow-lg mb-5">
          {renderedCardDataUrl ? (
            <img
              src={renderedCardDataUrl}
              alt="Save the Date Karte mit scanbarem QR-Code"
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-[#786757]">
              Lade Karte...
            </div>
          )}

          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-[#ffffff]/90 text-[#261c14] text-[10px] sm:text-[11px] px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-[#eedcc8] backdrop-blur-md flex items-center gap-1.5 shadow-md max-w-[80%]">
            <Smartphone className="w-3.5 h-3.5 text-[#d7541d] shrink-0" />
            <span className="font-medium truncate">Live-Vorschau mit neuem QR-Code</span>
          </div>
        </div>

        {/* Download & Actions Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 mb-4">
          <button
            onClick={handleDownloadCard}
            disabled={isGenerating || !renderedCardDataUrl}
            className="w-full min-h-[44px] py-3 px-4 bg-[#d7541d] hover:bg-[#b84112] active:bg-[#9c360e] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-white shrink-0" />
            <span>Karte herunterladen (Druckqualität)</span>
          </button>

          <button
            onClick={handleDownloadQrOnly}
            disabled={!qrDataUrl}
            className="w-full min-h-[44px] py-3 px-4 bg-[#faebd7] hover:bg-[#f5dbc0] text-[#261c14] border border-[#ecd8c2] font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-[#d7541d] shrink-0" />
            <span>QR-Code einzeln speichern (PNG)</span>
          </button>
        </div>

        {/* 1-Click Free Hosting Package for iPhone & All Guests */}
        <div className="mb-4 p-4 bg-[#fffaf2] border-2 border-[#d7541d]/40 rounded-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-wider text-[#d7541d] font-bold flex items-center gap-1.5">
                <Globe className="w-4 h-4" />
                <span>Dauerhaft online für alle iPhones &amp; Hochzeitsgäste</span>
              </div>
              <p className="text-xs text-[#665444] mt-1 leading-relaxed">
                Damit die Website auf jedem iPhone (Safari) fehlerfrei lädt und bis zur Hochzeit 2027 dauerhaft erreichbar bleibt:
              </p>
            </div>
            <a
              href="/hochzeit-website.zip"
              download="Festival_of_Love_Website_Katharina_Ole.zip"
              className="px-4 py-2.5 bg-[#d7541d] hover:bg-[#b84112] text-white font-bold text-xs rounded-xl flex items-center gap-2 whitespace-nowrap shadow-md cursor-pointer shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Website (.ZIP) herunterladen</span>
            </a>
          </div>

          <div className="mt-3 pt-3 border-t border-[#f0dfcc] grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-[#665444]">
            <div>
              <strong className="text-[#261c14] block">1. ZIP herunterladen</strong>
              Klicke rechts auf den Button, um das fertige Website-Paket zu speichern.
            </div>
            <div>
              <strong className="text-[#261c14] block">2. Gratis hochladen (60 Sek.)</strong>
              Öffne <a href="https://app.netlify.com/drop" target="_blank" rel="noopener noreferrer" className="text-[#d7541d] underline font-bold">app.netlify.com/drop</a> und ziehe die ZIP hinein.
            </div>
            <div>
              <strong className="text-[#261c14] block">3. URL oben eintragen</strong>
              Trage deine neue Adresse hier oben ein – der QR-Code funktioniert sofort auf jedem iPhone!
            </div>
          </div>
        </div>

        {/* URL Verification Bar & Free Hosting Guide Toggle */}
        <div className="p-4 bg-[#fffcf7] border border-[#eedcc8] rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#665444]">
          <div className="flex items-center gap-2 overflow-hidden w-full sm:w-auto">
            <Globe className="w-4 h-4 text-[#d7541d] shrink-0" />
            <span className="truncate font-mono text-[#261c14] font-semibold">{targetUrl}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowHostingGuide(!showHostingGuide)}
              className="px-3 py-1.5 bg-[#faebd7] hover:bg-[#f5dbc0] text-[#92092f] border border-[#ecdac6] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#cf3464]" />
              <span>{showHostingGuide ? 'Anleitung schließen' : 'Kostenlose Veröffentlichung (ohne Google-Login)'}</span>
            </button>
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 bg-[#ffffff] hover:bg-[#fff9f2] text-[#261c14] border border-[#ecdac6] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#d7541d]" />}
              <span>{copied ? 'Kopiert!' : 'Kopieren'}</span>
            </button>
          </div>
        </div>

        {/* Step-by-Step Free Hosting Guide for Guests */}
        {showHostingGuide && (
          <div className="mt-4 p-5 bg-[#fffaf2] border border-[#eedcc8] rounded-2xl text-xs space-y-3 animate-in fade-in duration-200">
            <h4 className="font-bold text-sm text-[#261c14] flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#d7541d]" />
              <span>3 einfache Wege, wie eure Gäste 100% ohne Google-Login auf die Website kommen:</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[#665444]">
              <div className="p-3 bg-[#ffffff] rounded-xl border border-[#eedcc8]">
                <strong className="block text-[#261c14] mb-1 font-bold">1. Eigene Wunsch-Domain</strong>
                <span>Registriert z.B. <em>katharina-und-ole.de</em> bei Strato/Ionos/Namecheap (ca. 1€ im Monat). Tragt diese Adresse oben ein – der QR-Code ist sofort druckfertig.</span>
              </div>
              <div className="p-3 bg-[#ffffff] rounded-xl border border-[#eedcc8]">
                <strong className="block text-[#261c14] mb-1 font-bold">2. Kostenloses Vercel / Netlify</strong>
                <span>Ladet oben einfach die ZIP herunter und zieht sie bei Netlify Drop hinein (z.B. <em>festival-of-love.netlify.app</em>). Weltweit frei für alle iPhones &amp; Androids.</span>
              </div>
              <div className="p-3 bg-[#ffffff] rounded-xl border border-[#eedcc8]">
                <strong className="block text-[#261c14] mb-1 font-bold">3. AI Studio „Share“-Button</strong>
                <span>Klickt in der oberen Leiste von Google AI Studio auf den Button <strong>„Share“ (Freigeben)</strong> und wählt „Jeder mit dem Link“, um die Berechtigung direkt in Google freizugeben.</span>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Back-to-Home Button */}
        <div className="mt-5 pt-3 border-t border-[#eedcc8] flex justify-center">
          <button
            onClick={handleReturnToHome}
            className="px-6 py-2.5 bg-[#faebd7] hover:bg-[#f5dbc0] text-[#261c14] border border-[#e2cca9] hover:border-[#d7541d] rounded-xl font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-4 h-4 text-[#d7541d]" />
            <span>Zurück zur Startseite</span>
          </button>
        </div>
      </div>
    </div>
  );
};
