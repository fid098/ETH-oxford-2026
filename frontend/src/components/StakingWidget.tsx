import { useState } from "react";
import { api } from "../api";
import "./StakingWidget.css";

interface Props {
  claimId: string;
  onSuccess: () => void;
}

export default function StakingWidget({ claimId, onSuccess }: Props) {
  const [side, setSide] = useState<"yes" | "no">("yes");
  const [stake, setStake] = useState(10);
  const [confidence, setConfidence] = useState(0.7);
  const [username, setUsername] = useState("alice");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      await api.createPosition({
        claim_id: claimId,
        username,
        side,
        stake,
        confidence,
      });
      onSuccess();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to stake");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="staking-widget card">
      <h3 className="staking-title">Take a Position</h3>

      <div className="staking-field">
        <label className="staking-label">Acting as</label>
        <select
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        >
          <option value="alice">alice</option>
          <option value="bob">bob</option>
          <option value="charlie">charlie</option>
          <option value="diana">diana</option>
          <option value="eve">eve</option>
        </select>
      </div>

      <div className="staking-sides">
        <button
          className={`side-btn side-yes ${side === "yes" ? "selected" : ""}`}
          onClick={() => setSide("yes")}
        >
          True
        </button>
        <button
          className={`side-btn side-no ${side === "no" ? "selected" : ""}`}
          onClick={() => setSide("no")}
        >
          False
        </button>
      </div>

      <div className="staking-field">
        <div className="staking-label-row">
          <label className="staking-label">Stake</label>
          <span className="staking-value">{stake} pts</span>
        </div>
        <input
          type="range"
          min={1}
          max={500}
          value={stake}
          onChange={(e) => setStake(Number(e.target.value))}
        />
      </div>

      <div className="staking-field">
        <div className="staking-label-row">
          <label className="staking-label">Confidence</label>
          <span className="staking-value">{Math.round(confidence * 100)}%</span>
        </div>
        <input
          type="range"
          min={50}
          max={99}
          value={Math.round(confidence * 100)}
          onChange={(e) => setConfidence(Number(e.target.value) / 100)}
        />
      </div>

      {error && <div className="staking-error">{error}</div>}

      <button
        className={`btn staking-submit ${side === "yes" ? "btn-green" : "btn-red"}`}
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Submitting..." : `Stake ${stake} pts on ${side === "yes" ? "True" : "False"}`}
      </button>
    </div>
  );
}
