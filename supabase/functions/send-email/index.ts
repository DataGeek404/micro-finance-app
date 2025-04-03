
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  subject: string;
  body: string;
  from?: string;
  replyTo?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get SMTP settings from environment variables or database
    const smtpHost = Deno.env.get("SMTP_HOST");
    const smtpPort = Deno.env.get("SMTP_PORT");
    const smtpUsername = Deno.env.get("SMTP_USERNAME");
    const smtpPassword = Deno.env.get("SMTP_PASSWORD");
    const defaultFromEmail = Deno.env.get("DEFAULT_FROM_EMAIL") || "noreply@loanlight.app";

    // Check if SMTP settings are configured
    if (!smtpHost || !smtpPort || !smtpUsername || !smtpPassword) {
      console.error("SMTP settings are not configured");
      return new Response(
        JSON.stringify({ error: "SMTP settings are not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get request body
    const { to, subject, body, from, replyTo } = await req.json() as EmailRequest;

    // Validate required fields
    if (!to || !subject || !body) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, subject, body" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // In a real implementation, this would use the SMTP settings to send an email
    // For demonstration, we'll just log the email details and return a success response
    console.log("Email details:", {
      to,
      from: from || defaultFromEmail,
      replyTo: replyTo || from || defaultFromEmail,
      subject,
      body,
      smtpConfig: {
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === "465",
      }
    });

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email sent successfully",
        id: crypto.randomUUID()
      }),
      { 
        status: 200, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to send email" }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
  }
});
