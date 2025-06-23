import type { TicketStatus } from "client/src/store/ticket-store";
import styles from "./StatusBadge.module.scss";

interface StatusBadgeProps {
  status: TicketStatus | "completed" | "pending";
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "todo":
      case "pending":
        return "To Do";
      case "done":
      case "completed":
        return "Done";
      default:
        return "To Do";
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "todo":
      case "pending":
        return "todo";
      case "done":
      case "completed":
        return "done";
      default:
        return "todo";
    }
  };

  return (
    <span
      className={`${styles["statusBadge"]} ${
        styles[getStatusClass(status)]
      } ${className}`}
    >
      {getStatusLabel(status)}
    </span>
  );
}
