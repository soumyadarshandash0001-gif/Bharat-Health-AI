import React from 'react';
import { calculateHealthScores, getScoreColor } from '../utils/scoring';
import { getProfile } from '../utils/memory';

const ScoreRing = ({ score, label, inverted, size = 64 }) => {
  const val = inverted ? 10 - score : score;
  const color = getScoreColor(score, inverted);
  const pct = (val / 10) * 100;
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;

  return (
    <div className="score-ring-wrap">
      <svg width={size} height={size} className="score-ring-svg">
        <circle cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
        <circle cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={c} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease', transform: 'rotate(-90deg)', transformOrigin: 'center' }} />
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central"
          fill={color} fontSize="15" fontWeight="700">{inverted ? score : score}</text>
      </svg>
      <div className="score-ring-label">{label}</div>
    </div>
  );
};

const HealthScorePanel = ({ lang }) => {
  const profile = getProfile();
  if (!profile.onboarded) return null;

  const scores = calculateHealthScores(profile);
  const isHi = lang === 'hi';

  return (
    <div className="health-score-panel">
      <div className="score-header">
        <span className="score-title">📊 {isHi ? 'Health Score' : 'Health Score'}</span>
        <span className="score-overall" style={{ color: getScoreColor(scores.overall) }}>
          {scores.overall}/10
        </span>
      </div>

      <div className="score-rings">
        <ScoreRing score={scores.proteinScore} label={isHi ? 'प्रोटीन' : 'Protein'} />
        <ScoreRing score={scores.sugarRisk} label={isHi ? 'शुगर Risk' : 'Sugar Risk'} inverted />
        <ScoreRing score={scores.dietQuality} label={isHi ? 'डाइट' : 'Diet'} />
        <ScoreRing score={scores.consistencyScore} label={isHi ? 'निरंतरता' : 'Streak'} />
      </div>

      {scores.fixes.length > 0 && (
        <div className="score-fixes">
          {scores.fixes.slice(0, 2).map((fix, i) => (
            <div key={i} className={`score-fix ${fix.priority}`}>
              <span>{fix.emoji}</span>
              <span>{fix.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HealthScorePanel;
