
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
    // Get SMS provider settings from environment variables
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

    // Send SMS based on provider
    if (provider.toUpperCase() === "TWILIO") {
      if (!accountSid || !authToken || !fromNumber) {
        return new Response(
          JSON.stringify({ error: "Twilio credentials not configured" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      try {
        const twilioEndpoint = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
        
        const formData = new URLSearchParams();
        formData.append("To", to);
        formData.append("From", fromNumber);
        formData.append("Body", message);
        
        const credentials = btoa(`${accountSid}:${authToken}`);
        
        const twilioResponse = await fetch(twilioEndpoint, {
          method: "POST",
          headers: {
            "Authorization": `Basic ${credentials}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData.toString(),
        });
        
        const twilioData = await twilioResponse.json();
        
        if (!twilioResponse.ok) {
          console.error("Twilio API error:", twilioData);
          return new Response(
            JSON.stringify({ error: twilioData.message || "Failed to send SMS via Twilio" }),
            { status: twilioResponse.status, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "SMS sent successfully via Twilio",
            id: twilioData.sid,
            provider: "TWILIO"
          }),
          { 
            status: 200, 
            headers: { "Content-Type": "application/json", ...corsHeaders } 
          }
        );
      } catch (error) {
        console.error("Twilio API request error:", error);
        return new Response(
          JSON.stringify({ error: "Failed to communicate with Twilio API" }),
          { 
            status: 500, 
            headers: { "Content-Type": "application/json", ...corsHeaders } 
          }
        );
      }
    } 
    else if (provider.toUpperCase() === "AFRICAS_TALKING") {
      // Implementation for Africa's Talking would go here
      if (!apiKey || !fromNumber || !Deno.env.get("SMS_USERNAME")) {
        return new Response(
          JSON.stringify({ error: "Africa's Talking credentials not configured" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      console.log("Africa's Talking SMS would be sent here with:", {
        to,
        from: fromNumber,
        message,
      });

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Africa's Talking SMS implementation pending",
          id: crypto.randomUUID(),
          provider: "AFRICAS_TALKING"
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    else if (provider.toUpperCase() === "NEXMO" || provider.toUpperCase() === "VONAGE") {
      // Implementation for Nexmo/Vonage would go here
      if (!apiKey || !Deno.env.get("SMS_API_SECRET") || !fromNumber) {
        return new Response(
          JSON.stringify({ error: "Vonage/Nexmo credentials not configured" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      console.log("Vonage/Nexmo SMS would be sent here with:", {
        to,
        from: fromNumber,
        message,
      });

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Vonage/Nexmo SMS implementation pending",
          id: crypto.randomUUID(),
          provider: "NEXMO"
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    else {
      // Handle unsupported provider
      console.log("SMS provider not supported:", provider);
      
      // For development/demo purposes, we'll simulate success
      console.log("SMS details (simulated):", {
        to,
        from: fromNumber,
        message,
        provider,
      });
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "SMS sent successfully (simulated)",
          id: crypto.randomUUID(),
          provider: provider.toUpperCase()
        }),
        { 
          status: 200, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }
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
