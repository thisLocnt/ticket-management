"use client";

import type React from "react";
import { useState } from "react";
import { X, Plus } from "lucide-react";
import { LoadingSpinner } from "../loading-spinner/LoadingSpinner";
import styles from "./AddTicketModal.module.scss";

interface AddTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (description: string) => Promise<void>;
}

export const AddTicketModal = ({
  isOpen,
  onClose,
  onSubmit,
}: AddTicketModalProps) => {
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(description.trim());
      setDescription("");
      onClose();
    } catch (error) {
      console.error("Failed to create ticket:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles["modalOverlay"]}>
      <div className={styles["modalContent"]}>
        <div className={styles["modalHeader"]}>
          <h2 className={styles["modalTitle"]}>Create New Ticket</h2>
          <button
            onClick={onClose}
            className={styles["closeButton"]}
            disabled={isSubmitting}
          >
            <X className={styles["icon"]} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles["formGroup"]}>
            <label htmlFor="description" className={styles["label"]}>
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={styles["textarea"]}
              placeholder="Enter ticket description..."
              disabled={isSubmitting}
              required
            />
          </div>

          <div className={styles["buttonGroup"]}>
            <button
              type="button"
              onClick={onClose}
              className={`${styles["button"]} ${styles["secondary"]}`}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`${styles["button"]} ${styles["primary"]}`}
              disabled={isSubmitting || !description.trim()}
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className={styles["icon"]} />
                  Create Ticket
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
