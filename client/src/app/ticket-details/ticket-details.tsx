"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Calendar, CheckCircle, Circle } from "lucide-react";
import { useTicketStore, type TicketStatus } from "../../store/ticket-store";
import { ticketApi } from "../../api/ticket";
import { LoadingSpinner } from "client/src/components/loading-spinner/LoadingSpinner";
import { StatusBadge } from "client/src/components/status-badge/StatusBadge";
import { StatusDropdown } from "client/src/components/status-dropdown/StatusDropdown";
import { UserDropdown } from "client/src/components/user-dropdown/UserDropDown";
import styles from "./TicketDetails.module.scss";

export function TicketDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tickets, users, updateTicket, getTicketById } = useTicketStore();

  const [assignLoading, setAssignLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ticketId = Number.parseInt(id || "0");
  const ticket = getTicketById(ticketId);

  useEffect(() => {
    if (!ticket && tickets.length > 0) {
      navigate("/");
    }
  }, [ticket, tickets.length, navigate]);

  const handleStatusChange = async (newStatus: TicketStatus) => {
    if (!ticket) return;

    setStatusLoading(true);
    setError(null);
    try {
      const wasCompleted = ticket.completed;
      const willBeCompleted = newStatus === "done";

      // Handle completion status changes
      if (!wasCompleted && willBeCompleted) {
        await ticketApi.completeTicket(ticket.id);
      } else if (wasCompleted && !willBeCompleted) {
        await ticketApi.incompleteTicket(ticket.id);
      }

      updateTicket(ticket.id, {
        status: newStatus,
        completed: newStatus === "done",
      });
    } catch (error) {
      setError("Failed to update ticket status");
      console.error("Failed to update ticket status:", error);
    } finally {
      setStatusLoading(false);
    }
  };

  const handleAssigneeChange = async (assigneeId: number | null) => {
    if (!ticket) return;

    setAssignLoading(true);
    setError(null);
    try {
      if (assigneeId) {
        await ticketApi.assignTicket(ticket.id, assigneeId);
      } else {
        await ticketApi.unassignTicket(ticket.id);
      }
      updateTicket(ticket.id, { assigneeId });
    } catch (error) {
      setError("Failed to update ticket assignment");
      console.error("Failed to update ticket assignment:", error);
    } finally {
      setAssignLoading(false);
    }
  };

  if (!ticket) {
    return (
      <div className={styles["loadingContainer"]}>
        <div className={styles["loadingContent"]}>
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  const currentStatus: TicketStatus =
    ticket.status || (ticket.completed ? "done" : "todo");

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
                <StatusBadge status={currentStatus} />
              </div>
            </div>

            <div className={styles["statusControls"]}>
              <StatusDropdown
                value={currentStatus}
                onChange={handleStatusChange}
                disabled={statusLoading}
              />
            </div>
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
                  <UserDropdown
                    users={users}
                    value={ticket.assigneeId}
                    onChange={handleAssigneeChange}
                    disabled={assignLoading}
                  />
                  {assignLoading && (
                    <div className={styles["loadingIndicator"]}>
                      <LoadingSpinner size="sm" />
                      <span>Updating...</span>
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
      </div>
    </div>
  );
}

export default TicketDetails;
