import { useEffect, useState } from "react";
import CharacterSidebar from "./CharacterSidebar";
import StoryFeed from "./StoryFeed";
import ActionPanel from "./ActionPanel";
import "../styles/game.css";

const OPTION_PANEL_ANIM_MS = 400;
const FLYOUT_ANIM_MS = 320;

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
  const [flyoutMounted, setFlyoutMounted] = useState(false);
  const [flyoutVisible, setFlyoutVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [panelMounted, setPanelMounted] = useState(false);
  const [panelVisible, setPanelVisible] = useState(false);
  const [panelChoices, setPanelChoices] = useState([]);
  const hpPercent = (character.hp / character.maxHp) * 100;

  useEffect(() => {
    const media = window.matchMedia("(max-width: 768px)");
    const sync = () => setIsMobile(media.matches);
    sync();

    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (phase !== "game") {
      setPanelVisible(false);
      setPanelMounted(false);
      setPanelChoices([]);
      return;
    }

    if (!loading && choices.length > 0) {
      setPanelChoices(choices);
      setPanelMounted(true);
      const id = requestAnimationFrame(() => setPanelVisible(true));
      return () => cancelAnimationFrame(id);
    }

    if (panelMounted) {
      setPanelVisible(false);
      const t = setTimeout(() => setPanelMounted(false), OPTION_PANEL_ANIM_MS);
      return () => clearTimeout(t);
    }
  }, [phase, loading, choices, panelMounted]);

  function handlePanelAction(action) {
    setPanelVisible(false);
    onAction(action);
  }

  function openFlyout() {
    setFlyoutMounted(true);
    requestAnimationFrame(() => setFlyoutVisible(true));
  }

  function closeFlyout() {
    setFlyoutVisible(false);
    setTimeout(() => setFlyoutMounted(false), FLYOUT_ANIM_MS);
  }

  return (
    <div className="game-screen">
      {!isMobile && <CharacterSidebar character={character} onRestart={onRestart} />}

      <div className="main-area">
        <div className="mobile-top-status">
          <div className="mobile-hp-summary">
            <div className="mobile-char-line">
              <span className="mobile-char-name">{character.name}</span>
              <span className="mobile-char-meta">{character.race} · {character.class}</span>
            </div>
            <div className="hp-bar-wrap">
              <div className="hp-bar-fill" style={{ width: `${hpPercent}%` }} />
            </div>
            <div className="mobile-hp-row">
              <div className="mobile-hp-label">Hit Points</div>
              <div className="mobile-hp-text">{character.hp} / {character.maxHp}</div>
            </div>
          </div>

          <button
            className="mobile-menu-btn"
            onClick={openFlyout}
            aria-label="Open character menu"
          >
            ☰
          </button>
        </div>

        <div className="story-header">
          <span className="story-header-icon">📜</span>
          <span className="story-header-title">The Chronicle Unfolds</span>
        </div>

        <StoryFeed entries={storyEntries} loading={loading} />

        {phase === "game" && panelMounted && (
          <div className={`action-panel-shell ${panelVisible ? "is-visible" : "is-hidden"}`}>
            <ActionPanel
              choices={panelChoices}
              onAction={handlePanelAction}
              disabled={loading || !panelVisible}
            />
          </div>
        )}
      </div>

      {flyoutMounted && (
        <>
          <button
            className={`mobile-flyout-backdrop ${flyoutVisible ? "is-visible" : ""}`}
            onClick={closeFlyout}
            aria-label="Close character menu"
          />
          <aside className={`mobile-flyout ${flyoutVisible ? "is-visible" : ""}`}>
            <div className="mobile-flyout-top">
              <button className="mobile-flyout-close" onClick={closeFlyout} aria-label="Close panel">
                ✕
              </button>
            </div>
            <div>
              <div className="char-name">{character.name}</div>
              <div className="char-meta">{character.race} · {character.class}</div>
            </div>

            <div className="divider" />

            <div>
              <div className="sidebar-label">Attributes</div>
              <div className="stats-grid">
                {[["ATK", character.attack], ["DEF", character.defense], ["MAG", character.magic]].map(([k, v]) => (
                  <div className="stat-box" key={k}>
                    <span className="stat-val">{v}</span>
                    <span className="stat-name">{k}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mobile-flyout-inventory">
              <div className="sidebar-label">Inventory</div>
              <ul className="inventory-list">
                {character.inventory.map((item, i) => (
                  <li key={i} className="inv-item">· {item}</li>
                ))}
              </ul>
            </div>

            <button className="new-char-btn" onClick={onRestart}>New Character</button>
          </aside>
        </>
      )}
    </div>
  );
}
