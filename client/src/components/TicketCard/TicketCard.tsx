import type { Ticket, User } from "client/src/store/ticket-store";
import { CheckCircle, Circle, UserIcon, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { StatusBadge } from "../status-badge/StatusBadge";
import styles from "./TicketCard.module.scss";

interface TicketCardProps {
  ticket: Ticket;
  users: User[];
}

export const TicketCard = ({ ticket, users }: TicketCardProps) => {
  const assignee = users.find((user) => user.id === ticket.assigneeId);

  const getStatusForBadge = () => {
    if (ticket.status) {
      return ticket.status;
    }
    return ticket.completed ? "completed" : "pending";
  };

  return (
    <Link to={`/ticket/${ticket.id}`} className={styles["ticketCard"]}>
      <div className={styles["cardContent"]}>
        <div className={styles["cardMain"]}>
          <div className={styles["ticketHeader"]}>
            {ticket.completed || ticket.status === "done" ? (
              <CheckCircle
                className={`${styles["icon"]} ${styles["lg"]} ${styles["green"]}`}
              />
            ) : (
              <Circle
                className={`${styles["icon"]} ${styles["lg"]} ${styles["gray"]}`}
              />
            )}
            <span className={styles["ticketId"]}>TICKET-{ticket.id}</span>
          </div>

          <h3 className={styles["ticketTitle"]}>{ticket.description}</h3>

          <div className={styles["ticketMeta"]}>
            {assignee && (
              <div className={styles["metaItem"]}>
                <UserIcon className={styles["icon"]} />
                <span>{assignee.name}</span>
              </div>
            )}
            <div className={styles["metaItem"]}>
              <Calendar className={styles["icon"]} />
              <span>
                {ticket.completed || ticket.status === "done"
                  ? "Completed"
                  : "In Progress"}
              </span>
            </div>
          </div>
        </div>

        <StatusBadge status={getStatusForBadge()} />
      </div>
    </Link>
  );
};
