import { useState } from "react";
import { api } from "../api";
import { toast } from "./Toast";
import "./CreateClaimModal.css";

const CATEGORIES = ["crypto", "ai", "policy", "tech", "science"];

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateClaimModal({ open, onClose, onCreated }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("crypto");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    setLoading(true);
    try {
      await api.createClaim({ title: title.trim(), description: description.trim(), category });
      toast("Claim created successfully", "success");
      setTitle("");
      setDescription("");
      setCategory("crypto");
      onCreated();
      onClose();
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to create claim", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">New Claim</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-field">
            <label className="modal-label">Title</label>
            <input
              type="text"
              placeholder="e.g. Bitcoin will hit $200k by 2027"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          <div className="modal-field">
            <label className="modal-label">Description</label>
            <textarea
              placeholder="Describe the claim and resolution criteria..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="modal-field">
            <label className="modal-label">Category</label>
            <div className="category-pills">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`category-pill ${category === cat ? "active" : ""}`}
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
            disabled={loading || !title.trim() || !description.trim()}
          >
            {loading ? "Creating..." : "Create Claim"}
          </button>
        </form>
      </div>
    </div>
  );
}
