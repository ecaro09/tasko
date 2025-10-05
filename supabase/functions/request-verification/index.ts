import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS OPTIONS request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      console.error('Authentication error:', userError?.message);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    // Check if a pending request already exists for this user
    const { data: existingRequests, error: fetchError } = await supabaseClient
      .from('verification_requests')
      .select('id, status')
      .eq('user_id', user.id)
      .in('status', ['pending', 'approved']); // Check for pending or already approved

    if (fetchError) {
      console.error('Error checking existing requests:', fetchError.message);
      return new Response(JSON.stringify({ error: 'Failed to check existing requests' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    if (existingRequests && existingRequests.length > 0) {
      const currentStatus = existingRequests[0].status;
      if (currentStatus === 'pending') {
        return new Response(JSON.stringify({ message: 'Verification request already pending.' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 409, // Conflict
        });
      } else if (currentStatus === 'approved') {
        return new Response(JSON.stringify({ message: 'User is already verified.' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 409, // Conflict
        });
      }
    }

    // Insert new verification request
    const { data, error } = await supabaseClient
      .from('verification_requests')
      .insert({ user_id: user.id, status: 'pending' })
      .select();

    if (error) {
      console.error('Error inserting verification request:', error.message);
      return new Response(JSON.stringify({ error: 'Failed to submit verification request' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    return new Response(JSON.stringify({ message: 'Verification request submitted successfully!', data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});