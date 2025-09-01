import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Trip {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  start_location: string;
  end_location: string;
  start_date?: string | null;
  end_date?: string | null;
  travelers: number;
  budget?: number | null;
  vehicle_type?: string | null;
  fuel_type?: string | null;
  mileage?: number | null;
  fuel_price?: number | null;
  total_distance?: number | null;
  estimated_fuel_cost?: number | null;
  status: string;
  is_public: boolean;
  trip_data?: any;
  created_at: string;
  updated_at: string;
  waypoints?: Waypoint[];
}

export interface Waypoint {
  id: string;
  trip_id: string;
  name: string;
  description?: string | null;
  coordinates?: any;
  address?: string | null;
  stop_order: number;
  estimated_time?: string | null;
  estimated_cost?: string | null;
  waypoint_type: string;
  created_at: string;
}

export const useTrips = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          waypoints (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTrips((data as any) || []);
    } catch (error) {
      console.error('Error fetching trips:', error);
      toast({
        title: "Error",
        description: "Failed to fetch trips",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createTrip = async (tripData: Partial<Trip>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Remove properties that don't exist in the database table
      const { waypoints, ...dbTripData } = tripData;
      
      const { data, error } = await supabase
        .from('trips')
        .insert({ ...dbTripData, user_id: user.id } as any)
        .select()
        .single();

      if (error) throw error;

      setTrips(prev => [data as Trip, ...prev]);
      toast({
        title: "Success",
        description: "Trip created successfully",
      });
      
      return data;
    } catch (error) {
      console.error('Error creating trip:', error);
      toast({
        title: "Error",
        description: "Failed to create trip",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateTrip = async (id: string, updates: Partial<Trip>) => {
    try {
      const { data, error } = await supabase
        .from('trips')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setTrips(prev => prev.map(trip => trip.id === id ? { ...trip, ...(data as Trip) } : trip));
      toast({
        title: "Success",
        description: "Trip updated successfully",
      });
      
      return data;
    } catch (error) {
      console.error('Error updating trip:', error);
      toast({
        title: "Error",
        description: "Failed to update trip",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteTrip = async (id: string) => {
    try {
      const { error } = await supabase
        .from('trips')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTrips(prev => prev.filter(trip => trip.id !== id));
      toast({
        title: "Success",
        description: "Trip deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting trip:', error);
      toast({
        title: "Error",
        description: "Failed to delete trip",
        variant: "destructive"
      });
    }
  };

  const addWaypoint = async (tripId: string, waypoint: Partial<Waypoint>) => {
    try {
      // Ensure required fields are present
      if (!waypoint.name || waypoint.stop_order === undefined) {
        throw new Error('Name and stop order are required for waypoints');
      }
      
      const { data, error } = await supabase
        .from('waypoints')
        .insert({ ...waypoint, trip_id: tripId } as any)
        .select()
        .single();

      if (error) throw error;

      setTrips(prev => prev.map(trip => 
        trip.id === tripId 
          ? { ...trip, waypoints: [...(trip.waypoints || []), data as Waypoint] }
          : trip
      ));

      return data;
    } catch (error) {
      console.error('Error adding waypoint:', error);
      toast({
        title: "Error",
        description: "Failed to add waypoint",
        variant: "destructive"
      });
      throw error;
    }
  };

  const removeWaypoint = async (waypointId: string) => {
    try {
      const { error } = await supabase
        .from('waypoints')
        .delete()
        .eq('id', waypointId);

      if (error) throw error;

      setTrips(prev => prev.map(trip => ({
        ...trip,
        waypoints: trip.waypoints?.filter(wp => wp.id !== waypointId) || []
      })));
    } catch (error) {
      console.error('Error removing waypoint:', error);
      toast({
        title: "Error",
        description: "Failed to remove waypoint",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  return {
    trips,
    loading,
    fetchTrips,
    createTrip,
    updateTrip,
    deleteTrip,
    addWaypoint,
    removeWaypoint
  };
};