import { useGame } from "./hooks/useGame";
import CharacterCreation from "./components/CharacterCreation";
import GameScreen from "./components/GameScreen";
import EndScreen from "./components/EndScreen";
import "./styles/global.css";
import "./styles/endScreens.css";

/**
 * App — top-level component. Delegates all game logic to useGame()
 * and routes between phases: intro → game → death/victory.
 */
export default function App() {
  const {
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
  } = useGame();

  function handleAction(action) {
    takeAction(action, character, history);
  }

  return (
    <div className="dm-root">
      {/* Toast notification */}
      {notification && (
        <div className="notification" role="status" aria-live="polite">
          {notification}
        </div>
      )}

      {/* Intro / Character Creation */}
      {phase === "intro" && (
        <CharacterCreation onBegin={beginAdventure} />
      )}

      {/* Active game (sidebar persists through death/victory transitions) */}
      {(phase === "game" || phase === "death" || phase === "victory") && character && (
        <GameScreen
          character={character}
          storyEntries={storyEntries}
          choices={choices}
          loading={loading}
          phase={phase}
          onAction={handleAction}
          onRestart={restart}
        />
      )}

      {/* Death / Victory overlays */}
      {(phase === "death" || phase === "victory") && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 50 }}>
          <EndScreen phase={phase} reason={endReason} onRestart={restart} />
        </div>
      )}
    </div>
  );
}
