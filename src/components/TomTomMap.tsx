import { useEffect, useRef, useState } from 'react';
import tt from '@tomtom-international/web-sdk-maps';
import '@tomtom-international/web-sdk-maps/dist/maps.css';

interface Firma {
  id: string;
  ad: string;
  konum: string;
  sektor: string;
  telefon?: string;
  email?: string;
  dogrulandi?: boolean;
  lat?: number;
  lng?: number;
}

interface TomTomMapProps {
  firmalar: Firma[];
  onFirmaSelect?: (firma: Firma) => void;
  selectedFirma?: Firma | null;
  className?: string;
}

// Türkiye şehir koordinatları
const sehirKoordinatlari: { [key: string]: { lat: number; lng: number } } = {
  'ankara': { lat: 39.9334, lng: 32.8597 },
  'istanbul': { lat: 41.0082, lng: 28.9784 },
  'izmir': { lat: 38.4189, lng: 27.1287 },
  'bursa': { lat: 40.1826, lng: 29.0665 },
  'adana': { lat: 36.9914, lng: 35.3308 },
  'antalya': { lat: 36.8969, lng: 30.7133 },
  'konya': { lat: 37.8714, lng: 32.4846 },
  'gaziantep': { lat: 37.0662, lng: 37.3833 },
  'mersin': { lat: 36.8121, lng: 34.6415 },
  'kayseri': { lat: 38.7312, lng: 35.4787 },
  'eskişehir': { lat: 39.7767, lng: 30.5206 },
  'diyarbakır': { lat: 37.9144, lng: 40.2306 },
  'samsun': { lat: 41.2867, lng: 36.33 },
  'denizli': { lat: 37.7765, lng: 29.0864 },
  'şanlıurfa': { lat: 37.1674, lng: 38.7955 },
  'malatya': { lat: 38.3554, lng: 38.3335 },
  'kahramanmaraş': { lat: 37.5847, lng: 36.9371 },
  'van': { lat: 38.4941, lng: 43.38 },
  'trabzon': { lat: 41.0027, lng: 39.7168 },
  'manisa': { lat: 38.6191, lng: 27.4289 },
  'çankaya': { lat: 39.9032, lng: 32.8597 }, // Ankara'nın ilçesi
};

// Konum adından koordinat bulma
const getKoordinat = (konum: string): { lat: number; lng: number } => {
  const normalizedKonum = konum.toLowerCase().trim();
  
  for (const [sehir, koordinat] of Object.entries(sehirKoordinatlari)) {
    if (normalizedKonum.includes(sehir)) {
      return koordinat;
    }
  }
  
  // Varsayılan olarak Ankara
  return { lat: 39.9334, lng: 32.8597 };
};

