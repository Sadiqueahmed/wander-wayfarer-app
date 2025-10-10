import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Waypoint {
  id: string;
  name: string;
  address?: string;
  type?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { waypoints, tripData } = await req.json();
    
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

    const waypointsList = waypoints.map((wp: Waypoint, idx: number) => 
      `${idx + 1}. ${wp.name}${wp.address ? ` (${wp.address})` : ''}`
    ).join('\n');

    const systemPrompt = `You are an expert travel planner. Create detailed day-by-day itineraries that are:
- Realistic and well-paced
- Budget-conscious
- Include specific timing suggestions
- Consider travel time between locations
- Suggest activities and attractions
- Include meal recommendations
- Provide estimated costs`;

    const userPrompt = `Create a detailed itinerary for this trip:

DESTINATIONS:
${waypointsList}

TRIP DETAILS:
- Duration: ${tripData.start_date} to ${tripData.end_date}
- Budget: $${tripData.budget || 'Not specified'}
- Travelers: ${tripData.travelers || 1} people
- Vehicle: ${tripData.vehicle_type || 'Not specified'}

Create a comprehensive day-by-day plan with morning, afternoon, and evening activities. Include estimated costs and timing.`;

    console.log('Calling Lovable AI for itinerary generation...');

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
            name: "create_itinerary",
            description: "Generate a detailed day-by-day travel itinerary",
            parameters: {
              type: "object",
              properties: {
                days: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      day_number: { type: "number" },
                      date: { type: "string" },
                      location: { type: "string" },
                      morning: {
                        type: "object",
                        properties: {
                          activity: { type: "string" },
                          time: { type: "string" },
                          cost: { type: "number" }
                        }
                      },
                      afternoon: {
                        type: "object",
                        properties: {
                          activity: { type: "string" },
                          time: { type: "string" },
                          cost: { type: "number" }
                        }
                      },
                      evening: {
                        type: "object",
                        properties: {
                          activity: { type: "string" },
                          time: { type: "string" },
                          cost: { type: "number" }
                        }
                      },
                      accommodation: {
                        type: "object",
                        properties: {
                          suggestion: { type: "string" },
                          estimated_cost: { type: "number" }
                        }
                      },
                      daily_total: { type: "number" },
                      notes: { type: "string" }
                    },
                    required: ["day_number", "date", "location", "morning", "afternoon", "evening"]
                  }
                },
                total_estimated_cost: { type: "number" },
                tips: {
                  type: "array",
                  items: { type: "string" }
                }
              },
              required: ["days", "total_estimated_cost"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "create_itinerary" } }
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
    console.log('AI itinerary generated successfully');

    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || !toolCall.function?.arguments) {
      throw new Error('Invalid AI response format');
    }

    const itinerary = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify(itinerary),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in ai-itinerary function:', error);
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
