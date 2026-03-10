import { useState } from "react";
import { RACES, CLASSES, CLASS_STATS, RACE_BONUS } from "../constants/gameData";
import "../styles/intro.css";

/**
 * CharacterCreation — the intro screen where players choose name, race, and class.
 * @param {{ onBegin: (form) => void }} props
 */
export default function CharacterCreation({ onBegin }) {
  const [form, setForm] = useState({ name: "", race: "", class: "" });

  const canBegin = form.name.trim() && form.race && form.class;

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  return (
    <div className="intro-screen">
      <div className="intro-crest">⚔️</div>
      <h1 className="intro-title">Dungeon Master</h1>
      <p className="intro-subtitle">An AI-Powered Adventure</p>

      <div className="parchment-card">
        <div className="corner corner-tl" />
        <div className="corner corner-tr" />
        <div className="corner corner-bl" />
        <div className="corner corner-br" />

        {/* Name */}
        <div className="form-section">
          <label className="form-label" htmlFor="character-name">Thy Name</label>
          <input
            id="character-name"
            className="name-input"
            placeholder="Enter your name..."
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            maxLength={30}
          />
        </div>

        {/* Race */}
        <div className="form-section">
          <label className="form-label">Race</label>
          <div className="grid-races">
            {RACES.map((r) => (
              <button
                key={r}
                className={`option-btn ${form.race === r ? "selected" : ""}`}
                onClick={() => set("race", r)}
              >
                {r}
              </button>
            ))}
          </div>
          <div className="race-bonus">
            {form.race ? `✦ ${RACE_BONUS[form.race]}` : ""}
          </div>
        </div>

        {/* Class */}
        <div className="form-section">
          <label className="form-label">Class</label>
          <div className="grid-classes">
            {CLASSES.map((c) => (
              <button
                key={c}
                className={`option-btn ${form.class === c ? "selected" : ""}`}
                onClick={() => set("class", c)}
              >
                {c}
              </button>
            ))}
          </div>
          {form.class && (
            <div className="race-bonus">
              ✦ HP {CLASS_STATS[form.class].hp} · ATK {CLASS_STATS[form.class].attack} · DEF{" "}
              {CLASS_STATS[form.class].defense} · MAG {CLASS_STATS[form.class].magic}
            </div>
          )}
        </div>

        <button className="begin-btn" disabled={!canBegin} onClick={() => onBegin(form)}>
          Begin Thy Quest
        </button>
      </div>
    </div>
  );
}
