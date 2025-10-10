import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { preferences } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are a knowledgeable travel expert specializing in RV and road trip destinations. Recommend destinations that match the traveler's preferences, considering:
- Travel style and interests
- Seasonal factors
- Budget constraints
- Unique experiences
- Hidden gems and popular spots`;

    const userPrompt = `Recommend the best destinations based on these preferences:

TRAVEL STYLE: ${preferences.travelStyle || 'Not specified'}
BUDGET: $${preferences.budget || 'Flexible'}
TRAVELERS: ${preferences.travelers || 1} people
SEASON: ${preferences.season || 'Current season'}
DURATION: ${preferences.duration || 'Flexible'} days
INTERESTS: ${preferences.interests || 'General sightseeing'}
VEHICLE TYPE: ${preferences.vehicleType || 'RV'}

Provide 5-8 personalized destination recommendations with detailed explanations.`;

    console.log('Calling Lovable AI for destination recommendations...');

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
            name: "recommend_destinations",
            description: "Provide personalized destination recommendations",
            parameters: {
              type: "object",
              properties: {
                recommendations: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      location: { type: "string" },
                      state: { type: "string" },
                      description: { type: "string" },
                      best_for: {
                        type: "array",
                        items: { type: "string" }
                      },
                      estimated_cost_per_day: { type: "number" },
                      best_time_to_visit: { type: "string" },
                      why_recommended: { type: "string" },
                      match_score: { 
                        type: "number",
                        description: "Match percentage (0-100)"
                      },
                      highlights: {
                        type: "array",
                        items: { type: "string" }
                      }
                    },
                    required: ["name", "location", "description", "why_recommended", "match_score"]
                  }
                },
                overall_tips: {
                  type: "array",
                  items: { type: "string" }
                }
              },
              required: ["recommendations"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "recommend_destinations" } }
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
    console.log('AI recommendations generated successfully');

    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || !toolCall.function?.arguments) {
      throw new Error('Invalid AI response format');
    }

    const recommendations = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify(recommendations),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in ai-recommend-destinations function:', error);
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
