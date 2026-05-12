import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  const { reportedUserId, reporterUserId, reason } = await req.json();

  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "RoadMate <noreply@roadmateoz.app>",
      to: "beaudeau_mickael@live.fr",
      subject: "🚨 Nouveau signalement RoadMate",
      html: `
        <h2>Nouveau signalement</h2>
        <p><b>Signalé :</b> ${reportedUserId}</p>
        <p><b>Signalé par :</b> ${reporterUserId}</p>
        <p><b>Raison :</b> ${reason}</p>
      `,
    }),
  });

  const data = await res.json();
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
});