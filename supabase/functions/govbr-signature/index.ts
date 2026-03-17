import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Gov.br API endpoints
const GOVBR_STAGING_AUTH = "https://sso.staging.acesso.gov.br/authorize";
const GOVBR_STAGING_TOKEN = "https://sso.staging.acesso.gov.br/token";
const GOVBR_STAGING_SIGN_API = "https://assinatura-api.staging.iti.br/externo/v2";

// Production endpoints (use when going live):
// const GOVBR_AUTH = "https://sso.acesso.gov.br/authorize";
// const GOVBR_TOKEN = "https://sso.acesso.gov.br/token";
// const GOVBR_SIGN_API = "https://assinatura-api.iti.gov.br/externo/v2";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, responsible_id, redirect_uri, code, hash_to_sign } = await req.json();

    const GOVBR_CLIENT_ID = Deno.env.get("GOVBR_CLIENT_ID");
    const GOVBR_CLIENT_SECRET = Deno.env.get("GOVBR_CLIENT_SECRET");

    if (!GOVBR_CLIENT_ID || !GOVBR_CLIENT_SECRET) {
      return new Response(
        JSON.stringify({
          error: "missing_credentials",
          message:
            "As credenciais do gov.br (GOVBR_CLIENT_ID e GOVBR_CLIENT_SECRET) não estão configuradas. " +
            "Solicite as credenciais no Portal de Integração do gov.br: " +
            "https://www.gov.br/governodigital/pt-br/estrategias-e-governanca-digital/transformacao-digital/" +
            "servico-de-integracao-aos-produtos-de-identidade-digital-gov.br",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Step 1: Initialize OAuth flow — return auth URL
    if (action === "init_auth") {
      const state = crypto.randomUUID();
      const authUrl =
        `${GOVBR_STAGING_AUTH}?` +
        new URLSearchParams({
          response_type: "code",
          client_id: GOVBR_CLIENT_ID,
          scope: "openid email phone profile govbr_empresa signature_session",
          redirect_uri: redirect_uri,
          state: state,
          nonce: crypto.randomUUID(),
        }).toString();

      return new Response(
        JSON.stringify({ auth_url: authUrl, state }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 2: Exchange auth code for access token
    if (action === "exchange_token") {
      const tokenRes = await fetch(GOVBR_STAGING_TOKEN, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code: code,
          redirect_uri: redirect_uri,
          client_id: GOVBR_CLIENT_ID,
          client_secret: GOVBR_CLIENT_SECRET,
        }).toString(),
      });

      if (!tokenRes.ok) {
        const errText = await tokenRes.text();
        console.error("Token exchange failed:", errText);
        return new Response(
          JSON.stringify({ error: "token_exchange_failed", details: errText }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const tokenData = await tokenRes.json();

      // Get public certificate
      const certRes = await fetch(`${GOVBR_STAGING_SIGN_API}/certificadoPublico`, {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });

      let certificateId = null;
      if (certRes.ok) {
        const certData = await certRes.json();
        certificateId = certData.certificado || certData.subject;
      }

      // Update the responsible record
      if (responsible_id && certificateId) {
        await supabase
          .from("technical_responsibles")
          .update({ govbr_certificate_id: certificateId })
          .eq("id", responsible_id);
      }

      return new Response(
        JSON.stringify({
          success: true,
          access_token: tokenData.access_token,
          certificate_id: certificateId,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 3: Sign a document hash (PKCS#7)
    if (action === "sign_hash") {
      const tokenRes = await fetch(GOVBR_STAGING_TOKEN, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code: code,
          redirect_uri: redirect_uri,
          client_id: GOVBR_CLIENT_ID,
          client_secret: GOVBR_CLIENT_SECRET,
        }).toString(),
      });

      if (!tokenRes.ok) {
        return new Response(
          JSON.stringify({ error: "token_failed" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const tokenData = await tokenRes.json();

      const signRes = await fetch(`${GOVBR_STAGING_SIGN_API}/assinarPKCS7`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ hashBase64: hash_to_sign }),
      });

      if (!signRes.ok) {
        const errText = await signRes.text();
        return new Response(
          JSON.stringify({ error: "sign_failed", details: errText }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const signData = await signRes.json();
      return new Response(
        JSON.stringify({ success: true, signature: signData }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "unknown_action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("govbr-signature error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
