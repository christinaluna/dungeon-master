import { useEffect, useRef } from "react";
import "../styles/game.css";

/**
 * StoryFeed — scrolling chronicle of narration, player actions, and dice rolls.
 * @param {{ entries: Array, loading: boolean }} props
 */
export default function StoryFeed({ entries, loading }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries, loading]);

  return (
    <div className="story-scroll">
      {entries.map((entry, i) => (
        <div key={i} className="story-entry">
          {entry.type === "action" && (
            <>
              <div className="player-action-bubble">▶ {entry.action}</div>
              {entry.dice && (
                <div className="dice-moment">
                  <div className="dice-face">🎲</div>
                  <div className="dice-info">
                    <div className="dice-roll-num">{entry.dice.roll}</div>
                    <div
                      className="dice-outcome-label"
                      style={{ color: entry.dice.outcome.color }}
                    >
                      {entry.dice.outcome.label}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {entry.type === "narration" && (
            <div className="story-narration">
              {entry.text.split("\n").map((p, j) =>
                p.trim() ? <p key={j}>{p}</p> : null
              )}
            </div>
          )}
        </div>
      ))}

      {loading && (
        <div className="loading-row">
          <span className="rune-spin">✦</span>
          The Dungeon Master weaves thy fate...
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
