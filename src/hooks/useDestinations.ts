import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Destination {
  id: string;
  name: string;
  description?: string | null;
  location: string;
  state?: string | null;
  category: string;
  coordinates?: any;
  rating: number;
  review_count: number;
  entry_fee?: string | null;
  best_time?: string | null;
  duration?: string | null;
  highlights: string[];
  images: string[];
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export const useDestinations = () => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchDestinations = async (filters?: {
    category?: string;
    search?: string;
    featured?: boolean;
  }) => {
    setLoading(true);
    try {
      let query = supabase.from('destinations').select('*');

      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,location.ilike.%${filters.search}%`);
      }

      if (filters?.featured !== undefined) {
        query = query.eq('is_featured', filters.featured);
      }

      const { data, error } = await query.order('rating', { ascending: false });

      if (error) throw error;
      setDestinations((data as any) || []);
    } catch (error) {
      console.error('Error fetching destinations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch destinations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getFeaturedDestinations = async () => {
    try {
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .eq('is_featured', true)
        .order('rating', { ascending: false })
        .limit(6);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching featured destinations:', error);
      return [];
    }
  };

  const searchDestinations = async (query: string) => {
    try {
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .or(`name.ilike.%${query}%,location.ilike.%${query}%,description.ilike.%${query}%`)
        .order('rating', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching destinations:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchDestinations();
  }, []);

  return {
    destinations,
    loading,
    fetchDestinations,
    getFeaturedDestinations,
    searchDestinations
  };
};