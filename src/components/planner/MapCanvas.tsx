import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface Waypoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'start' | 'end' | 'waypoint';
}

interface RouteData {
  polyline?: any;
  distance?: number;
  duration?: number;
}

interface MapCanvasProps {
  waypoints: Waypoint[];
  routeData: RouteData;
  mapboxToken: string;
  onWaypointDrag?: (waypointId: string, lat: number, lng: number) => void;
  className?: string;
  showPOIs?: boolean;
  poiFilters?: { fuel: boolean; food: boolean };
}

const MapCanvas: React.FC<MapCanvasProps> = ({
  waypoints,
  routeData,
  mapboxToken,
  onWaypointDrag,
  className = '',
  showPOIs = false,
  poiFilters = { fuel: false, food: false }
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center: [78.9629, 20.5937],
      zoom: 5,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

    map.current.on('load', () => {
      setIsMapLoaded(true);
    });

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken]);

  // Update markers when waypoints change
  useEffect(() => {
    if (!map.current || !isMapLoaded) return;

    // Clear existing markers
    Object.values(markers.current).forEach(marker => marker.remove());
    markers.current = {};

    // Add new markers
    waypoints.forEach((waypoint) => {
      if (waypoint.lat === 0 && waypoint.lng === 0) return;

      const markerColor = 
        waypoint.type === 'start' ? '#ff6b35' :
        waypoint.type === 'end' ? '#ef4444' :
        '#22c55e';

      const marker = new mapboxgl.Marker({
        color: markerColor,
        draggable: !!onWaypointDrag
      })
        .setLngLat([waypoint.lng, waypoint.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div class="p-2">
                <h3 class="font-semibold">${waypoint.name || waypoint.type}</h3>
                <p class="text-sm text-gray-600">${waypoint.type}</p>
              </div>
            `)
        )
        .addTo(map.current!);

      // Add drag handler
      if (onWaypointDrag) {
        marker.on('dragend', () => {
          const lngLat = marker.getLngLat();
          onWaypointDrag(waypoint.id, lngLat.lat, lngLat.lng);
        });
      }

      markers.current[waypoint.id] = marker;
    });

    // Fit map to markers if there are valid waypoints
    const validWaypoints = waypoints.filter(wp => wp.lat !== 0 && wp.lng !== 0);
    if (validWaypoints.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      validWaypoints.forEach(wp => bounds.extend([wp.lng, wp.lat]));
      
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 12
      });
    }
  }, [waypoints, isMapLoaded, onWaypointDrag]);

  // Update route polyline
  useEffect(() => {
    if (!map.current || !isMapLoaded || !routeData.polyline) return;

    // Remove existing route layer
    if (map.current.getLayer('route')) {
      map.current.removeLayer('route');
      map.current.removeSource('route');
    }

    // Add new route
    map.current.addSource('route', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: routeData.polyline
      }
    });

    map.current.addLayer({
      id: 'route',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#ff6b35',
        'line-width': 4,
        'line-opacity': 0.8
      }
    });
  }, [routeData, isMapLoaded]);

  // Handle POI display
  useEffect(() => {
    if (!map.current || !isMapLoaded || !showPOIs) return;

    // Remove existing POI layers
    ['fuel-pois', 'food-pois'].forEach(layerId => {
      if (map.current!.getLayer(layerId)) {
        map.current!.removeLayer(layerId);
        map.current!.removeSource(layerId);
      }
    });

    // Add POI layers based on filters
    if (poiFilters.fuel) {
      // Add mock fuel stations
      const fuelStations = {
        type: 'FeatureCollection',
        features: waypoints.slice(0, 3).map((wp, index) => ({
          type: 'Feature',
          properties: {
            name: `Fuel Station ${index + 1}`,
            type: 'fuel'
          },
          geometry: {
            type: 'Point',
            coordinates: [wp.lng + (Math.random() - 0.5) * 0.1, wp.lat + (Math.random() - 0.5) * 0.1]
          }
        }))
      };

      map.current.addSource('fuel-pois', {
        type: 'geojson',
        data: fuelStations as any
      });

      map.current.addLayer({
        id: 'fuel-pois',
        type: 'circle',
        source: 'fuel-pois',
        paint: {
          'circle-radius': 8,
          'circle-color': '#3b82f6',
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 2
        }
      });
    }

    if (poiFilters.food) {
      // Add mock restaurants
      const restaurants = {
        type: 'FeatureCollection',
        features: waypoints.slice(0, 3).map((wp, index) => ({
          type: 'Feature',
          properties: {
            name: `Restaurant ${index + 1}`,
            type: 'food'
          },
          geometry: {
            type: 'Point',
            coordinates: [wp.lng + (Math.random() - 0.5) * 0.1, wp.lat + (Math.random() - 0.5) * 0.1]
          }
        }))
      };

      map.current.addSource('food-pois', {
        type: 'geojson',
        data: restaurants as any
      });

      map.current.addLayer({
        id: 'food-pois',
        type: 'circle',
        source: 'food-pois',
        paint: {
          'circle-radius': 8,
          'circle-color': '#f59e0b',
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 2
        }
      });
    }
  }, [showPOIs, poiFilters, waypoints, isMapLoaded]);

  return (
    <div className={`relative ${className}`}>
      <div ref={mapContainer} className="w-full h-full rounded-lg" />
      
      {/* Loading overlay */}
      {!isMapLoaded && (
        <div className="absolute inset-0 bg-muted/50 backdrop-blur-sm rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapCanvas;