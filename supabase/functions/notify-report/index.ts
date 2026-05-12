import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { reportedUserId, reporterUserId, reason } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: reported } = await supabase.from("profiles").select("name, last_name").eq("id", reportedUserId).single();
    const { data: reporter } = await supabase.from("profiles").select("name, last_name").eq("id", reporterUserId).single();

    const reportedName = reported ? `${reported.name} ${reported.last_name}` : reportedUserId;
    const reporterName = reporter ? `${reporter.name} ${reporter.last_name}` : reporterUserId;

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "RoadMate <onboarding@resend.dev>",
        to: "beaudeau_mickael@live.fr",
        subject: "🚨 Nouveau signalement RoadMate",
        html: `<h2>Nouveau signalement</h2>
          <p><b>Signalé :</b> ${reportedName}</p>
          <p><b>Signalé par :</b> ${reporterName}</p>
          <p><b>Raison :</b> ${reason}</p>`,
      }),
    });

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});