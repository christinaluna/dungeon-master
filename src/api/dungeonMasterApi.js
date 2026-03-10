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
    throw new Error(err?.error?.message || `API error: ${response.status}`);
  }

  const data = await response.json();
  const raw =
    data?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";
  const clean = raw.replace(/```json|```/g, "").trim();
  const jsonSlice = clean.slice(clean.indexOf("{"), clean.lastIndexOf("}") + 1);
  return JSON.parse(jsonSlice);
}
