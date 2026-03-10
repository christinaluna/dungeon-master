const DEFAULT_MODEL = "gemini-2.5-flash";
const DEFAULT_FALLBACK_MODELS = ["gemini-2.0-flash", "gemini-2.0-flash-lite"];

function parseFallbackModels() {
  const fromEnv = process.env.GEMINI_FALLBACK_MODELS
    ?.split(",")
    .map((m) => m.trim())
    .filter(Boolean);
  return fromEnv?.length ? fromEnv : DEFAULT_FALLBACK_MODELS;
}

function shouldTryNextModel(status, responseData) {
  const msg = responseData?.error?.message || "";
  const lower = String(msg).toLowerCase();
  const transient = status === 429 || (status >= 500 && status <= 599);
  const unsupportedModel =
    lower.includes("not found for api version") ||
    lower.includes("not supported for generatecontent") ||
    lower.includes("model");

  return transient || (status === 404 && unsupportedModel);
}

function extractUserPrompt(payload) {
  const userMessage = payload?.contents?.find((c) => c?.role === "user");
  const textPart = userMessage?.parts?.find((p) => typeof p?.text === "string");
  return textPart?.text || "";
}

function extractField(promptText, regex, fallback) {
  const match = promptText.match(regex);
  return match?.[1]?.trim() || fallback;
}

function buildLocalFallbackResponse(payload) {
  const promptText = extractUserPrompt(payload);
  const action = extractField(promptText, /PLAYER ACTION:\s*(.+)/i, "press forward");
  const outcomeLabel = extractField(promptText, /DICE ROLL:\s*\d+\/20\s*[—-]\s*(.+)/i, "MIXED");
  const outcome = outcomeLabel.toUpperCase();

  const toneByOutcome = {
    "CRITICAL FAILURE":
      "Fate turns hard against you as the world answers with danger and consequence.",
    FAILURE:
      "Your attempt falters, and the path ahead grows more perilous.",
    "PARTIAL SUCCESS":
      "You gain ground, but the cost is real and the danger remains close.",
    SUCCESS:
      "Your move lands cleanly, and the tide shifts in your favor.",
    "CRITICAL SUCCESS":
      "A legendary surge of fortune carries your action beyond all expectation.",
  };

  const tone = toneByOutcome[outcome] || toneByOutcome["PARTIAL SUCCESS"];
  const narration = `${tone} You ${action}, and the scene answers with crackling tension as old powers stir around you. For a heartbeat, the world stills, then opens three clear paths forward while the threat gathers in the shadows.`;

  return {
    narration,
    choices: [
      "Press the advantage before the enemy regroups",
      "Study the surroundings for hidden danger",
      "Steady yourself and prepare a careful next move",
    ],
    hpChange: 0,
    itemGained: null,
    itemLost: null,
    gameOver: false,
    victory: false,
    deathReason: null,
  };
}

function toGeminiEnvelope(dmResponse) {
  return {
    candidates: [
      {
        content: {
          parts: [{ text: JSON.stringify(dmResponse, null, 2) }],
          role: "model",
        },
        finishReason: "STOP",
        index: 0,
      },
    ],
    modelVersion: "local-fallback",
    usageMetadata: {
      promptTokenCount: 0,
      candidatesTokenCount: 0,
      totalTokenCount: 0,
    },
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: { message: "Method Not Allowed" } });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: { message: "Missing GEMINI_API_KEY" } });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const requestedModel = body.model || DEFAULT_MODEL;
    const fallbackModels = parseFallbackModels();
    const modelsToTry = [...new Set([requestedModel, ...fallbackModels])];
    const { model: _ignored, ...payload } = body;

    let lastUpstreamError = null;

    for (const model of modelsToTry) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const upstream = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseData = await upstream.json().catch(() => ({}));

      if (upstream.ok) {
        return res.status(200).json(responseData);
      }

      lastUpstreamError = { status: upstream.status, body: responseData, model };

      if (!shouldTryNextModel(upstream.status, responseData)) {
        return res.status(upstream.status).json(responseData);
      }
    }

    const localFallback = buildLocalFallbackResponse(payload);
    const fallbackEnvelope = toGeminiEnvelope(localFallback);
    if (lastUpstreamError) {
      fallbackEnvelope.localFallbackReason = {
        model: lastUpstreamError.model,
        status: lastUpstreamError.status,
      };
    }

    return res.status(200).json(fallbackEnvelope);
  } catch (error) {
    return res.status(500).json({
      error: { message: error instanceof Error ? error.message : "Unexpected server error" },
    });
  }
}
