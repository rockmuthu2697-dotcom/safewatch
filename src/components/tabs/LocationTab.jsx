import React, { useEffect, useRef, useState } from 'react';
import { useSafeWatch } from '../../context/SafeWatchContext';
import {
  MapPin,
  Navigation,
  Compass,
  ExternalLink,
  Shield,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  LocateFixed,
  Map as MapIcon,
  Crosshair,
  Building2,
  Info
} from 'lucide-react';

export default function LocationTab() {
  const {
    location,
    locationLoading,
    locationError,
    requestRealLocation,
    useSampleLocation,
    deviceState
  } = useSafeWatch();

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [mapInitialized, setMapInitialized] = useState(false);

  // Initialize or update Leaflet Map
  useEffect(() => {
    // Check if window.L (Leaflet) is loaded
    if (typeof window !== 'undefined' && window.L && mapContainerRef.current) {
      try {
        if (!mapInstanceRef.current) {
          // Initialize map
          const map = window.L.map(mapContainerRef.current, {
            center: [location.lat, location.lng],
            zoom: 15,
            zoomControl: true
          });

          // OpenStreetMap tile layer (Free, no API key required)
          window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);

          // Custom pulsing marker icon
          const customIcon = window.L.divIcon({
            className: 'custom-map-pin',
            html: `
              <div class="pin-pulse-wrapper">
                <div class="pin-pulse-wave"></div>
                <div class="pin-center-dot"></div>
              </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 16]
          });

          const marker = window.L.marker([location.lat, location.lng], { icon: customIcon })
            .addTo(map)
            .bindPopup(`<b>SAFEWATCH Carrier Location</b><br/>${location.address}`)
            .openPopup();

          mapInstanceRef.current = map;
          markerRef.current = marker;
          setMapInitialized(true);
        } else {
          // Update existing map
          mapInstanceRef.current.setView([location.lat, location.lng], 15);
          if (markerRef.current) {
            markerRef.current.setLatLng([location.lat, location.lng]);
            markerRef.current.setPopupContent(`<b>SAFEWATCH Carrier Location</b><br/>${location.address}`);
          }
        }
      } catch (err) {
        console.warn('Leaflet map initialization issue:', err);
      }
    }

    return () => {
      // Cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  // When location changes, update map view
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([location.lat, location.lng], 15);
      markerRef.current.setLatLng([location.lat, location.lng]);
      markerRef.current.setPopupContent(`<b>SAFEWATCH Carrier Location</b><br/>${location.address}`);
    }
  }, [location.lat, location.lng, location.address]);

  // Google Maps and OSM external links
  const googleMapsUrl = `https://www.google.com/maps?q=${location.lat},${location.lng}`;
  const osmUrl = `https://www.openstreetmap.org/?mlat=${location.lat}&mlon=${location.lng}#map=16/${location.lat}/${location.lng}`;

  return (
    <div className="tab-pane location-tab">
      <div className="tab-header-banner">
        <div>
          <h2 className="tab-title">Live Geolocation & Safety Corridor</h2>
          <p className="tab-description">
            Dual-mode GNSS tracking with real browser geolocation and demo lab fallbacks.
          </p>
        </div>
        <div className="tab-header-actions">
          <button
            onClick={requestRealLocation}
            disabled={locationLoading}
            className="btn-primary-purple"
          >
            <LocateFixed size={16} className={locationLoading ? 'animate-spin' : ''} />
            <span>{locationLoading ? 'Querying GPS...' : 'Request Real Browser Location'}</span>
          </button>

          <button
            onClick={useSampleLocation}
            className="btn-secondary"
            title="Switch back to predefined hackathon coordinates"
          >
            <RefreshCw size={14} />
            <span>Load Sample Coords</span>
          </button>
        </div>
      </div>

      {/* Disclaimers & Status Notice */}
      <div className={`location-status-bar ${location.isReal ? 'status-real' : 'status-sample'}`}>
        <div className="status-indicator-flex">
          {location.isReal ? (
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle size={18} className="text-amber-400 shrink-0" />
          )}
          <div>
            <strong>
              {location.isReal ? 'VERIFIED BROWSER GEOLOCATION:' : 'DEMO LAB SAMPLE COORDINATES:'}
            </strong>{' '}
            {location.isReal
              ? `Real device GPS acquired with ±${location.accuracy}m horizontal accuracy.`
              : 'These coordinates are predefined sample data for hackathon demonstration. They do not represent your actual physical location.'}
          </div>
        </div>
      </div>

      {/* Error banner if any */}
      {locationError && (
        <div className="location-error-alert">
          <Info size={16} />
          <span>{locationError}</span>
        </div>
      )}

      {/* GPS Off Alert from Hardware Simulator */}
      {deviceState.gpsStatus === 'offline' && (
        <div className="location-error-alert warning">
          <AlertCircle size={16} />
          <span>
            <strong>GPS HARDWARE OFF:</strong> Wearable GNSS module is currently offline. Showing last-known cached fix from{' '}
            {new Date(deviceState.lastKnownLocation?.timestamp || Date.now()).toLocaleTimeString()}.
          </span>
        </div>
      )}

      {/* Coordinates & Telemetry Cards */}
      <div className="coords-telemetry-row">
        <div className="coord-card">
          <span className="coord-label">Latitude</span>
          <span className="coord-value font-mono">{location.lat.toFixed(5)}° N</span>
        </div>
        <div className="coord-card">
          <span className="coord-label">Longitude</span>
          <span className="coord-value font-mono">{location.lng.toFixed(5)}° E</span>
        </div>
        <div className="coord-card">
          <span className="coord-label">Horizontal Accuracy</span>
          <span className="coord-value">
            {location.isReal ? `±${location.accuracy} meters` : 'High Precision Demo (±4.8m)'}
          </span>
        </div>
        <div className="coord-card">
          <span className="coord-label">Data Origin</span>
          <span className="coord-value">
            {location.isReal ? 'Real HTML5 Geolocation' : 'Predefined Sample Benchmark'}
          </span>
        </div>
      </div>

      {/* Interactive Map View */}
      <div className="map-view-shell">
        <div className="map-toolbar">
          <div className="map-toolbar-title">
            <MapIcon size={16} className="text-cyan-400" />
            <span>Interactive Safety GIS Layer</span>
          </div>

          <div className="map-external-links">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="map-ext-btn"
            >
              <ExternalLink size={13} />
              <span>Open in Google Maps</span>
            </a>
            <a
              href={osmUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="map-ext-btn"
            >
              <ExternalLink size={13} />
              <span>OpenStreetMap</span>
            </a>
          </div>
        </div>

        {/* Leaflet Map DOM Element */}
        <div className="map-leaflet-wrapper">
          <div ref={mapContainerRef} className="map-canvas-element"></div>
          {/* Overlay radar scan element */}
          <div className="map-overlay-hud">
            <div className="hud-corner top-left"></div>
            <div className="hud-corner top-right"></div>
            <div className="hud-corner bottom-left"></div>
            <div className="hud-corner bottom-right"></div>
            <div className="hud-crosshair">
              <Crosshair size={24} className="text-cyan-400 opacity-60" />
            </div>
            <div className="hud-telemetry-overlay font-mono">
              GPS FIX: {location.isReal ? 'LIVE-SAT' : 'SIM-LAB'} // {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
            </div>
          </div>
        </div>

        {/* Safety Zones & Emergency Landmarks */}
        <div className="safety-landmarks-panel">
          <div className="landmarks-heading">
            <Shield size={16} className="text-emerald-400" />
            <span>Nearest Verified Women Safety Zones (Simulated Proximity)</span>
          </div>
          <div className="landmarks-grid">
            <div className="landmark-item">
              <div className="landmark-dot safe"></div>
              <div className="landmark-info">
                <strong>24/7 Pink Police Patrol Booth</strong>
                <span>320m away • Response time ~2 mins</span>
              </div>
            </div>
            <div className="landmark-item">
              <div className="landmark-dot safe"></div>
              <div className="landmark-info">
                <strong>Metro Transit Security Desk</strong>
                <span>650m away • Monitored CCTV corridor</span>
              </div>
            </div>
            <div className="landmark-item">
              <div className="landmark-dot safe"></div>
              <div className="landmark-info">
                <strong>Apollo 24/7 First Aid Center</strong>
                <span>800m away • Emergency medical staff</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
