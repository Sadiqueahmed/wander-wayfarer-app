import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  MapPin, 
  Navigation, 
  DollarSign, 
  Plus, 
  GripVertical,
  Trash2,
  Calendar,
  Bed,
  Camera,
  Edit,
  Save,
  X
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

interface DayItem {
  id: string;
  type: 'leg' | 'poi' | 'note' | 'lodging' | 'photo';
  title: string;
  details?: string;
  time?: string;
  cost?: string;
  lat?: number;
  lng?: number;
  distanceKm?: number;
  durationMin?: number;
}

interface DayPlan {
  id: string;
  date?: string;
  items: DayItem[];
  summary: {
    distanceKm: number;
    durationMin: number;
    estimatedCost: number;
  };
}

interface Waypoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'start' | 'end' | 'waypoint';
}

interface RouteData {
  distance?: number;
  duration?: number;
  steps?: any[];
}

interface DayByDayProps {
  waypoints: Waypoint[];
  routeData: RouteData;
  onDaysChange?: (days: DayPlan[]) => void;
}

const DayByDay: React.FC<DayByDayProps> = ({ waypoints, routeData, onDaysChange }) => {
  const [days, setDays] = useState<DayPlan[]>([]);
  const [editingItem, setEditingItem] = useState<string | null>(null);

  // Auto-generate days from route data
  useEffect(() => {
    console.log('DayByDay: Checking for regeneration', { 
      hasDistance: !!routeData.distance, 
      waypointsCount: waypoints.length,
      waypoints 
    });
    
    if (!routeData.distance || waypoints.length < 2) {
      console.log('DayByDay: Not enough data to generate');
      return;
    }

    const validWaypoints = waypoints.filter(wp => wp.lat !== 0 && wp.lng !== 0);
    console.log('DayByDay: Valid waypoints:', validWaypoints.length);
    
    if (validWaypoints.length < 2) {
      console.log('DayByDay: Not enough valid waypoints');
      return;
    }

    const newDays: DayPlan[] = [];
    const totalDistance = routeData.distance;
    const avgDailyDistance = 400; // km per day
    const numDays = Math.max(1, Math.ceil(totalDistance / avgDailyDistance));

    for (let i = 0; i < numDays; i++) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + i);
      
      const dayDistance = i === numDays - 1 
        ? totalDistance - (i * avgDailyDistance)
        : avgDailyDistance;
      
      const dayDuration = (dayDistance / totalDistance) * (routeData.duration || 0);
      
      const dayItems: DayItem[] = [];

      // Add route leg for the day
      const fromWaypoint = i < validWaypoints.length ? validWaypoints[i] : validWaypoints[validWaypoints.length - 1];
      const toWaypoint = i + 1 < validWaypoints.length ? validWaypoints[i + 1] : null;
      
      if (toWaypoint) {
        dayItems.push({
          id: `leg-${i}`,
          type: 'leg',
          title: `${fromWaypoint?.name || 'Start'} to ${toWaypoint?.name || 'Next Stop'}`,
          details: `Drive ${dayDistance.toFixed(0)} km`,
          time: `${Math.floor(dayDuration / 60)}h ${Math.floor(dayDuration % 60)}m`,
          distanceKm: dayDistance,
          durationMin: dayDuration,
          lat: toWaypoint.lat,
          lng: toWaypoint.lng
        });
      }

      // Add arrival at destination
      const destinationWaypoint = i + 1 < validWaypoints.length ? validWaypoints[i + 1] : validWaypoints[validWaypoints.length - 1];
      
      dayItems.push({
        id: `arrival-${i}`,
        type: 'poi',
        title: `Explore ${destinationWaypoint?.name || 'Destination'}`,
        details: 'Visit local attractions and landmarks',
        time: '2-3 hours',
        lat: destinationWaypoint.lat,
        lng: destinationWaypoint.lng
      });

      // Add lodging suggestion
      dayItems.push({
        id: `lodging-${i}`,
        type: 'lodging',
        title: 'Find accommodation',
        details: 'Hotel or guesthouse',
        cost: '₹2,000 - ₹4,000'
      });

      newDays.push({
        id: `day-${i}`,
        date: startDate.toISOString().split('T')[0],
        items: dayItems,
        summary: {
          distanceKm: dayDistance,
          durationMin: dayDuration,
          estimatedCost: 3000 + (Math.random() * 2000) // Mock cost calculation
        }
      });
    }

    console.log('DayByDay: Generated days:', newDays.length);
    setDays(newDays);
  }, [waypoints, routeData]);

  // Notify parent of changes
  useEffect(() => {
    if (onDaysChange) {
      onDaysChange(days);
    }
  }, [days, onDaysChange]);

  const addItemToDay = (dayId: string, type: DayItem['type']) => {
    const newItem: DayItem = {
      id: `${type}-${Date.now()}`,
      type,
      title: '',
      details: '',
      time: ''
    };

    setDays(prev => prev.map(day => 
      day.id === dayId 
        ? { ...day, items: [...day.items, newItem] }
        : day
    ));

    setEditingItem(newItem.id);
  };

  const updateItem = (dayId: string, itemId: string, updates: Partial<DayItem>) => {
    setDays(prev => prev.map(day => 
      day.id === dayId 
        ? {
            ...day,
            items: day.items.map(item => 
              item.id === itemId ? { ...item, ...updates } : item
            )
          }
        : day
    ));
  };

  const removeItem = (dayId: string, itemId: string) => {
    setDays(prev => prev.map(day => 
      day.id === dayId 
        ? { ...day, items: day.items.filter(item => item.id !== itemId) }
        : day
    ));
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const sourceDayId = result.source.droppableId;
    const destDayId = result.destination.droppableId;
    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;

    if (sourceDayId === destDayId) {
      // Reorder within same day
      setDays(prev => prev.map(day => {
        if (day.id === sourceDayId) {
          const newItems = Array.from(day.items);
          const [removed] = newItems.splice(sourceIndex, 1);
          newItems.splice(destIndex, 0, removed);
          return { ...day, items: newItems };
        }
        return day;
      }));
    } else {
      // Move between days
      setDays(prev => {
        const newDays = prev.map(day => ({ ...day, items: [...day.items] }));
        const sourceDay = newDays.find(d => d.id === sourceDayId)!;
        const destDay = newDays.find(d => d.id === destDayId)!;
        
        const [movedItem] = sourceDay.items.splice(sourceIndex, 1);
        destDay.items.splice(destIndex, 0, movedItem);
        
        return newDays;
      });
    }
  };

  const splitDay = (dayId: string) => {
    const dayIndex = days.findIndex(d => d.id === dayId);
    if (dayIndex === -1) return;

    const day = days[dayIndex];
    const midPoint = Math.floor(day.items.length / 2);
    
    const firstHalf = {
      ...day,
      id: `${day.id}-a`,
      items: day.items.slice(0, midPoint),
      summary: {
        ...day.summary,
        distanceKm: day.summary.distanceKm / 2,
        durationMin: day.summary.durationMin / 2,
        estimatedCost: day.summary.estimatedCost / 2
      }
    };

    const secondHalf = {
      ...day,
      id: `${day.id}-b`,
      date: new Date(new Date(day.date!).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: day.items.slice(midPoint),
      summary: {
        ...day.summary,
        distanceKm: day.summary.distanceKm / 2,
        durationMin: day.summary.durationMin / 2,
        estimatedCost: day.summary.estimatedCost / 2
      }
    };

    const newDays = [...days];
    newDays.splice(dayIndex, 1, firstHalf, secondHalf);
    setDays(newDays);
  };

  const mergeDays = (dayId: string) => {
    const dayIndex = days.findIndex(d => d.id === dayId);
    if (dayIndex === -1 || dayIndex === days.length - 1) return;

    const currentDay = days[dayIndex];
    const nextDay = days[dayIndex + 1];
    
    const mergedDay = {
      ...currentDay,
      items: [...currentDay.items, ...nextDay.items],
      summary: {
        distanceKm: currentDay.summary.distanceKm + nextDay.summary.distanceKm,
        durationMin: currentDay.summary.durationMin + nextDay.summary.durationMin,
        estimatedCost: currentDay.summary.estimatedCost + nextDay.summary.estimatedCost
      }
    };

    const newDays = [...days];
    newDays.splice(dayIndex, 2, mergedDay);
    setDays(newDays);
  };

  const getItemIcon = (type: DayItem['type']) => {
    switch (type) {
      case 'leg': return Navigation;
      case 'poi': return MapPin;
      case 'note': return Edit;
      case 'lodging': return Bed;
      case 'photo': return Camera;
      default: return Clock;
    }
  };

  const getItemColor = (type: DayItem['type']) => {
    switch (type) {
      case 'leg': return 'text-blue-500';
      case 'poi': return 'text-green-500';
      case 'note': return 'text-gray-500';
      case 'lodging': return 'text-purple-500';
      case 'photo': return 'text-pink-500';
      default: return 'text-gray-500';
    }
  };

  if (days.length === 0) {
    return (
      <Card className="p-12">
        <div className="text-center space-y-4">
          <MapPin className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
          <div>
            <h3 className="text-lg font-semibold mb-2">No Itinerary Yet</h3>
            <p className="text-muted-foreground">
              Plan your route first, and we'll automatically generate a day-by-day itinerary for you.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Day-by-Day Itinerary
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Your personalized travel schedule
          </p>
        </div>
        <div className="flex gap-2 text-sm">
          <Badge variant="outline" className="gap-1">
            <Calendar className="h-3 w-3" />
            {days.length} {days.length === 1 ? 'day' : 'days'}
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Navigation className="h-3 w-3" />
            {days.reduce((acc, day) => acc + day.summary.distanceKm, 0).toFixed(0)} km
          </Badge>
          <Badge variant="outline" className="gap-1">
            <DollarSign className="h-3 w-3" />
            ₹{days.reduce((acc, day) => acc + day.summary.estimatedCost, 0).toFixed(0)}
          </Badge>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="space-y-6">
          {days.map((day, dayIndex) => (
            <Card key={day.id} className="overflow-hidden border-l-4 border-l-primary/30 hover:border-l-primary transition-colors animate-fade-in">
              <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        Day {dayIndex + 1}
                        {day.date && (
                          <span className="text-sm font-normal text-muted-foreground">
                            • {new Date(day.date).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </span>
                        )}
                      </CardTitle>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => splitDay(day.id)}
                      className="text-xs"
                    >
                      Split Day
                    </Button>
                    {dayIndex < days.length - 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => mergeDays(day.id)}
                        className="text-xs"
                      >
                        Merge
                      </Button>
                    )}
                  </div>
                </div>

                {/* Day Summary Stats */}
                <div className="flex items-center gap-4 mt-3 text-sm">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-background rounded-full">
                    <Navigation className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">{day.summary.distanceKm.toFixed(0)}</span>
                    <span className="text-muted-foreground">km</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-background rounded-full">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <span className="font-medium">{Math.floor(day.summary.durationMin / 60)}h {Math.floor(day.summary.durationMin % 60)}m</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-background rounded-full">
                    <DollarSign className="h-4 w-4 text-green-500" />
                    <span className="font-medium">₹{day.summary.estimatedCost.toFixed(0)}</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-4">
                <Droppable droppableId={day.id}>
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-3"
                    >
                      {day.items.map((item, index) => (
                        <Draggable key={item.id} draggableId={item.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`group relative pl-8 ${
                                snapshot.isDragging ? 'z-50' : ''
                              }`}
                            >
                              {/* Timeline connector */}
                              {index < day.items.length - 1 && (
                                <div className="absolute left-2.5 top-8 h-full w-0.5 bg-border" />
                              )}
                              
                              {/* Timeline dot */}
                              <div className="absolute left-0 top-2 h-5 w-5 rounded-full border-2 border-background bg-primary/20 flex items-center justify-center">
                                {React.createElement(getItemIcon(item.type), {
                                  className: `h-3 w-3 ${getItemColor(item.type)}`
                                })}
                              </div>

                              <div
                                className={`p-4 rounded-lg border transition-all ${
                                  snapshot.isDragging 
                                    ? 'shadow-lg bg-background border-primary scale-105' 
                                    : 'hover:bg-muted/50 hover:border-primary/30'
                                }`}
                              >
                                <div className="flex items-start space-x-3">
                                  <div {...provided.dragHandleProps} className="mt-1">
                                    <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-move" />
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    {editingItem === item.id ? (
                                      <div className="space-y-3">
                                        <Input
                                          value={item.title}
                                          onChange={(e) => updateItem(day.id, item.id, { title: e.target.value })}
                                          placeholder="Title"
                                          className="font-medium"
                                        />
                                        <Textarea
                                          value={item.details || ''}
                                          onChange={(e) => updateItem(day.id, item.id, { details: e.target.value })}
                                          placeholder="Add details..."
                                          rows={2}
                                        />
                                        <div className="flex gap-2">
                                          <Input
                                            value={item.time || ''}
                                            onChange={(e) => updateItem(day.id, item.id, { time: e.target.value })}
                                            placeholder="Duration"
                                            className="w-32"
                                          />
                                          <Input
                                            value={item.cost || ''}
                                            onChange={(e) => updateItem(day.id, item.id, { cost: e.target.value })}
                                            placeholder="Cost"
                                            className="w-32"
                                          />
                                        </div>
                                        <div className="flex gap-2">
                                          <Button
                                            size="sm"
                                            onClick={() => setEditingItem(null)}
                                          >
                                            <Save className="h-4 w-4 mr-1" />
                                            Save
                                          </Button>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setEditingItem(null)}
                                          >
                                            <X className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div>
                                        <div className="flex items-start justify-between gap-2">
                                          <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-sm leading-tight mb-1">
                                              {item.title || 'Untitled'}
                                            </h4>
                                            {item.details && (
                                              <p className="text-sm text-muted-foreground leading-relaxed">
                                                {item.details}
                                              </p>
                                            )}
                                          </div>
                                          <div className="flex flex-wrap gap-1.5 items-start">
                                            {item.time && (
                                              <Badge variant="secondary" className="text-xs whitespace-nowrap">
                                                <Clock className="h-3 w-3 mr-1" />
                                                {item.time}
                                              </Badge>
                                            )}
                                            {item.cost && (
                                              <Badge variant="outline" className="text-xs whitespace-nowrap">
                                                <DollarSign className="h-3 w-3 mr-1" />
                                                {item.cost}
                                              </Badge>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setEditingItem(item.id)}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeItem(day.id, item.id)}
                                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>

                {/* Add Item Buttons */}
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addItemToDay(day.id, 'poi')}
                    className="text-xs"
                  >
                    <MapPin className="h-3 w-3 mr-1" />
                    Add Stop
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addItemToDay(day.id, 'note')}
                    className="text-xs"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Add Note
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addItemToDay(day.id, 'lodging')}
                    className="text-xs"
                  >
                    <Bed className="h-3 w-3 mr-1" />
                    Add Stay
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addItemToDay(day.id, 'photo')}
                    className="text-xs"
                  >
                    <Camera className="h-3 w-3 mr-1" />
                    Add Photo Spot
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default DayByDay;