import { SYSTEM_PROMPT, MODEL, MAX_TOKENS } from "../constants/prompts";

const API_URL = "/api/gemini";

/**
 * Builds the user message content for the DM API call.
 */
function buildUserMessage(character, history, action, roll, outcome) {
  const storyContext =
    history.length === 0
      ? "This is the very beginning of the adventure. Set an atmospheric opening scene — introduce a location, a threat or mystery, and draw the hero in."
      : history.map((h) => `[${h.role}]: ${h.content}`).join("\n");

  return `CHARACTER SHEET:
Name: ${character.name}
Race: ${character.race}
Class: ${character.class}
HP: ${character.hp}/${character.maxHp}
Attack: ${character.attack} | Defense: ${character.defense} | Magic: ${character.magic}
Inventory: ${character.inventory.join(", ")}

STORY SO FAR:
${storyContext}

PLAYER ACTION: ${action}
DICE ROLL: ${roll}/20 — ${outcome.label}

Respond ONLY with the JSON object. No markdown, no preamble.`;
}

function hashString(input) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h >>> 0);
}

function pick(pool, seed, idx = 0) {
  if (!pool.length) return "";
  return pool[(seed + idx) % pool.length];
}

function extractRecentContext(history) {
  if (!Array.isArray(history) || history.length === 0) return "";
  const lastDm = [...history].reverse().find((h) => h?.role === "DM" && h?.content)?.content || "";
  const firstSentence = lastDm.split(/[.!?]/).find((s) => s.trim()) || "";
  return firstSentence.trim();
}

function buildLocalFallbackTurn(action, outcome, history = []) {
  const outcomeLabel = String(outcome?.label || "PARTIAL SUCCESS").toUpperCase();
  const contextHint = extractRecentContext(history);
  const seed = hashString(`${action}|${outcomeLabel}|${contextHint}|${Date.now()}`);

  const toneByOutcome = {
    "CRITICAL FAILURE": [
      "Fate turns against you, and the world answers with immediate danger.",
      "The gamble collapses, and hostile forces seize the moment.",
      "Your move backfires hard, and the situation worsens in an instant.",
    ],
    FAILURE: [
      "Your move falters, and the path ahead grows harsher.",
      "You strain against the moment, but the danger pushes back.",
      "The attempt slips, leaving you exposed to new risks.",
    ],
    "PARTIAL SUCCESS": [
      "You make progress, but the moment demands caution and resolve.",
      "You gain a foothold, though the threat remains dangerously close.",
      "The outcome is mixed: momentum is yours, but at a cost.",
    ],
    SUCCESS: [
      "Your action lands true, and the scene bends in your favor.",
      "You execute with precision, forcing the danger to give ground.",
      "Your timing is sharp, and the balance tilts your way.",
    ],
    "CRITICAL SUCCESS": [
      "A legendary surge carries your move beyond expectation.",
      "Power and fortune align, and your action reshapes the battlefield.",
      "In a breathtaking turn, your effort becomes a decisive triumph.",
    ],
  };

  const tonePool = toneByOutcome[outcomeLabel] || toneByOutcome["PARTIAL SUCCESS"];
  const tone = pick(tonePool, seed, 0);

  const pressureLines = [
    "Shadows tighten at the edges of the scene as old magic stirs.",
    "A tremor of unseen power moves through stone, root, and air.",
    "The silence breaks into whispers, as if the world itself is watching.",
    "The atmosphere shifts, charged with threat and possibility.",
  ];

  const bridgeLines = contextHint
    ? [
        `Echoes of what came before linger — ${contextHint.toLowerCase()}.`,
        `The aftermath still hangs in the air: ${contextHint.toLowerCase()}.`,
      ]
    : [
        "The next heartbeat offers a narrow opening.",
        "You sense the story pivoting around your next decision.",
      ];

  const choiceSets = {
    "CRITICAL FAILURE": [
      "Retreat to cover and reassess the danger",
      "Call on every ounce of grit to hold your ground",
      "Search frantically for a desperate counterplay",
    ],
    FAILURE: [
      "Shift position and look for a safer angle",
      "Probe the threat for a weakness",
      "Brace and prepare for the next exchange",
    ],
    "PARTIAL SUCCESS": [
      "Press forward before the moment closes",
      "Stabilize the situation and read the terrain",
      "Attempt a risky maneuver for greater advantage",
    ],
    SUCCESS: [
      "Exploit the opening while momentum is yours",
      "Secure the area to prevent a counterattack",
      "Advance toward the core objective with confidence",
    ],
    "CRITICAL SUCCESS": [
      "Drive the advantage to break the threat completely",
      "Channel this momentum into a bold finishing move",
      "Turn your triumph into lasting control of the scene",
    ],
  };

  const choices = [...(choiceSets[outcomeLabel] || choiceSets["PARTIAL SUCCESS"])];
  // Rotate choice order deterministically from the current seed for variety.
  const rotateBy = seed % choices.length;
  const rotated = choices.slice(rotateBy).concat(choices.slice(0, rotateBy));

  const narration = `${tone} You ${action}, and the world answers in kind. ${pick(
    pressureLines,
    seed,
    1
  )} ${pick(bridgeLines, seed, 2)}`;

  return {
    narration,
    choices: rotated,
    hpChange: 0,
    itemGained: null,
    itemLost: null,
    gameOver: false,
    victory: false,
    deathReason: null,
  };
}

function shouldUseLocalFallback(status, err) {
  const msg = (err?.error?.message || "").toLowerCase();
  const reason = (err?.error?.status || "").toUpperCase();
  return (
    status === 429 ||
    status >= 500 ||
    reason === "RESOURCE_EXHAUSTED" ||
    msg.includes("quota") ||
    msg.includes("rate limit") ||
    msg.includes("resource exhausted")
  );
}

/**
 * Calls LLM API and returns parsed DM response JSON.
 * @param {Object} character - The current character sheet
 * @param {Array}  history   - Array of { role, content } story history
 * @param {string} action    - The player's chosen action
 * @param {number} roll      - The d20 roll result (1–20)
 * @param {Object} outcome   - { tier, label, color } from rollUtils
 * @returns {Promise<Object>} Parsed DM response
 */
export async function callDungeonMaster(character, history, action, roll, outcome) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      systemInstruction: {
        parts: [{ text: SYSTEM_PROMPT }],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: buildUserMessage(character, history, action, roll, outcome) }],
        },
      ],
      generationConfig: {
        maxOutputTokens: MAX_TOKENS,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    if (shouldUseLocalFallback(response.status, err)) {
      return buildLocalFallbackTurn(action, outcome, history);
    }
    throw new Error(err?.error?.message || `API error: ${response.status}`);
  }

  const data = await response.json();
  const raw =
    data?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";
  const clean = raw.replace(/```json|```/g, "").trim();
  const start = clean.indexOf("{");
  const end = clean.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    return buildLocalFallbackTurn(action, outcome, history);
  }

  try {
    const jsonSlice = clean.slice(start, end + 1);
    return JSON.parse(jsonSlice);
  } catch {
    return buildLocalFallbackTurn(action, outcome, history);
  }
}
