import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

export default function TransportMap({
  farmerLat = 16.506,
  farmerLng = 80.648,
  farmerName = "Farmer Pickup",
  factoryLat = 16.518,
  factoryLng = 80.619,
  factoryName = "Factory Delivery",
  allTransporters = [],
  selectedTransporterId = null,
  onMarkerSelectTransporter = null,
  routeCoords = []
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current).setView([farmerLat, farmerLng], 12);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear existing markers & layers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });

    const createCustomIcon = (bgColor, emojiSymbol, textLabel, isHighlighted = false) => {
      return L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="
            background: ${bgColor};
            color: white;
            padding: ${isHighlighted ? '7px 14px' : '5px 10px'};
            border-radius: 20px;
            font-weight: 800;
            font-size: ${isHighlighted ? '13px' : '12px'};
            display: flex;
            align-items: center;
            gap: 5px;
            box-shadow: ${isHighlighted ? '0 0 0 4px rgba(5,150,105,0.4), 0 8px 16px rgba(0,0,0,0.3)' : '0 4px 10px rgba(0,0,0,0.25)'};
            border: 2px solid white;
            white-space: nowrap;
            transition: all 0.2s ease;
          ">
            <span>${emojiSymbol}</span>
            <span>${textLabel}</span>
          </div>
        `,
        iconSize: [130, 36],
        iconAnchor: [65, 18]
      });
    };

    // 1. Farmer Marker 🟢 (Green)
    const farmerMarker = L.marker([farmerLat, farmerLng], {
      icon: createCustomIcon('#10b981', '🟢', farmerName || 'Farmer Pickup')
    }).addTo(map);
    farmerMarker.bindPopup(`<b>🟢 ${farmerName}</b><br/>Pickup Location`);

    // 2. Factory Marker 🔴 (Red)
    const factoryMarker = L.marker([factoryLat, factoryLng], {
      icon: createCustomIcon('#ef4444', '🔴', factoryName || 'Factory Delivery')
    }).addTo(map);
    factoryMarker.bindPopup(`<b>🔴 ${factoryName}</b><br/>Destination Location`);

    // 3. ALL Blue Truck Markers 🔵 (Farmer & Buyer Hubs)
    const allPoints = [[farmerLat, farmerLng], [factoryLat, factoryLng]];
    const selectedTransporter = allTransporters.find((t) => t.id === selectedTransporterId);

    allTransporters.forEach((t) => {
      if (!t.latitude || !t.longitude) return;

      const isSelected = t.id === selectedTransporterId;
      allPoints.push([t.latitude, t.longitude]);

      const markerColor = isSelected ? '#059669' : '#0284c7';
      const markerSymbol = isSelected ? '🚚⭐' : '🔵🚚';

      const truckMarker = L.marker([t.latitude, t.longitude], {
        icon: createCustomIcon(markerColor, markerSymbol, t.name.split(' ')[0], isSelected)
      }).addTo(map);

      // Popup Content Card showing Hub Proximity & Details
      const hubLabel = t.hub_location_tag || (t.distance_from_farmer_km <= 3 ? "Near Farmer Pickup" : "Near Factory Hub");
      const popupHtml = `
        <div style="font-family: sans-serif; min-width: 190px; padding: 4px;">
          <div style="background: #e0f2fe; color: #0369a1; font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px; display: inline-block; margin-bottom: 4px;">
            📍 ${hubLabel}
          </div>
          <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 800; color: #0f172a;">
            🚚 ${t.name}
          </h4>
          <div style="font-size: 12px; color: #475569; margin-bottom: 6px;">
            Truck: <strong>${t.vehicle_type}</strong> (${t.vehicle_number || 'AP-REG'})<br/>
            Capacity: <strong>${t.capacity_kg?.toLocaleString()} kg</strong><br/>
            From Farmer: <strong>${t.distance_from_farmer_km} km</strong><br/>
            From Factory: <strong>${t.distance_from_factory_km || '—'} km</strong><br/>
            ETA: <strong>${t.eta_minutes || 15} min</strong><br/>
            Est. Cost: <strong style="color: #059669;">₹${t.estimated_cost?.toLocaleString()}</strong> (₹${t.cost_per_kg?.toFixed(2)}/kg)<br/>
            Status: <span style="color: #16a34a; font-weight: bold;">Available</span>
          </div>
          ${onMarkerSelectTransporter ? `
            <button id="btn-select-map-${t.id}" style="
              width: 100%;
              background: #059669;
              color: white;
              border: none;
              padding: 6px;
              border-radius: 6px;
              font-size: 12px;
              font-weight: bold;
              cursor: pointer;
            ">
              SELECT THIS TRANSPORTER
            </button>
          ` : ''}
        </div>
      `;

      truckMarker.bindPopup(popupHtml);

      truckMarker.on('popupopen', () => {
        const btn = document.getElementById(`btn-select-map-${t.id}`);
        if (btn && onMarkerSelectTransporter) {
          btn.onclick = () => {
            onMarkerSelectTransporter(t);
            map.closePopup();
          };
        }
      });
    });

    // 4. Draw Polyline Route: Transporter -> Farmer -> Factory if selected
    if (selectedTransporter) {
      const path = [
        [selectedTransporter.latitude, selectedTransporter.longitude],
        [farmerLat, farmerLng],
        [factoryLat, factoryLng]
      ];
      L.polyline(path, {
        color: '#059669',
        weight: 5,
        opacity: 0.9,
        dashArray: '8, 8'
      }).addTo(map);
    } else {
      L.polyline([[farmerLat, farmerLng], [factoryLat, factoryLng]], {
        color: '#64748b',
        weight: 3,
        opacity: 0.6,
        dashArray: '4, 4'
      }).addTo(map);
    }

    // Fit map bounds to show ALL markers
    if (allPoints.length > 0) {
      const bounds = L.latLngBounds(allPoints);
      map.fitBounds(bounds, { padding: [40, 40] });
    }

  }, [farmerLat, farmerLng, factoryLat, factoryLng, allTransporters, selectedTransporterId, routeCoords]);

  return (
    <div style={{ position: 'relative' }}>
      <div style={{
        position: 'absolute',
        top: 12,
        right: 12,
        zIndex: 1000,
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(8px)',
        padding: '0.5rem 0.85rem',
        borderRadius: '0.65rem',
        fontSize: '0.75rem',
        fontWeight: 700,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <span>🟢 Farmer</span>
        <span>🔵 Available Transporters ({allTransporters.length})</span>
        <span>🔴 Factory</span>
      </div>
      <div ref={mapContainerRef} className="map-container" />
    </div>
  );
}
