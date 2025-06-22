import type { Ticket, User } from "../store/ticket-store";
import { CheckCircle, Circle, UserIcon, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import styles from "./TicketCard.module.scss";

interface TicketCardProps {
  ticket: Ticket;
  users: User[];
}

export const TicketCard = ({ ticket, users }: TicketCardProps) => {
  const assignee = users.find((user) => user.id === ticket.assigneeId);

  return (
    <Link to={`/ticket/${ticket.id}`} className={styles['ticketCard']}>
      <div className={styles['cardContent']}>
        <div className={styles['cardMain']}>
          <div className={styles['ticketHeader']}>
            {ticket.completed ? (
              <CheckCircle
                className={`${styles['icon']} ${styles['lg']} ${styles['green']}`}
              />
            ) : (
              <Circle
                className={`${styles['icon']} ${styles['lg']} ${styles['gray']}`}
              />
            )}
            <span className={styles['ticketId']}>TICKET-{ticket['id']}</span>
          </div>

          <h3 className={styles['ticketTitle']}>{ticket.description}</h3>

          <div className={styles['ticketMeta']}>
            {assignee && (
              <div className={styles['metaItem']}>
                <UserIcon className={styles['icon']} />
                <span>{assignee['name']}</span>
              </div>
            )}
            <div className={styles['metaItem']}>
              <Calendar className={styles['icon']} />
              <span>{ticket.completed ? "Completed" : "In Progress"}</span>
            </div>
          </div>
        </div>

        <div
          className={`${styles['statusBadge']} ${
            ticket.completed ? styles['completed'] : styles['pending']
          }`}
        >
          {ticket.completed ? "Done" : "To Do"}
        </div>
      </div>
    </Link>
  );
};
