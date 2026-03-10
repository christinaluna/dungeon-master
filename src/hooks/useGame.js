import { useState, useCallback } from "react";
import { callDungeonMaster } from "../api/dungeonMasterApi";
import { rollD20, getOutcome, buildCharacter, applyDmChanges } from "../utils/gameUtils";

/**
 * useGame — central hook managing all game state and actions.
 * Keeps components clean by housing the entire game loop here.
 */
export function useGame() {
  const [phase, setPhase] = useState("intro"); // "intro" | "game" | "death" | "victory"
  const [character, setCharacter] = useState(null);
  const [history, setHistory] = useState([]);
  const [storyEntries, setStoryEntries] = useState([]);
  const [choices, setChoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [endReason, setEndReason] = useState("");

  function showNotif(msg) {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  }

  /** Called when the player submits the character creation form. */
  const beginAdventure = useCallback(async (form) => {
    const char = buildCharacter(form);
    setCharacter(char);
    setPhase("game");
    setLoading(true);

    try {
      const result = await callDungeonMaster(
        char, [], "begin the adventure", 15, { tier: "success", label: "SUCCESS" }
      );
      setStoryEntries([{ type: "narration", text: result.narration }]);
      setChoices(result.choices || []);
      setHistory([{ role: "DM", content: result.narration }]);
    } catch {
      setStoryEntries([{ type: "narration", text: "The ancient magic stirs... but something interferes. Try again, brave soul." }]);
    }

    setLoading(false);
  }, []);

  /** Called when the player picks a choice or submits a custom action. */
  const takeAction = useCallback(async (action, currentCharacter, currentHistory) => {
    if (!action.trim() || loading) return;
    setChoices([]);

    const roll = rollD20();
    const relevantStat =
      currentCharacter.class === "Mage" || currentCharacter.class === "Cleric"
        ? currentCharacter.magic
        : currentCharacter.attack;
    const outcome = getOutcome(roll, relevantStat);

    setStoryEntries((prev) => [...prev, { type: "action", action, dice: { roll, outcome } }]);
    setLoading(true);

    const newHistory = [...currentHistory, { role: "Player", content: action }];

    try {
      const result = await callDungeonMaster(currentCharacter, currentHistory, action, roll, outcome);

      // Notify HP / item changes
      if (result.hpChange) {
        showNotif(result.hpChange < 0
          ? `⚔️ ${Math.abs(result.hpChange)} damage taken!`
          : `✨ ${result.hpChange} HP restored!`
        );
      }
      if (result.itemGained) showNotif(`📦 Gained: ${result.itemGained}`);
      if (result.itemLost)   showNotif(`💔 Lost: ${result.itemLost}`);

      const updatedChar = applyDmChanges(currentCharacter, result);
      setCharacter(updatedChar);
      setStoryEntries((prev) => [...prev, { type: "narration", text: result.narration }]);
      setHistory([...newHistory, { role: "DM", content: result.narration }]);

      if (result.gameOver || updatedChar.hp <= 0) {
        setEndReason(result.deathReason || "Your journey ends here...");
        setTimeout(() => setPhase("death"), 1200);
      } else if (result.victory) {
        setEndReason(result.narration?.split(".")[0] || "You have prevailed!");
        setTimeout(() => setPhase("victory"), 1200);
      } else {
        setChoices(result.choices || []);
      }
    } catch {
      setStoryEntries((prev) => [
        ...prev,
        { type: "narration", text: "The vision blurs... the magic falters. Try another path." },
      ]);
      setChoices(["Press forward", "Look around carefully", "Take a moment to recover"]);
    }

    setLoading(false);
  }, [loading]);

  /** Resets all state back to the intro screen. */
  const restart = useCallback(() => {
    setPhase("intro");
    setCharacter(null);
    setHistory([]);
    setStoryEntries([]);
    setChoices([]);
    setLoading(false);
    setNotification(null);
    setEndReason("");
  }, []);

  return {
    phase,
    character,
    history,
    storyEntries,
    choices,
    loading,
    notification,
    endReason,
    beginAdventure,
    takeAction,
    restart,
  };
}
