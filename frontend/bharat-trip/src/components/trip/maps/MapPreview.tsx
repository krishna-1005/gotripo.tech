import { useEffect, useRef, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Premium Custom Marker Icon
const createCustomIcon = (isActive: boolean = false) => {
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div class="relative flex items-center justify-center">
        <div class="absolute w-8 h-8 rounded-full bg-accent/20 animate-ping ${isActive ? "block" : "hidden"}"></div>
        <div class="relative size-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center transition-all duration-300 ${
          isActive 
            ? "bg-accent text-white scale-125 z-[1000]" 
            : "bg-primary text-primary-foreground hover:bg-accent hover:text-white"
        }">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

function MapController({ activePlace, bounds }: { activePlace: any, bounds: L.LatLngBoundsExpression | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (activePlace && activePlace.lat && activePlace.lng) {
      map.flyTo([activePlace.lat, activePlace.lng], 14, {
        duration: 1.5,
        easeLinearity: 0.25
      });
    } else if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bounds, activePlace, map]);

  return (
    <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-1">
      <button 
        onClick={(e) => { e.stopPropagation(); map.zoomIn(); }}
        className="size-8 rounded-lg bg-black/40 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition shadow-lg text-white border border-white/10 font-bold"
      >
        +
      </button>
      <button 
        onClick={(e) => { e.stopPropagation(); map.zoomOut(); }}
        className="size-8 rounded-lg bg-black/40 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition shadow-lg text-white border border-white/10 font-bold"
      >
        -
      </button>
    </div>
  );
}

interface MapPreviewProps {
  itinerary: any[];
  activePlace?: any;
  onMarkerClick?: (place: any) => void;
}

export function MapPreview({ itinerary, activePlace, onMarkerClick }: MapPreviewProps) {
  const allPlaces = useMemo(() => {
    return itinerary.flatMap((day: any) => day.places || day.items || day.activities || []);
  }, [itinerary]);

  const points = useMemo(() => {
    return allPlaces
      .filter((p: any) => p.lat && p.lng)
      .map((p: any) => [p.lat, p.lng] as [number, number]);
  }, [allPlaces]);

  if (points.length === 0) {
    return (
      <div className="w-full h-full bg-secondary grid place-items-center text-muted-foreground text-xs italic p-4 text-center">
        No coordinates available for this route preview.
      </div>
    );
  }

  const bounds = L.latLngBounds(points);

  return (
    <div className="w-full h-full relative z-0 group">
      <style dangerouslySetInnerHTML={{ __html: `
        .leaflet-popup-content-wrapper {
          background: #1a1a1a;
          color: white;
          border-radius: 12px;
          padding: 0;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5);
        }
        .leaflet-popup-content {
          margin: 0;
        }
        .leaflet-popup-tip {
          background: #1a1a1a;
        }
        .custom-marker {
          background: transparent;
          border: none;
        }
        .leaflet-container {
          background: #0f172a;
        }
      `}} />
      <MapContainer
        bounds={bounds}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <MapController bounds={bounds} activePlace={activePlace} />
        {allPlaces.map((p: any, i: number) => {
          if (!p.lat || !p.lng) return null;
          const isActive = activePlace && (p.name === activePlace.name || p.place === activePlace.place);
          
          return (
            <Marker 
              key={`${p.name || p.place}-${i}`} 
              position={[p.lat, p.lng]}
              icon={createCustomIcon(isActive)}
              eventHandlers={{
                click: () => {
                  if (onMarkerClick) onMarkerClick(p);
                },
              }}
            >
              <Popup>
                <div className="p-3 min-w-[180px]">
                  <div className="font-display font-bold text-sm text-white">{p.name || p.place}</div>
                  <div className="text-[10px] text-accent font-semibold uppercase tracking-wider mt-0.5">
                    {p.category || p.tag || p.type || "Attraction"}
                  </div>
                  {p.description && (
                    <p className="text-[11px] text-white/60 mt-1 line-clamp-2 leading-relaxed">{p.description}</p>
                  )}
                  <div className="mt-2 flex items-center gap-2">
                    <div className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-white/80">
                      {p.time || "Scheduled"}
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
        <Polyline 
          positions={points} 
          pathOptions={{ 
            color: "var(--accent)", 
            weight: 2, 
            dashArray: "5, 10", 
            opacity: 0.5,
            lineJoin: "round"
          }} 
        />
      </MapContainer>
      
      <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
        <div className="glass-card rounded-xl px-3 py-1.5 text-[10px] uppercase tracking-widest font-bold shadow-pop text-white bg-black/40 backdrop-blur-md border border-white/10">
          <span className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-accent animate-pulse"></span>
            Interactive Route
          </span>
        </div>
      </div>
    </div>
  );
}
