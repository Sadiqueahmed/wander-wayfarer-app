import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Plus, Phone, Navigation, Fuel, Utensils } from 'lucide-react';

interface POI {
  id: string;
  name: string;
  coordinates: [number, number];
  type: 'fuel' | 'food';
  rating?: number;
  address?: string;
  isOpen?: boolean;
}

interface Waypoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'start' | 'end' | 'waypoint';
  address?: string;
}

interface RouteData {
  polyline?: any;
  distance?: number;
  duration?: number;
  coordinates?: [number, number][];
}

interface MapCanvasProps {
  waypoints: Waypoint[];
  routeData: RouteData;
  mapboxToken: string;
  onWaypointDrag?: (waypointId: string, lat: number, lng: number) => void;
  onLocationSelect?: (location: { lat: number; lng: number; address: string }) => void;
  isPickerMode?: boolean;
  className?: string;
  showPOIs?: boolean;
  poiFilters?: { fuel: boolean; food: boolean };
}

const MapCanvas: React.FC<MapCanvasProps> = ({
  waypoints,
  routeData,
  mapboxToken,
  onWaypointDrag,
  onLocationSelect,
  isPickerMode = false,
  className = '',
  showPOIs = false,
  poiFilters = { fuel: false, food: false }
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);
  const [pois, setPois] = useState<POI[]>([]);

  // Sample POIs for demonstration
  const samplePOIs: POI[] = [
    {
      id: 'fuel-1',
      name: 'Indian Oil Petrol Pump',
      coordinates: [77.2090, 28.6139],
      type: 'fuel',
      rating: 4.2,
      address: 'Connaught Place, New Delhi',
      isOpen: true
    },
    {
      id: 'food-1',
      name: 'Karim\'s Restaurant',
      coordinates: [77.2315, 28.6562],
      type: 'food',
      rating: 4.5,
      address: 'Jama Masjid, Old Delhi',
      isOpen: true
    },
    {
      id: 'fuel-2',
      name: 'HP Petrol Pump',
      coordinates: [78.0322, 30.3165],
      type: 'fuel',
      rating: 4.0,
      address: 'Dehradun, Uttarakhand'
    },
    {
      id: 'food-2',
      name: 'Garhwal Mandal Vikas',
      coordinates: [78.0322, 30.3165],
      type: 'food',
      rating: 4.3,
      address: 'ISBT, Dehradun'
    }
  ];

  const handleMapClick = useCallback(async (e: any) => {
    if (!isPickerMode || !onLocationSelect) return;

    const { lng, lat } = e.lngLat;
    
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxToken}`
      );
      const data = await response.json();
      const address = data.features[0]?.place_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      
      onLocationSelect({ lat, lng, address });
    } catch (error) {
      console.error('Geocoding failed:', error);
      onLocationSelect({ lat, lng, address: `${lat.toFixed(4)}, ${lng.toFixed(4)}` });
    }
  }, [isPickerMode, onLocationSelect, mapboxToken]);

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

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

    map.current.on('load', () => {
      setIsMapLoaded(true);
      
      // Add route source
      map.current!.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: []
          }
        }
      });

      // Add route layer
      map.current!.addLayer({
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
    });

    if (isPickerMode && onLocationSelect) {
      map.current.on('click', handleMapClick);
    }

    setPois(samplePOIs);

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken, isPickerMode, handleMapClick]);

  // Update markers when waypoints change
  useEffect(() => {
    if (!map.current || !isMapLoaded) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add new markers
    waypoints.forEach((waypoint, index) => {
      if (waypoint.lat === 0 && waypoint.lng === 0) return;

      const el = document.createElement('div');
      el.className = 'waypoint-marker';
      el.style.cssText = `
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 12px;
        cursor: pointer;
        border: 2px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        background-color: ${waypoint.type === 'start' ? '#22c55e' : waypoint.type === 'end' ? '#ef4444' : '#3b82f6'};
      `;
      el.textContent = waypoint.type === 'start' ? 'S' : waypoint.type === 'end' ? 'E' : String.fromCharCode(65 + index - 1);

      const marker = new mapboxgl.Marker({
        element: el,
        draggable: !!onWaypointDrag && !isPickerMode
      })
        .setLngLat([waypoint.lng, waypoint.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div class="p-2">
                <h3 class="font-semibold">${waypoint.name || waypoint.type}</h3>
                <p class="text-sm text-gray-600">${waypoint.address || waypoint.type}</p>
              </div>
            `)
        )
        .addTo(map.current!);

      // Add drag handler
      if (onWaypointDrag && !isPickerMode) {
        marker.on('dragend', () => {
          const lngLat = marker.getLngLat();
          onWaypointDrag(waypoint.id, lngLat.lat, lngLat.lng);
        });
      }

      markers.current.push(marker);
    });

    // Fit map to markers if there are valid waypoints
    const validWaypoints = waypoints.filter(wp => wp.lat !== 0 && wp.lng !== 0);
    if (validWaypoints.length > 0 && !isPickerMode) {
      const bounds = new mapboxgl.LngLatBounds();
      validWaypoints.forEach(wp => bounds.extend([wp.lng, wp.lat]));
      
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 12
      });
    }
  }, [waypoints, isMapLoaded, onWaypointDrag, isPickerMode]);

  // Update route polyline
  useEffect(() => {
    if (!map.current || !isMapLoaded) return;

    if (routeData.coordinates && routeData.coordinates.length > 0) {
      const source = map.current.getSource('route') as mapboxgl.GeoJSONSource;
      source?.setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: routeData.coordinates
        }
      });
    } else if (routeData.polyline) {
      const source = map.current.getSource('route') as mapboxgl.GeoJSONSource;
      source?.setData({
        type: 'Feature',
        properties: {},
        geometry: routeData.polyline
      });
    }
  }, [routeData, isMapLoaded]);

  // Update POI markers based on filters
  useEffect(() => {
    if (!map.current || !isMapLoaded || !showPOIs) return;

    // Remove existing POI markers
    const existingPOIMarkers = document.querySelectorAll('.poi-marker');
    existingPOIMarkers.forEach(marker => marker.remove());

    // Add filtered POI markers
    const filteredPOIs = pois.filter(poi => 
      (poiFilters?.fuel && poi.type === 'fuel') || 
      (poiFilters?.food && poi.type === 'food')
    );

    filteredPOIs.forEach(poi => {
      const el = document.createElement('div');
      el.className = 'poi-marker';
      el.style.cssText = `
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 12px;
        cursor: pointer;
        background-color: ${poi.type === 'fuel' ? '#f59e0b' : '#10b981'};
        border: 2px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.2);
      `;
      
      const icon = document.createElement('div');
      icon.innerHTML = poi.type === 'fuel' ? '⛽' : '🍽️';
      el.appendChild(icon);

      el.addEventListener('click', () => setSelectedPOI(poi));

      new mapboxgl.Marker({ element: el })
        .setLngLat(poi.coordinates)
        .addTo(map.current!);
    });
  }, [showPOIs, poiFilters, pois, isMapLoaded]);

  const addStopFromPOI = (poi: POI) => {
    // This would typically call a parent callback to add the POI as a waypoint
    console.log('Adding POI as stop:', poi);
    setSelectedPOI(null);
  };

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

      {/* POI Info Card */}
      {selectedPOI && !isPickerMode && (
        <Card className="absolute bottom-4 left-4 right-4 p-4 bg-background/95 backdrop-blur z-10">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {selectedPOI.type === 'fuel' ? 
                  <Fuel className="h-4 w-4 text-amber-500" /> : 
                  <Utensils className="h-4 w-4 text-emerald-500" />
                }
                <h3 className="font-semibold">{selectedPOI.name}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{selectedPOI.address}</p>
              <div className="flex items-center gap-4 mt-2">
                {selectedPOI.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">{selectedPOI.rating}</span>
                  </div>
                )}
                <Badge variant={selectedPOI.isOpen ? "default" : "secondary"}>
                  {selectedPOI.isOpen ? "Open" : "Closed"}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedPOI(null)}>
                <Phone className="h-4 w-4 mr-1" />
                Call
              </Button>
              <Button variant="outline" size="sm">
                <Navigation className="h-4 w-4 mr-1" />
                Directions
              </Button>
              <Button onClick={() => addStopFromPOI(selectedPOI)} className="gradient-hero text-white">
                <Plus className="h-4 w-4 mr-1" />
                Add Stop
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Picker mode instructions */}
      {isPickerMode && (
        <Card className="absolute top-4 left-4 right-4 p-3 bg-background/95 backdrop-blur z-10">
          <p className="text-sm text-center">
            Click on the map to select a location
          </p>
        </Card>
      )}
    </div>
  );
};

export default MapCanvas;