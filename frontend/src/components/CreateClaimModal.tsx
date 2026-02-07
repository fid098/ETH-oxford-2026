import { useState } from "react";
import { api } from "../api";
import { toast } from "./Toast";
import { useCurrentUser } from "../state/currentUser";
import "./CreateClaimModal.css";

const CATEGORIES = ["crypto", "ai", "policy", "tech", "science"];

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateClaimModal({ open, onClose, onCreated }: Props) {
  const { currentUser } = useCurrentUser();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("crypto");
  const [resolutionType, setResolutionType] = useState<"manual" | "oracle">("manual");
  const [oracleFeed, setOracleFeed] = useState("ETH/USD");
  const [oracleComparator, setOracleComparator] = useState<">" | ">=" | "<" | "<=">(">");
  const [oracleTarget, setOracleTarget] = useState("");
  const [resolutionDate, setResolutionDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [showValidation, setShowValidation] = useState(false);

  const buildValidationMessage = (
    nextTitle: string,
    nextDescription: string,
    nextResolutionType: "manual" | "oracle",
    nextTarget: string,
    nextResolutionDate: string
  ) => {
    const missingTitle = !nextTitle.trim();
    const missingDescription = !nextDescription.trim();
    const missingTarget = nextResolutionType === "oracle" && !nextTarget.trim();
    const missingDate = nextResolutionType === "oracle" && !nextResolutionDate.trim();
    if (!missingTitle && !missingDescription && !missingTarget && !missingDate) return "";
    if (missingTitle && missingDescription)
      return "Please enter a title and a description.";
    if (nextResolutionType === "oracle" && (missingTarget || missingDate)) {
      if (missingTarget && missingDate) return "Please enter a target price and resolution date.";
      if (missingTarget) return "Please enter a target price.";
      return "Please select a resolution date.";
    }
    return missingTitle
      ? "Please enter a title."
      : "Please enter a description.";
  };

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowValidation(true);
    const message = buildValidationMessage(
      title,
      description,
      resolutionType,
      oracleTarget,
      resolutionDate
    );
    if (message) {
      setValidationError(message);
      return;
    }
    setValidationError("");
    setLoading(true);
    try {
      const resolutionPayload =
        resolutionType === "oracle"
          ? {
              resolution_type: "oracle" as const,
              resolution_date: resolutionDate ? new Date(resolutionDate).toISOString() : null,
              oracle_config: {
                type: "chainlink_price" as const,
                feed: oracleFeed,
                comparator: oracleComparator,
                target: Number(oracleTarget),
              },
            }
          : {
              resolution_type: "manual" as const,
              resolution_date: null,
              oracle_config: null,
            };
      await api.createClaim({
        title: title.trim(),
        description: description.trim(),
        category,
        created_by: currentUser,
        ...resolutionPayload,
      });
      toast("Claim created successfully", "success");
      setTitle("");
      setDescription("");
      setCategory("crypto");
      setResolutionType("manual");
      setOracleFeed("ETH/USD");
      setOracleComparator(">");
      setOracleTarget("");
      setResolutionDate("");
      setShowValidation(false);
      onCreated();
      onClose();
    } catch (err: unknown) {
      toast(
        err instanceof Error ? err.message : "Failed to create claim",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">New Claim</h2>
          <button className="modal-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-field">
            <label className="modal-label">Title</label>
            <input
              type="text"
              placeholder="e.g. Bitcoin will hit $200k by 2027"
              value={title}
              onChange={(e) => {
                const next = e.target.value;
                setTitle(next);
                if (showValidation) {
                  setValidationError(
                    buildValidationMessage(
                      next,
                      description,
                      resolutionType,
                      oracleTarget,
                      resolutionDate
                    )
                  );
                }
              }}
              autoFocus
              aria-invalid={showValidation && !title.trim()}
            />
          </div>

          <div className="modal-field">
            <label className="modal-label">Description</label>
            <textarea
              placeholder="Describe the claim and resolution criteria..."
              value={description}
              onChange={(e) => {
                const next = e.target.value;
                setDescription(next);
                if (showValidation) {
                  setValidationError(
                    buildValidationMessage(
                      title,
                      next,
                      resolutionType,
                      oracleTarget,
                      resolutionDate
                    )
                  );
                }
              }}
              rows={3}
              aria-invalid={showValidation && !description.trim()}
            />
          </div>

          <div className="modal-field">
            <label className="modal-label">Resolution</label>
            <div className="resolution-toggle">
              <button
                type="button"
                className={`resolution-pill ${resolutionType === "manual" ? "active" : ""}`}
                onClick={() => {
                  setResolutionType("manual");
                  if (showValidation) {
                    setValidationError(
                      buildValidationMessage(title, description, "manual", oracleTarget, resolutionDate)
                    );
                  }
                }}
              >
                Manual
              </button>
              <button
                type="button"
                className={`resolution-pill ${resolutionType === "oracle" ? "active" : ""}`}
                onClick={() => {
                  setResolutionType("oracle");
                  if (showValidation) {
                    setValidationError(
                      buildValidationMessage(title, description, "oracle", oracleTarget, resolutionDate)
                    );
                  }
                }}
              >
                Chainlink Oracle
              </button>
            </div>
            <p className="resolution-help text-muted">
              Oracle claims resolve automatically based on on-chain data.
            </p>
          </div>

          {resolutionType === "oracle" && (
            <div className="oracle-config">
              <div className="modal-field">
                <label className="modal-label">Oracle Feed</label>
                <select value={oracleFeed} onChange={(e) => setOracleFeed(e.target.value)}>
                  <option value="ETH/USD">ETH/USD</option>
                  <option value="BTC/USD">BTC/USD</option>
                  <option value="LINK/USD">LINK/USD</option>
                </select>
              </div>
              <div className="modal-field oracle-condition">
                <label className="modal-label">Condition</label>
                <div className="oracle-condition-row">
                  <select
                    value={oracleComparator}
                    onChange={(e) => setOracleComparator(e.target.value as ">" | ">=" | "<" | "<=")}
                  >
                    <option value=">">&gt;</option>
                    <option value=">=">&gt;=</option>
                    <option value="<">&lt;</option>
                    <option value="<=">&lt;=</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Target price"
                    value={oracleTarget}
                    onChange={(e) => {
                      const next = e.target.value;
                      setOracleTarget(next);
                      if (showValidation) {
                        setValidationError(
                          buildValidationMessage(title, description, resolutionType, next, resolutionDate)
                        );
                      }
                    }}
                    aria-invalid={showValidation && resolutionType === "oracle" && !oracleTarget.trim()}
                  />
                </div>
              </div>
              <div className="modal-field">
                <label className="modal-label">Resolution Date</label>
                <input
                  type="datetime-local"
                  value={resolutionDate}
                  onChange={(e) => {
                    const next = e.target.value;
                    setResolutionDate(next);
                    if (showValidation) {
                      setValidationError(
                        buildValidationMessage(title, description, resolutionType, oracleTarget, next)
                      );
                    }
                  }}
                  aria-invalid={showValidation && resolutionType === "oracle" && !resolutionDate.trim()}
                />
              </div>
            </div>
          )}

          <div className="modal-field">
            <label className="modal-label">Category</label>
            <div className="category-pills">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`category-pill ${
                    category === cat ? "active" : ""
                  }`}
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-green modal-submit"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Claim"}
          </button>
          {validationError && (
            <div className="modal-error" role="alert">
              {validationError}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
