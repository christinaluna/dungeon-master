import "../styles/endScreens.css";

const END_CONFIG = {
  death: {
    icon: "💀",
    title: "Thou Hast Fallen",
    titleColor: "#cf5a4d",
    buttonLabel: "Rise Again",
  },
  victory: {
    icon: "👑",
    title: "Legend Achieved",
    titleColor: "#d4a017",
    buttonLabel: "Begin Anew",
  },
};

/**
 * EndScreen — shown on death or victory with the final story moment and a restart button.
 * @param {{ phase: "death" | "victory", reason: string, onRestart: () => void }} props
 */
export default function EndScreen({ phase, reason, onRestart }) {
  const cfg = END_CONFIG[phase];
  if (!cfg) return null;

  return (
    <div className="endscreen">
      <div className="end-icon">{cfg.icon}</div>
      <h2 className="end-title" style={{ color: cfg.titleColor }}>{cfg.title}</h2>
      <p className="end-reason">{reason}</p>
      <button className="restart-btn" onClick={onRestart}>{cfg.buttonLabel}</button>
    </div>
  );
}
