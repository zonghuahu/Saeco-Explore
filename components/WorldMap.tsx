import React, { useEffect, useRef, useState } from 'react';
import { Memory, Coordinate } from '../types';
import { MapPin, Calendar, ImageIcon } from 'lucide-react';

// Declaration for global Leaflet object
declare global {
  interface Window {
    L: any;
  }
}

interface WorldMapProps {
  memories: Memory[];
  onMemoryClick: (memory: Memory) => void;
  onMapClick: (coord: Coordinate) => void;
}

export const WorldMap: React.FC<WorldMapProps> = ({ memories, onMemoryClick, onMapClick }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // Tooltip State
  const [hoveredMemory, setHoveredMemory] = useState<Memory | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || !window.L) return;

    if (mapInstanceRef.current) return; // Initialize only once

    // Create Map
    const map = window.L.map(mapContainerRef.current, {
      center: [30, 0],
      zoom: 3,
      zoomControl: false,
      attributionControl: true,
      minZoom: 2,
      maxZoom: 18,
      worldCopyJump: true // Fix for wrapping world
    });

    // Add CartoDB Voyager Tiles (Beautiful, clean, detailed)
    window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    // Zoom control top-right
    window.L.control.zoom({
      position: 'bottomright'
    }).addTo(map);

    // Handle Click on Map (to add new memory)
    map.on('click', (e: any) => {
      onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    });

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []); // Run once on mount

  // Update Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !window.L) return;

    const map = mapInstanceRef.current;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add Royal Gemstone Markers
    memories.forEach(memory => {
      // Create Custom HTML Icon (Gemstone)
      const customIcon = window.L.divIcon({
        className: 'custom-pin-container', // Wrapper class must have background: transparent
        html: `
          <div class="gemstone-wrapper">
            <div class="gemstone-shape"></div>
          </div>
        `,
        iconSize: [40, 50], // Adjusted size for touch target
        iconAnchor: [20, 48], // Tip of teardrop (approximately bottom center)
      });

      const marker = window.L.marker([memory.coordinates.lat, memory.coordinates.lng], {
        icon: customIcon
      }).addTo(map);

      // Click Handler
      marker.on('click', (e: any) => {
        window.L.DomEvent.stopPropagation(e);
        onMemoryClick(memory);
      });

      // Hover Handler (Show Card)
      marker.on('mouseover', (e: any) => {
        const point = map.latLngToContainerPoint(e.latlng);
        // Position card above marker
        setTooltipPos({ x: point.x, y: point.y - 60 }); 
        setHoveredMemory(memory);
      });

      marker.on('mouseout', () => {
         setHoveredMemory(null);
      });

      markersRef.current.push(marker);
    });

    // Update tooltip position on map move (if visible)
    map.on('move', () => {
        setHoveredMemory(null); // Hide tooltip on drag to prevent misalignment
    });

  }, [memories, onMemoryClick]);


  return (
    <div className="w-full h-full relative bg-[#e0f2fe]">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Hover Tooltip Card (React Portal Overlay) */}
      {hoveredMemory && (
        <div 
            className="absolute z-[1000] pointer-events-none transition-all duration-300 ease-out transform -translate-x-1/2 -translate-y-[10px]"
            style={{ 
                left: tooltipPos.x, 
                top: tooltipPos.y, 
            }}
        >
            <div className="bg-white/80 backdrop-blur-xl p-4 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.15)] border border-white/60 w-72 animate-scale-in origin-bottom">
                
                {/* Header */}
                <div className="mb-4">
                    <h4 className="font-serif font-bold text-slate-800 text-xl leading-tight line-clamp-1">{hoveredMemory.title}</h4>
                    <div className="flex flex-col gap-1.5 mt-2">
                      <div className="flex items-center gap-2 text-[11px] text-pink-600 font-bold uppercase tracking-widest">
                          <MapPin size={12} strokeWidth={3} /> 
                          <span className="truncate">{hoveredMemory.locationName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                          <Calendar size={12} /> 
                          <span>{hoveredMemory.date}</span>
                      </div>
                    </div>
                </div>

                {/* Mini Gallery Preview */}
                <div className="grid grid-cols-2 gap-2 rounded-lg overflow-hidden bg-white/50 p-1.5 border border-white/40">
                    {hoveredMemory.photos.slice(0, 2).map((photo) => (
                        <div key={photo.id} className="aspect-[4/3] bg-slate-100 relative rounded-md overflow-hidden shadow-sm group">
                             <img src={photo.url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="" />
                        </div>
                    ))}
                    {hoveredMemory.photos.length === 0 && (
                        <div className="col-span-2 aspect-[2/1] flex items-center justify-center text-slate-300">
                             <ImageIcon size={24} />
                        </div>
                    )}
                </div>

                {/* Counter */}
                {hoveredMemory.photos.length > 2 && (
                    <div className="absolute bottom-6 right-6 bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded-md backdrop-blur-md border border-white/10">
                        +{hoveredMemory.photos.length - 2} photos
                    </div>
                )}
            </div>
            
            {/* Arrow */}
            <div className="w-5 h-5 bg-white/80 backdrop-blur-xl rotate-45 absolute bottom-[-8px] left-1/2 -translate-x-1/2 border-r border-b border-white/60 shadow-sm"></div>
        </div>
      )}
    </div>
  );
};