"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  UserIcon,
  Calendar,
  CheckCircle,
  Circle,
  UserPlus,
  RotateCcw,
} from "lucide-react";
import { useTicketStore } from "../../store/ticket-store";
import { ticketApi } from "../../api/ticket";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import styles from "./TicketDetails.module.scss";

export function TicketDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tickets, users, updateTicket, getTicketById } = useTicketStore();

  const [assignLoading, setAssignLoading] = useState(false);
  const [completeLoading, setCompleteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ticketId = Number.parseInt(id || "0");
  const ticket = getTicketById(ticketId);
  const assignee = users.find((user) => user.id === ticket?.assigneeId);

  useEffect(() => {
    if (!ticket && tickets.length > 0) {
      navigate("/");
    }
  }, [ticket, tickets.length, navigate]);

  const handleAssignTicket = async (assigneeId: number) => {
    if (!ticket) return;

    setAssignLoading(true);
    setError(null);
    try {
      await ticketApi.assignTicket(ticket.id, assigneeId);
      updateTicket(ticket.id, { assigneeId });
    } catch (error) {
      setError("Failed to assign ticket");
      console.error("Failed to assign ticket:", error);
    } finally {
      setAssignLoading(false);
    }
  };

  const handleUnassignTicket = async () => {
    if (!ticket) return;

    setAssignLoading(true);
    setError(null);
    try {
      await ticketApi.unassignTicket(ticket.id);
      updateTicket(ticket.id, { assigneeId: null });
    } catch (error) {
      setError("Failed to unassign ticket");
      console.error("Failed to unassign ticket:", error);
    } finally {
      setAssignLoading(false);
    }
  };

  const handleToggleComplete = async () => {
    if (!ticket) return;

    setCompleteLoading(true);
    setError(null);
    try {
      if (ticket.completed) {
        await ticketApi.incompleteTicket(ticket.id);
        updateTicket(ticket.id, { completed: false });
      } else {
        await ticketApi.completeTicket(ticket.id);
        updateTicket(ticket.id, { completed: true });
      }
    } catch (error) {
      setError(`Failed to ${ticket.completed ? "reopen" : "complete"} ticket`);
      console.error("Failed to toggle ticket completion:", error);
    } finally {
      setCompleteLoading(false);
    }
  };

  if (!ticket) {
    return (
      <div className={styles["loadingContainer"]}>
        <div className={styles["loadingContent"]}>
          <LoadingSpinner size="lg" />
          <p>Loading ticket...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles["detailsContainer"]}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <Link to="/" className={styles["backLink"]}>
            <ArrowLeft className={styles["icon"]} />
            Back to Tickets
          </Link>
        </div>

        {/* Error Display */}
        {error && (
          <div className={styles["errorAlert"]}>
            <p>{error}</p>
            <button
              onClick={() => setError(null)}
              className={styles["dismissButton"]}
            >
              ×
            </button>
          </div>
        )}

        {/* Ticket Header */}
        <div className={styles["ticketCard"]}>
          <div className={styles["ticketHeader"]}>
            <div className={styles["ticketInfo"]}>
              {ticket.completed ? (
                <CheckCircle
                  className={`${styles["icon"]} ${styles["xl"]} ${styles["green"]}`}
                />
              ) : (
                <Circle
                  className={`${styles["icon"]} ${styles["xl"]} ${styles["gray"]}`}
                />
              )}
              <div className={styles["ticketTitle"]}>
                <h1>TICKET-{ticket.id}</h1>
                <div
                  className={`${styles["statusBadge"]} ${
                    ticket.completed ? styles["completed"] : styles["pending"]
                  }`}
                >
                  {ticket.completed ? "Done" : "To Do"}
                </div>
              </div>
            </div>

            <button
              onClick={handleToggleComplete}
              disabled={completeLoading}
              className={styles["toggleButton"]}
            >
              {completeLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  {ticket.completed ? "Reopening..." : "Completing..."}
                </>
              ) : (
                <>
                  {ticket.completed ? (
                    <>
                      <RotateCcw className={styles["icon"]} />
                      Reopen Ticket
                    </>
                  ) : (
                    <>
                      <CheckCircle className={styles["icon"]} />
                      Mark Complete
                    </>
                  )}
                </>
              )}
            </button>
          </div>

          <div className={styles["ticketContent"]}>
            <div className="space-y-4">
              <div className={styles["descriptionSection"]}>
                <h2>Description</h2>
                <p>{ticket.description}</p>
              </div>

              <div className={styles["metaGrid"]}>
                <div className={styles["metaItem"]}>
                  <h3>Assignee</h3>
                  {assignee ? (
                    <div className={styles["metaValue"]}>
                      <UserIcon
                        className={`${styles["icon"]} ${styles["lg"]} ${styles["grayDark"]}`}
                      />
                      <span>{assignee.name}</span>
                      <button
                        onClick={handleUnassignTicket}
                        disabled={assignLoading}
                        className={styles["unassignButton"]}
                      >
                        Unassign
                      </button>
                    </div>
                  ) : (
                    <div
                      className={`${styles["metaValue"]} ${styles["unassigned"]}`}
                    >
                      Unassigned
                    </div>
                  )}
                </div>

                <div className={styles["metaItem"]}>
                  <h3>Status</h3>
                  <div className={styles["metaValue"]}>
                    <Calendar
                      className={`${styles["icon"]} ${styles["lg"]} ${styles["grayDark"]}`}
                    />
                    <span>
                      {ticket.completed ? "Completed" : "In Progress"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Assignment Section */}
        <div className={styles["assignmentCard"]}>
          <h2 className={styles["assignmentHeader"]}>
            <UserPlus className={`${styles["icon"]} ${styles["lg"]}`} />
            Assign Ticket
          </h2>

          <div className={styles["userGrid"]}>
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => handleAssignTicket(user.id)}
                disabled={assignLoading || ticket.assigneeId === user.id}
                className={`${styles["userButton"]} ${
                  ticket.assigneeId === user.id ? styles["assigned"] : ""
                }`}
              >
                <UserIcon className={styles["icon"]} />
                <span className={styles["userName"]}>{user.name}</span>
                {ticket.assigneeId === user.id && (
                  <CheckCircle
                    className={`${styles["icon"]} ${styles["checkIcon"]}`}
                  />
                )}
              </button>
            ))}
          </div>

          {assignLoading && (
            <div className={styles["assignmentLoading"]}>
              <LoadingSpinner size="sm" />
              <span>Updating assignment...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TicketDetails;
