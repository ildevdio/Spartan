import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cnae } = await req.json();
    if (!cnae || typeof cnae !== "string") {
      return new Response(JSON.stringify({ error: "CNAE não informado" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate CNAE format (e.g., 56.11-2-03 or 5611203)
    const sanitizedCnae = cnae.trim().slice(0, 20);
    const cnaePattern = /^[\d.\-\/]{4,20}$/;
    if (!cnaePattern.test(sanitizedCnae)) {
      return new Response(JSON.stringify({ error: "Formato de CNAE inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: `Você é um especialista em segurança do trabalho brasileiro. 
Dado um código CNAE, determine o Grau de Risco da atividade conforme o Quadro I da NR-04 (Classificação Nacional de Atividades Econômicas com correspondente Grau de Risco).

Responda APENAS com um JSON no formato: {"risk": "1", "description": "breve descrição da atividade"}
O campo "risk" deve ser "1", "2", "3" ou "4".
Não inclua nenhum texto fora do JSON.`,
          },
          {
            role: "user",
            content: `Qual o grau de risco NR-04 para o CNAE: ${sanitizedCnae}?`,
          },
        ],
        temperature: 0.1,
        max_tokens: 150,
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim() || "";
    
    // Parse the JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ risk: "2", description: "Não foi possível determinar com precisão" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
