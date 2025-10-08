import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Waypoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'start' | 'end' | 'waypoint';
  address?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { waypoints, preferences } = await req.json();
    
    if (!waypoints || waypoints.length < 2) {
      return new Response(
        JSON.stringify({ error: 'At least 2 waypoints required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Separate start, end, and intermediate waypoints
    const startPoint = waypoints.find((wp: Waypoint) => wp.type === 'start');
    const endPoint = waypoints.find((wp: Waypoint) => wp.type === 'end');
    const intermediatePoints = waypoints.filter((wp: Waypoint) => wp.type === 'waypoint');

    if (!startPoint || !endPoint) {
      return new Response(
        JSON.stringify({ error: 'Start and end points required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build prompt for AI
    const waypointsList = intermediatePoints.map((wp: Waypoint, idx: number) => 
      `${idx + 1}. ${wp.name} (${wp.lat}, ${wp.lng})`
    ).join('\n');

    const systemPrompt = `You are a route optimization expert. Your task is to reorder waypoints to create the most efficient route considering:
- Total distance traveled
- Logical geographic progression
- Fuel efficiency
- Time optimization

Return ONLY the optimized order as a JSON array of waypoint indices (0-based).`;

    const userPrompt = `Optimize this route:

START: ${startPoint.name} (${startPoint.lat}, ${startPoint.lng})

INTERMEDIATE STOPS:
${waypointsList}

END: ${endPoint.name} (${endPoint.lat}, ${endPoint.lng})

Preferences: ${JSON.stringify(preferences || { priority: 'distance' })}

Return the optimized order of intermediate waypoints as a JSON array of indices (0-based). Example: [2, 0, 1, 3] means visit waypoint 2 first, then 0, then 1, then 3.`;

    console.log('Calling Lovable AI for route optimization...');

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [{
          type: "function",
          function: {
            name: "optimize_route",
            description: "Return the optimized waypoint order",
            parameters: {
              type: "object",
              properties: {
                optimized_indices: {
                  type: "array",
                  items: { type: "number" },
                  description: "Array of waypoint indices in optimized order"
                },
                reasoning: {
                  type: "string",
                  description: "Brief explanation of the optimization strategy"
                },
                estimated_savings: {
                  type: "object",
                  properties: {
                    distance_percent: { type: "number" },
                    time_percent: { type: "number" }
                  }
                }
              },
              required: ["optimized_indices", "reasoning"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "optimize_route" } }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log('AI response received');

    // Extract tool call result
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || !toolCall.function?.arguments) {
      throw new Error('Invalid AI response format');
    }

    const optimizationResult = JSON.parse(toolCall.function.arguments);
    const { optimized_indices, reasoning, estimated_savings } = optimizationResult;

    // Validate indices
    if (!Array.isArray(optimized_indices) || optimized_indices.length !== intermediatePoints.length) {
      throw new Error('Invalid optimization result');
    }

    // Reorder waypoints
    const optimizedWaypoints = [
      startPoint,
      ...optimized_indices.map((idx: number) => intermediatePoints[idx]),
      endPoint
    ];

    console.log('Route optimization complete');

    return new Response(
      JSON.stringify({
        optimized_waypoints: optimizedWaypoints,
        reasoning,
        estimated_savings: estimated_savings || null,
        original_order: waypoints.map((wp: Waypoint) => wp.id),
        optimized_order: optimizedWaypoints.map((wp: Waypoint) => wp.id)
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in optimize-route function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
