import type { Ticket, User } from "client/src/store/ticket-store";
import { CheckCircle, Circle, UserIcon, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import styles from "./TicketCard.module.scss";

interface TicketCardProps {
  ticket: Ticket;
  users: User[];
}

export const TicketCard = ({ ticket, users }: TicketCardProps) => {
  const assignee = users.find((user) => user.id === ticket.assigneeId);

  const getStatusBadgeClass = () => {
    if (ticket.status) {
      return styles[ticket.status];
    }
    return ticket.completed ? styles["completed"] : styles["pending"];
  };

  const getStatusLabel = () => {
    if (ticket.status) {
      switch (ticket.status) {
        case "todo":
          return "To Do";
        case "inprogress":
          return "In Progress";
        case "done":
          return "Done";
        default:
          return "To Do";
      }
    }
    return ticket.completed ? "Done" : "To Do";
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

        <div className={`${styles["statusBadge"]} ${getStatusBadgeClass()}`}>
          {getStatusLabel()}
        </div>
      </div>
    </Link>
  );
};