function TomTomMap({ firmalar, onFirmaSelect, selectedFirma, className = '' }: TomTomMapProps) {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<tt.Map | null>(null);
  const markersRef = useRef<tt.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiKey = import.meta.env.VITE_TOMTOM_API_KEY;

  useEffect(() => {
    if (!mapElement.current || mapInstance.current) return;

    if (!apiKey || apiKey === 'YOUR_TOMTOM_API_KEY_HERE') {
      setError('TomTom API anahtarı ayarlanmamış. Lütfen .env dosyasına VITE_TOMTOM_API_KEY ekleyin.');
      return;
    }

    try {
      // Haritayı başlat - Türkiye merkezi
      const map = tt.map({
        key: apiKey,
        container: mapElement.current,
        center: [32.8597, 39.9334], // Ankara [lng, lat]
        zoom: 5.5,
        language: 'tr-TR',
        style: `https://api.tomtom.com/style/1/style/22.2.1-*?map=basic_main&poi=poi_main&key=${apiKey}`,
      });

      map.addControl(new tt.NavigationControl());
      map.addControl(new tt.FullscreenControl());

      map.on('load', () => {
        setMapLoaded(true);
        mapInstance.current = map;
      });

    } catch (err: any) {
      console.error('TomTom harita hatası:', err);
      setError('Harita yüklenirken bir hata oluştu.');
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [apiKey]);

  // Firma marker'larını ekle
  useEffect(() => {
    if (!mapInstance.current || !mapLoaded) return;

    // Mevcut marker'ları temizle
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Her firma için marker ekle
    firmalar.forEach((firma) => {
      let lat = firma.lat;
      let lng = firma.lng;

      // Koordinat yoksa konum adından bul
      if (!lat || !lng) {
        const koordinat = getKoordinat(firma.konum);
        lat = koordinat.lat;
        lng = koordinat.lng;
      }

      // Custom marker elementi oluştur
      const markerElement = document.createElement('div');
      markerElement.className = 'custom-marker';
      markerElement.innerHTML = `
        <div class="marker-container ${selectedFirma?.id === firma.id ? 'selected' : ''}">
          <div class="marker-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>
          ${firma.dogrulandi ? '<div class="verified-badge">✓</div>' : ''}
        </div>
      `;

      const marker = new tt.Marker({
        element: markerElement,
        anchor: 'bottom',
      })
        .setLngLat([lng, lat])
        .addTo(mapInstance.current!);

      // Popup oluştur
      const popup = new tt.Popup({
        offset: 30,
        closeButton: true,
        closeOnClick: false,
        className: 'firma-popup',
      }).setHTML(`
        <div class="popup-content">
          <h3 class="popup-title">${firma.ad}</h3>
          <p class="popup-location">${firma.konum}</p>
          <p class="popup-sector">${firma.sektor}</p>
          ${firma.telefon ? `<p class="popup-phone">📞 ${firma.telefon}</p>` : ''}
          ${firma.dogrulandi ? '<span class="popup-verified">✓ Doğrulanmış</span>' : ''}
        </div>
      `);

      marker.setPopup(popup);

      // Tıklama olayı
      markerElement.addEventListener('click', () => {
        if (onFirmaSelect) {
          onFirmaSelect(firma);
        }
      });

      markersRef.current.push(marker);
    });

  }, [firmalar, mapLoaded, selectedFirma, onFirmaSelect]);

  // Seçili firmaya zoom yap
  useEffect(() => {
    if (!mapInstance.current || !mapLoaded || !selectedFirma) return;

    let lat = selectedFirma.lat;
    let lng = selectedFirma.lng;

    if (!lat || !lng) {
      const koordinat = getKoordinat(selectedFirma.konum);
      lat = koordinat.lat;
      lng = koordinat.lng;
    }

    mapInstance.current.flyTo({
      center: [lng, lat],
      zoom: 12,
      duration: 1000,
    });

    // Marker'ın popup'ını aç
    const markerIndex = firmalar.findIndex(f => f.id === selectedFirma.id);
    if (markerIndex !== -1 && markersRef.current[markerIndex]) {
      markersRef.current[markerIndex].togglePopup();
    }

  }, [selectedFirma, mapLoaded, firmalar]);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-xl ${className}`}>
        <div className="text-center p-6">
          <span className="material-symbols-outlined text-4xl text-red-500 mb-2 block">error</span>
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div ref={mapElement} className="w-full h-full rounded-xl overflow-hidden" />
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-xl">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Harita yükleniyor...</p>
          </div>
        </div>
      )}
      
      {/* Custom CSS */}
      <style>{`
        .custom-marker {
          cursor: pointer;
        }
        
        .marker-container {
          position: relative;
          color: #22c55e;
          transition: transform 0.2s, color 0.2s;
        }
        
        .marker-container:hover {
          transform: scale(1.2);
          color: #16a34a;
        }
        
        .marker-container.selected {
          color: #3b82f6;
          transform: scale(1.3);
        }
        
        .marker-icon {
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
        }
        
        .verified-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          width: 14px;
          height: 14px;
          background: #22c55e;
          color: white;
          border-radius: 50%;
          font-size: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
        
        .firma-popup .mapboxgl-popup-content {
          padding: 12px 16px;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          min-width: 200px;
        }
        
        .popup-content {
          font-family: 'Inter', sans-serif;
        }
        
        .popup-title {
          font-weight: 600;
          font-size: 14px;
          color: #1f2937;
          margin-bottom: 4px;
        }
        
        .popup-location {
          font-size: 12px;
          color: #6b7280;
          margin-bottom: 2px;
        }
        
        .popup-sector {
          font-size: 12px;
          color: #22c55e;
          font-weight: 500;
          margin-bottom: 4px;
        }
        
        .popup-phone {
          font-size: 11px;
          color: #4b5563;
          margin-bottom: 4px;
        }
        
        .popup-verified {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          color: #22c55e;
          font-weight: 500;
          background: #dcfce7;
          padding: 2px 8px;
          border-radius: 12px;
        }
        
        /* Dark mode popup styles */
        @media (prefers-color-scheme: dark) {
          .firma-popup .mapboxgl-popup-content {
            background: #1f2937;
          }
          
          .popup-title {
            color: #f3f4f6;
          }
          
          .popup-location {
            color: #9ca3af;
          }
          
          .popup-phone {
            color: #d1d5db;
          }
        }
      `}</style>
    </div>
  );
}

export default TomTomMap;

