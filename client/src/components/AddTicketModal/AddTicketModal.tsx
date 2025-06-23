"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { X, Plus, FileText } from "lucide-react";
import type { TicketStatus, User } from "client/src/store/ticket-store";
import { StatusDropdown } from "../status-dropdown/StatusDropdown";
import { UserDropdown } from "../user-dropdown/UserDropDown";
import { LoadingSpinner } from "../loading-spinner/LoadingSpinner";
import styles from "./AddTicketModal.module.scss";

interface AddTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    description: string;
    status: TicketStatus;
    assigneeId: number | null;
  }) => Promise<void>;
  users: User[];
}

export const AddTicketModal = ({
  isOpen,
  onClose,
  onSubmit,
  users,
}: AddTicketModalProps) => {
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TicketStatus>("todo");
  const [assigneeId, setAssigneeId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setDescription("");
      setStatus("todo");
      setAssigneeId(null);
      setError(null);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, isSubmitting, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError("Description is required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        description: description.trim(),
        status,
        assigneeId,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create ticket");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose();
    }
  };

  return (
    <div className={styles["modalOverlay"]} onClick={handleOverlayClick}>
      <div className={styles["modalContainer"]}>
        <div className={styles["modalContent"]}>
          {/* Modal Header */}
          <div className={styles["modalHeader"]}>
            <div className={styles["headerContent"]}>
              <div className={styles["headerIcon"]}>
                <FileText size={20} />
              </div>
              <div className={styles["headerText"]}>
                <h1 className={styles["modalTitle"]}>Create issue</h1>
                <p className={styles["modalSubtitle"]}>
                  Create a new issue to track work, bugs, or feature requests
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={styles["closeButton"]}
              disabled={isSubmitting}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>

          <div className={styles["modalBody"]}>
            <form onSubmit={handleSubmit} className={styles["form"]}>
              {/* Description Field */}
              <div className={styles["formSection"]}>
                <div className={styles["fieldGroup"]}>
                  <label htmlFor="description" className={styles["fieldLabel"]}>
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add a more detailed description of the issue..."
                    className={styles["textareaInput"]}
                    disabled={isSubmitting}
                    rows={4}
                  />
                  {/* {error && !description.trim() && (
                    <div className={styles["fieldError"]}>
                      Description is required
                    </div>
                  )} */}
                </div>
              </div>

              {/* Form Grid - Status and Assignee */}
              <div className={styles["formGrid"]}>
                <div className={styles["fieldGroup"]}>
                  <label className={styles["fieldLabel"]}>Status</label>
                  <StatusDropdown
                    value={status}
                    onChange={setStatus}
                    disabled={isSubmitting}
                  />
                </div>

                <div className={styles["fieldGroup"]}>
                  <label className={styles["fieldLabel"]}>Assignee</label>
                  <UserDropdown
                    users={users}
                    value={assigneeId}
                    onChange={setAssigneeId}
                    disabled={isSubmitting}
                    placeholder="Assign to someone"
                  />
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className={styles["errorAlert"]}>
                  <div className={styles["errorContent"]}>
                    <span className={styles["errorIcon"]}>⚠️</span>
                    <span className={styles["errorText"]}>{error}</span>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Modal Footer */}
          <div className={styles["modalFooter"]}>
            <div className={styles["footerActions"]}>
              <button
                type="button"
                onClick={onClose}
                className={`${styles["button"]} ${styles["buttonSecondary"]}`}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                className={`${styles["button"]} ${styles["buttonPrimary"]}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    <span>Create issue</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
