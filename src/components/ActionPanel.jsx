import { useState } from "react";
import "../styles/game.css";

/**
 * ActionPanel — displays the DM's suggested choices and a custom action input.
 * @param {{ choices: string[], onAction: (action: string) => void, disabled: boolean }} props
 */
export default function ActionPanel({ choices, onAction, disabled }) {
  const [customAction, setCustomAction] = useState("");

  function handleCustomSubmit() {
    if (!customAction.trim()) return;
    onAction(customAction.trim());
    setCustomAction("");
  }

  function handleChoice(choice) {
    if (!disabled) onAction(choice);
  }

  return (
    <div className="action-area">
      <div className="choices-grid">
        {choices.map((c, i) => (
          <button
            key={i}
            className="choice-btn"
            onClick={() => handleChoice(c)}
            disabled={disabled}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="custom-row">
        <input
          className="custom-input"
          placeholder="Or write thy own action..."
          value={customAction}
          onChange={(e) => setCustomAction(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCustomSubmit()}
          disabled={disabled}
        />
        <button
          className="act-btn"
          onClick={handleCustomSubmit}
          disabled={disabled || !customAction.trim()}
        >
          Act
        </button>
      </div>
    </div>
  );
}
