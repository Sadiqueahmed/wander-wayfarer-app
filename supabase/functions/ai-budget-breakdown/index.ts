import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Waypoint {
  id: string;
  name: string;
  address?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { waypoints, tripData } = await req.json();
    
    if (!waypoints || waypoints.length < 1) {
      return new Response(
        JSON.stringify({ error: 'At least 1 waypoint required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const waypointsList = waypoints.map((wp: Waypoint, idx: number) => 
      `${idx + 1}. ${wp.name}`
    ).join('\n');

    const systemPrompt = `You are a financial expert specializing in travel budgeting. Provide realistic, detailed budget breakdowns for road trips and RV travel. Consider:
- Accommodation costs (campgrounds, RV parks, hotels)
- Food and dining expenses
- Fuel costs based on vehicle type and distance
- Activity and attraction fees
- Miscellaneous expenses
- Regional price variations`;

    const userPrompt = `Create a detailed budget breakdown for this trip:

DESTINATIONS:
${waypointsList}

TRIP DETAILS:
- Duration: ${tripData.start_date} to ${tripData.end_date}
- Total Budget: $${tripData.budget || 'Not specified'}
- Travelers: ${tripData.travelers || 1} people
- Vehicle: ${tripData.vehicle_type || 'RV'}
- Fuel Type: ${tripData.fuel_type || 'Gasoline'}
- Estimated Distance: ${tripData.total_distance || 'Unknown'} miles
- Vehicle Mileage: ${tripData.mileage || 10} MPG

Provide a comprehensive budget breakdown with realistic estimates.`;

    console.log('Calling Lovable AI for budget breakdown...');

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
            name: "create_budget_breakdown",
            description: "Generate detailed travel budget breakdown",
            parameters: {
              type: "object",
              properties: {
                categories: {
                  type: "object",
                  properties: {
                    accommodation: {
                      type: "object",
                      properties: {
                        total: { type: "number" },
                        per_night: { type: "number" },
                        nights: { type: "number" },
                        breakdown: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              location: { type: "string" },
                              type: { type: "string" },
                              cost: { type: "number" },
                              nights: { type: "number" }
                            }
                          }
                        }
                      }
                    },
                    food: {
                      type: "object",
                      properties: {
                        total: { type: "number" },
                        per_day: { type: "number" },
                        breakdown: {
                          type: "object",
                          properties: {
                            groceries: { type: "number" },
                            restaurants: { type: "number" },
                            snacks: { type: "number" }
                          }
                        }
                      }
                    },
                    fuel: {
                      type: "object",
                      properties: {
                        total: { type: "number" },
                        estimated_gallons: { type: "number" },
                        price_per_gallon: { type: "number" },
                        total_miles: { type: "number" }
                      }
                    },
                    activities: {
                      type: "object",
                      properties: {
                        total: { type: "number" },
                        breakdown: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              activity: { type: "string" },
                              location: { type: "string" },
                              cost: { type: "number" }
                            }
                          }
                        }
                      }
                    },
                    miscellaneous: {
                      type: "object",
                      properties: {
                        total: { type: "number" },
                        items: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              item: { type: "string" },
                              cost: { type: "number" }
                            }
                          }
                        }
                      }
                    }
                  }
                },
                total_estimated_cost: { type: "number" },
                budget_status: {
                  type: "object",
                  properties: {
                    over_budget: { type: "boolean" },
                    difference: { type: "number" },
                    recommendations: {
                      type: "array",
                      items: { type: "string" }
                    }
                  }
                },
                savings_tips: {
                  type: "array",
                  items: { type: "string" }
                }
              },
              required: ["categories", "total_estimated_cost"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "create_budget_breakdown" } }
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
    console.log('AI budget breakdown generated successfully');

    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || !toolCall.function?.arguments) {
      throw new Error('Invalid AI response format');
    }

    const budgetBreakdown = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify(budgetBreakdown),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in ai-budget-breakdown function:', error);
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
