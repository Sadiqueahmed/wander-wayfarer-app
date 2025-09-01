-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create trips table
CREATE TABLE public.trips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_location TEXT NOT NULL,
  end_location TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  travelers INTEGER DEFAULT 1,
  budget DECIMAL(10,2),
  vehicle_type TEXT,
  fuel_type TEXT,
  mileage DECIMAL(5,2),
  fuel_price DECIMAL(5,2),
  total_distance DECIMAL(8,2),
  estimated_fuel_cost DECIMAL(10,2),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'planned', 'active', 'completed')),
  is_public BOOLEAN DEFAULT false,
  trip_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for trips
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

-- Create policies for trips
CREATE POLICY "Users can view their own trips" 
ON public.trips 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Public trips are viewable by everyone" 
ON public.trips 
FOR SELECT 
USING (is_public = true);

CREATE POLICY "Users can create their own trips" 
ON public.trips 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trips" 
ON public.trips 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trips" 
ON public.trips 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create waypoints table
CREATE TABLE public.waypoints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  coordinates POINT,
  address TEXT,
  stop_order INTEGER NOT NULL,
  estimated_time TEXT,
  estimated_cost TEXT,
  waypoint_type TEXT DEFAULT 'destination' CHECK (waypoint_type IN ('start', 'waypoint', 'end', 'fuel', 'restaurant', 'attraction')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for waypoints
ALTER TABLE public.waypoints ENABLE ROW LEVEL SECURITY;

-- Create policies for waypoints
CREATE POLICY "Users can view waypoints of their trips" 
ON public.waypoints 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.trips 
  WHERE trips.id = waypoints.trip_id 
  AND (trips.user_id = auth.uid() OR trips.is_public = true)
));

CREATE POLICY "Users can create waypoints for their trips" 
ON public.waypoints 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.trips 
  WHERE trips.id = waypoints.trip_id 
  AND trips.user_id = auth.uid()
));

CREATE POLICY "Users can update waypoints of their trips" 
ON public.waypoints 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.trips 
  WHERE trips.id = waypoints.trip_id 
  AND trips.user_id = auth.uid()
));

CREATE POLICY "Users can delete waypoints of their trips" 
ON public.waypoints 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.trips 
  WHERE trips.id = waypoints.trip_id 
  AND trips.user_id = auth.uid()
));

-- Create destinations table
CREATE TABLE public.destinations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  state TEXT,
  category TEXT NOT NULL CHECK (category IN ('nature', 'heritage', 'adventure', 'food', 'culture')),
  coordinates POINT,
  rating DECIMAL(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  entry_fee TEXT,
  best_time TEXT,
  duration TEXT,
  highlights TEXT[],
  images TEXT[],
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for destinations (public read)
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Destinations are viewable by everyone" 
ON public.destinations 
FOR SELECT 
USING (true);

-- Create trip reviews table
CREATE TABLE public.trip_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  images TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for reviews
ALTER TABLE public.trip_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are viewable by everyone" 
ON public.trip_reviews 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own reviews" 
ON public.trip_reviews 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trips_updated_at
  BEFORE UPDATE ON public.trips
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_destinations_updated_at
  BEFORE UPDATE ON public.destinations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample destinations data
INSERT INTO public.destinations (name, description, location, state, category, coordinates, rating, review_count, entry_fee, best_time, duration, highlights, images, is_featured) VALUES
('Kaziranga National Park', 'Home to the world''s largest population of one-horned rhinoceros', 'Kaziranga, Assam', 'Assam', 'nature', POINT(93.3712, 26.5775), 4.8, 2847, '₹300', 'Nov - Apr', '2-3 days', ARRAY['One-horned rhino', 'Tiger reserve', 'Elephant safari', 'Bird watching'], ARRAY['/placeholder.svg'], true),
('Shillong Peak', 'Highest point in Shillong offering panoramic views of the city', 'Shillong, Meghalaya', 'Meghalaya', 'nature', POINT(91.8933, 25.5788), 4.6, 1523, 'Free', 'Oct - May', 'Half day', ARRAY['Panoramic views', 'Sunset point', 'Photography', 'Cool climate'], ARRAY['/placeholder.svg'], false),
('Tawang Monastery', 'Largest monastery in India and second largest in the world', 'Tawang, Arunachal Pradesh', 'Arunachal Pradesh', 'heritage', POINT(91.8622, 27.5856), 4.9, 984, 'Free', 'Mar - Oct', '1 day', ARRAY['Buddhist architecture', 'Ancient manuscripts', 'Mountain views', 'Peaceful ambiance'], ARRAY['/placeholder.svg'], true),
('Living Root Bridges', 'Unique bridges made from living tree roots by the Khasi tribes', 'Cherrapunji, Meghalaya', 'Meghalaya', 'adventure', POINT(91.7362, 25.2631), 4.7, 2156, '₹50', 'Oct - Mar', '1-2 days', ARRAY['Bio-engineering marvel', 'Trekking', 'Double decker bridge', 'Natural pools'], ARRAY['/placeholder.svg'], true),
('Majuli Island', 'World''s largest river island and cultural hub of Assam', 'Majuli, Assam', 'Assam', 'heritage', POINT(94.2037, 27.0530), 4.5, 876, 'Free', 'Nov - Mar', '2 days', ARRAY['Neo-Vaishnavite culture', 'Satras (monasteries)', 'Bird watching', 'Traditional crafts'], ARRAY['/placeholder.svg'], false),
('Hornbill Festival', 'Festival of festivals showcasing Naga tribal culture', 'Kohima, Nagaland', 'Nagaland', 'culture', POINT(94.1086, 25.6747), 4.8, 1234, '₹200', 'Dec 1-10', '3-5 days', ARRAY['Traditional dances', 'Local cuisine', 'Handicrafts', 'Rock concerts'], ARRAY['/placeholder.svg'], true),
('Ziro Valley', 'UNESCO World Heritage Site with Apatani tribal culture', 'Ziro, Arunachal Pradesh', 'Arunachal Pradesh', 'nature', POINT(93.8548, 27.5883), 4.8, 567, 'Free', 'Mar-May, Sep-Nov', '3-4 days', ARRAY['Music Festival', 'Pine Groves', 'Tribal Culture', 'Rice Terraces'], ARRAY['/placeholder.svg'], true),
('Mawlynnong Village', 'Cleanest village in Asia with unique living root bridges', 'Mawlynnong, Meghalaya', 'Meghalaya', 'culture', POINT(91.8817, 25.2028), 4.6, 432, '₹20', 'Oct - Mar', '1 day', ARRAY['Cleanest village', 'Living root bridge', 'Tree house', 'Traditional lifestyle'], ARRAY['/placeholder.svg'], false);