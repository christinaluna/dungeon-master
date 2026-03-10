import "../styles/game.css";

/**
 * CharacterSidebar — displays the player's live character sheet.
 * @param {{ character: Object, onRestart: () => void }} props
 */
export default function CharacterSidebar({ character, onRestart }) {
  const hpPercent = (character.hp / character.maxHp) * 100;

  return (
    <aside className="sidebar">
      {/* Identity */}
      <div>
        <div className="char-name">{character.name}</div>
        <div className="char-meta">{character.race} · {character.class}</div>
      </div>

      <div className="divider" />

      {/* HP */}
      <div>
        <div className="sidebar-label">Hit Points</div>
        <div className="hp-bar-wrap">
          <div className="hp-bar-fill" style={{ width: `${hpPercent}%` }} />
        </div>
        <div className="hp-text">{character.hp} / {character.maxHp}</div>
      </div>

      {/* Stats */}
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

      {/* Inventory */}
      <div style={{ flex: 1 }}>
        <div className="sidebar-label">Inventory</div>
        <ul className="inventory-list">
          {character.inventory.map((item, i) => (
            <li key={i} className="inv-item">· {item}</li>
          ))}
        </ul>
      </div>

      <button className="new-char-btn" onClick={onRestart}>↩ New Character</button>
    </aside>
  );
}
