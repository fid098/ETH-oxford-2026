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
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [showValidation, setShowValidation] = useState(false);

  const buildValidationMessage = (
    nextTitle: string,
    nextDescription: string
  ) => {
    const missingTitle = !nextTitle.trim();
    const missingDescription = !nextDescription.trim();
    if (!missingTitle && !missingDescription) return "";
    if (missingTitle && missingDescription)
      return "Please enter a title and a description.";
    return missingTitle
      ? "Please enter a title."
      : "Please enter a description.";
  };

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowValidation(true);
    const message = buildValidationMessage(title, description);
    if (message) {
      setValidationError(message);
      return;
    }
    setValidationError("");
    setLoading(true);
    try {
      await api.createClaim({
        title: title.trim(),
        description: description.trim(),
        category,
        created_by: currentUser,
      });
      toast("Claim created successfully", "success");
      setTitle("");
      setDescription("");
      setCategory("crypto");
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
                  setValidationError(buildValidationMessage(next, description));
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
                  setValidationError(buildValidationMessage(title, next));
                }
              }}
              rows={3}
              aria-invalid={showValidation && !description.trim()}
            />
          </div>

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
