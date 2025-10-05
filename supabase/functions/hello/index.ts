/// <reference lib="deno.env" />
// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Auth context of the logged-in user.
    // This is useful if you need to perform RLS-enabled database operations.
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Example: Fetch user data (requires RLS policy on profiles table)
    const { data: userData, error: userError } = await supabaseClient.auth.getUser();
    let userEmail = 'Guest';
    if (userData.user) {
      userEmail = userData.user.email || 'Authenticated User';
    } else if (userError) {
      console.error("Error fetching user in Edge Function:", userError.message);
    }

    // Respond with a simple message
    return new Response(JSON.stringify({ message: `Hello from Edge Functions! You are: ${userEmail}` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error("Edge Function error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})