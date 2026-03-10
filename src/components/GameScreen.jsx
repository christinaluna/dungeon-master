import CharacterSidebar from "./CharacterSidebar";
import StoryFeed from "./StoryFeed";
import ActionPanel from "./ActionPanel";
import "../styles/game.css";

/**
 * GameScreen — the main game layout: sidebar + story panel + action area.
 * @param {{
 *   character: Object,
 *   storyEntries: Array,
 *   choices: string[],
 *   loading: boolean,
 *   phase: string,
 *   onAction: (action: string) => void,
 *   onRestart: () => void,
 * }} props
 */
export default function GameScreen({
  character,
  storyEntries,
  choices,
  loading,
  phase,
  onAction,
  onRestart,
}) {
  return (
    <div className="game-screen">
      <CharacterSidebar character={character} onRestart={onRestart} />

      <div className="main-area">
        <div className="story-header">
          <span className="story-header-icon">📜</span>
          <span className="story-header-title">The Chronicle Unfolds</span>
        </div>

        <StoryFeed entries={storyEntries} loading={loading} />

        {phase === "game" && !loading && choices.length > 0 && (
          <ActionPanel choices={choices} onAction={onAction} disabled={loading} />
        )}
      </div>
    </div>
  );
}
