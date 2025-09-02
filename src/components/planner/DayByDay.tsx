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
    if (!routeData.distance || waypoints.length < 2) return;

    const validWaypoints = waypoints.filter(wp => wp.lat !== 0 && wp.lng !== 0);
    if (validWaypoints.length < 2) return;

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
      if (i < validWaypoints.length - 1) {
        dayItems.push({
          id: `leg-${i}`,
          type: 'leg',
          title: `${validWaypoints[i]?.name || 'Start'} to ${validWaypoints[i + 1]?.name || 'Next Stop'}`,
          details: `Drive ${dayDistance.toFixed(0)} km`,
          time: `${Math.floor(dayDuration / 60)}h ${Math.floor(dayDuration % 60)}m`,
          distanceKm: dayDistance,
          durationMin: dayDuration
        });
      }

      // Add arrival at destination
      if (i < validWaypoints.length - 1) {
        dayItems.push({
          id: `arrival-${i}`,
          type: 'poi',
          title: `Arrive at ${validWaypoints[i + 1]?.name || 'Destination'}`,
          details: 'Explore the area',
          time: '2-3 hours'
        });
      }

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Day-by-Day Itinerary</h2>
        <div className="flex gap-2 text-sm text-muted-foreground">
          <span>{days.length} days</span>
          <span>•</span>
          <span>{days.reduce((acc, day) => acc + day.summary.distanceKm, 0).toFixed(0)} km total</span>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="space-y-6">
          {days.map((day, dayIndex) => (
            <Card key={day.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <CardTitle className="text-lg">
                        Day {dayIndex + 1}
                        {day.date && (
                          <span className="ml-2 text-sm font-normal text-muted-foreground">
                            {new Date(day.date).toLocaleDateString()}
                          </span>
                        )}
                      </CardTitle>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => splitDay(day.id)}
                    >
                      Split Day
                    </Button>
                    {dayIndex < days.length - 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => mergeDays(day.id)}
                      >
                        Merge with Next
                      </Button>
                    )}
                  </div>
                </div>

                {/* Day Summary */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Navigation className="h-4 w-4 mr-1" />
                    {day.summary.distanceKm.toFixed(0)} km
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {Math.floor(day.summary.durationMin / 60)}h {Math.floor(day.summary.durationMin % 60)}m
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" />
                    ₹{day.summary.estimatedCost.toFixed(0)}
                  </div>
                </div>
              </CardHeader>

              <CardContent>
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
                              className={`p-3 rounded-lg border transition-colors ${
                                snapshot.isDragging ? 'shadow-lg bg-background' : 'hover:bg-muted/50'
                              }`}
                            >
                              <div className="flex items-start space-x-3">
                                <div {...provided.dragHandleProps}>
                                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                                </div>
                                
                                {React.createElement(getItemIcon(item.type), {
                                  className: `h-5 w-5 ${getItemColor(item.type)}`
                                })}

                                <div className="flex-1">
                                  {editingItem === item.id ? (
                                    <div className="space-y-2">
                                      <Input
                                        value={item.title}
                                        onChange={(e) => updateItem(day.id, item.id, { title: e.target.value })}
                                        placeholder="Title"
                                      />
                                      <Textarea
                                        value={item.details || ''}
                                        onChange={(e) => updateItem(day.id, item.id, { details: e.target.value })}
                                        placeholder="Details"
                                        rows={2}
                                      />
                                      <div className="flex gap-2">
                                        <Input
                                          value={item.time || ''}
                                          onChange={(e) => updateItem(day.id, item.id, { time: e.target.value })}
                                          placeholder="Time"
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
                                      <div className="flex items-center justify-between">
                                        <h4 className="font-medium">{item.title}</h4>
                                        <div className="flex items-center gap-1">
                                          {item.time && (
                                            <Badge variant="secondary" className="text-xs">
                                              {item.time}
                                            </Badge>
                                          )}
                                          {item.cost && (
                                            <Badge variant="outline" className="text-xs">
                                              {item.cost}
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                      {item.details && (
                                        <p className="text-sm text-muted-foreground mt-1">
                                          {item.details}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditingItem(item.id)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeItem(day.id, item.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
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
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addItemToDay(day.id, 'poi')}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Stop
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addItemToDay(day.id, 'note')}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Note
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addItemToDay(day.id, 'lodging')}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Lodging
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addItemToDay(day.id, 'photo')}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Photo Op
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