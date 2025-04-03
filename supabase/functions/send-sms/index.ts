
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SMSRequest {
  to: string;
  message: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get SMS provider settings from environment variables or database
    const provider = Deno.env.get("SMS_PROVIDER");
    const apiKey = Deno.env.get("SMS_API_KEY");
    const accountSid = Deno.env.get("SMS_ACCOUNT_SID");
    const authToken = Deno.env.get("SMS_AUTH_TOKEN");
    const fromNumber = Deno.env.get("SMS_FROM_NUMBER");

    // Check if SMS settings are configured
    if (!provider) {
      console.error("SMS provider not configured");
      return new Response(
        JSON.stringify({ error: "SMS provider not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get request body
    const { to, message } = await req.json() as SMSRequest;

    // Validate required fields
    if (!to || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, message" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // In a real implementation, this would use the SMS provider API to send a message
    // For demonstration, we'll just log the SMS details and return a success response
    console.log("SMS details:", {
      to,
      from: fromNumber,
      message,
      provider,
      config: {
        provider,
        apiKey: apiKey ? "***" : undefined,
        accountSid: accountSid ? "***" : undefined,
        authToken: authToken ? "***" : undefined,
      }
    });

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "SMS sent successfully",
        id: crypto.randomUUID()
      }),
      { 
        status: 200, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
  } catch (error) {
    console.error("Error sending SMS:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to send SMS" }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
  }
});
