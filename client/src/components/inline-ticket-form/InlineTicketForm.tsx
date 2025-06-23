"use client";

import type React from "react";
import { useState } from "react";
import { X, Plus } from "lucide-react";
import type { TicketStatus, User } from "client/src/store/ticket-store";
import { StatusDropdown } from "../status-dropdown/StatusDropdown";
import { UserDropdown } from "../user-dropdown/UserDropDown";
import { LoadingSpinner } from "../loading-spinner/LoadingSpinner";
import styles from "./InlineTicketForm.module.scss";

interface InlineTicketFormProps {
  users: User[];
  onSubmit: (data: {
    description: string;
    status: TicketStatus;
    assigneeId: number | null;
  }) => Promise<void>;
  onCancel: () => void;
}

export function InlineTicketForm({
  users,
  onSubmit,
  onCancel,
}: InlineTicketFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TicketStatus>("todo");
  const [assigneeId, setAssigneeId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        description: description.trim(),
        status,
        assigneeId,
      });
      // Reset form
      setDescription("");
      setStatus("todo");
      setAssigneeId(null);
      onCancel();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create ticket");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className={styles["ticketForm"]} onSubmit={handleSubmit}>
      <div className={styles["formHeader"]}>
        <span className={styles["formTitle"]}>Create Issue</span>
        <button
          type="button"
          onClick={onCancel}
          className={styles["closeButton"]}
          disabled={isSubmitting}
        >
          <X size={16} />
        </button>
      </div>

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Add a description..."
        className={styles["descriptionTextarea"]}
        disabled={isSubmitting}
      />

      <div className={styles["formRow"]}>
        <div className={styles["formField"]}>
          <label className={styles["label"]}>Status</label>
          <StatusDropdown
            value={status}
            onChange={setStatus}
            disabled={isSubmitting}
          />
        </div>
        <div className={styles["formField"]}>
          <label className={styles["label"]}>Assignee</label>
          <UserDropdown
            users={users}
            value={assigneeId}
            onChange={setAssigneeId}
            disabled={isSubmitting}
          />
        </div>
      </div>

      {error && <div className={styles["errorMessage"]}>{error}</div>}

      <div className={styles["formActions"]}>
        <button
          type="button"
          onClick={onCancel}
          className={`${styles["button"]} ${styles["secondary"]}`}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className={`${styles["button"]} ${styles["primary"]}`}
          disabled={isSubmitting || !title.trim()}
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner size="sm" />
              Creating...
            </>
          ) : (
            <>
              <Plus className={styles["icon"]} />
              Create
            </>
          )}
        </button>
      </div>
    </form>
  );
}
