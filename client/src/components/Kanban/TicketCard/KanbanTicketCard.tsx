"use client";

import { useDraggable } from "@dnd-kit/core";
import { Link } from "react-router-dom";
import { GripVertical, User } from "lucide-react";
import { Ticket, User as UserType } from "client/src/store/ticket-store";
import { StatusBadge } from "../../status-badge/StatusBadge";
import styles from "./KanbanTicketCard.module.scss";

interface KanbanTicketCardProps {
  ticket: Ticket;
  users: UserType[];
  isDragging?: boolean;
}

export function KanbanTicketCard({
  ticket,
  users,
  isDragging = false,
}: KanbanTicketCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: ticket.id,
  });

  const assignee = users.find((user) => user.id === ticket.assigneeId);

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles["ticketCard"]} ${
        isDragging ? styles["dragging"] : ""
      }`}
      {...attributes}
      {...listeners}
    >
      <Link to={`/ticket/${ticket.id}`} className={styles["cardLink"]}>
        <div className={styles["ticketHeader"]}>
          <div className={styles["ticketId"]}>TICKET-{ticket.id}</div>
          <div className={styles["priorityIndicator"]} />
        </div>

        <div className={styles["ticketTitle"]}>{ticket.description}</div>

        <div className={styles["ticketFooter"]}>
          <div className={styles["assignee"]}>
            {assignee ? (
              <>
                <div className={styles["avatar"]}>
                  {assignee.name.charAt(0).toUpperCase()}
                </div>
                <span>{assignee.name}</span>
              </>
            ) : (
              <>
                <User size={16} />
                <span className={styles["unassigned"]}>Unassigned</span>
              </>
            )}
          </div>

          <StatusBadge status={ticket.status!} />
        </div>
      </Link>

      <div className={styles["dragHandle"]}>
        <GripVertical size={16} />
      </div>
    </div>
  );
}
