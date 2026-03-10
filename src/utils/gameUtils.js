import { CLASS_STATS, CLASS_INVENTORY } from "../constants/gameData";

/**
 * Rolls a d20 and returns a number between 1 and 20.
 */
export function rollD20() {
  return Math.floor(Math.random() * 20) + 1;
}

/**
 * Determines the outcome tier based on roll + stat modifier.
 * @param {number} roll      - Raw d20 result
 * @param {number} statBonus - Relevant stat value (attack or magic)
 * @returns {{ tier: string, label: string, color: string }}
 */
export function getOutcome(roll, statBonus) {
  const total = roll + Math.floor(statBonus / 3);
  if (roll === 1)    return { tier: "critical_fail",    label: "CRITICAL FAILURE",  color: "#db6f62" };
  if (total <= 7)    return { tier: "fail",             label: "FAILURE",           color: "#cf5a4d" };
  if (total <= 13)   return { tier: "partial",          label: "PARTIAL SUCCESS",   color: "#d4a017" };
  if (total <= 18)   return { tier: "success",          label: "SUCCESS",           color: "#2ecc71" };
  return                    { tier: "critical_success", label: "CRITICAL SUCCESS!", color: "#00ffcc" };
}

/**
 * Applies racial stat bonuses to a base stat block.
 * @param {Object} stats - Base stats from CLASS_STATS
 * @param {string} race  - Selected race name
 * @returns {Object} Modified stat block
 */
export function applyRaceBonus(stats, race) {
  const s = { ...stats };
  if (race === "Human")     { s.attack += 1; s.defense += 1; s.magic += 1; }
  if (race === "Elf")       { s.magic  += 2; s.attack  += 1; }
  if (race === "Dwarf")     { s.defense += 2; s.hp += 15; s.maxHp += 15; }
  if (race === "Half-Orc")  { s.attack += 3; s.defense -= 1; }
  if (race === "Fae")       { s.magic  += 3; s.defense += 1; }
  return s;
}

/**
 * Builds a full character object from the character creation form.
 * @param {{ name: string, race: string, class: string }} form
 * @returns {Object} Complete character sheet
 */
export function buildCharacter(form) {
  const baseStats = CLASS_STATS[form.class];
  const stats = applyRaceBonus({ ...baseStats }, form.race);
  return {
    name: form.name.trim(),
    race: form.race,
    class: form.class,
    ...stats,
    inventory: [...CLASS_INVENTORY[form.class]],
  };
}

/**
 * Applies DM response changes to the current character (HP, inventory).
 * @param {Object} character - Current character sheet
 * @param {Object} result    - Parsed DM API response
 * @returns {Object} Updated character sheet
 */
export function applyDmChanges(character, result) {
  let updated = { ...character };

  if (result.hpChange) {
    updated.hp = Math.max(0, Math.min(updated.maxHp, updated.hp + result.hpChange));
  }
  if (result.itemGained) {
    updated.inventory = [...updated.inventory, result.itemGained];
  }
  if (result.itemLost) {
    updated.inventory = updated.inventory.filter((i) => i !== result.itemLost);
  }

  return updated;
}
