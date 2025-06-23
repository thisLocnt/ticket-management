"use client";

import { useState } from "react";
import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Plus, Circle, Clock, CheckCircle2 } from "lucide-react";
import {
  useTicketStore,
  type Ticket,
  type TicketStatus,
} from "client/src/store/ticket-store";
import { ticketApi } from "client/src/api/ticket";
import { KanbanTicketCard } from "../TicketCard/KanbanTicketCard";
import { AddTicketModal } from "../../AddTicketModal";
import styles from "./KanbanBoard.module.scss";

const COLUMNS = [
  {
    id: "todo" as TicketStatus,
    title: "To Do",
    icon: Circle,
    className: "todo",
  },
  {
    id: "inprogress" as TicketStatus,
    title: "In Progress",
    icon: Clock,
    className: "inprogress",
  },
  {
    id: "done" as TicketStatus,
    title: "Done",
    icon: CheckCircle2,
    className: "done",
  },
];

export function KanbanBoard() {
  const { getTicketsByStatus, users, moveTicket, addTicket } = useTicketStore();
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dragOverColumn, setDragOverColumn] = useState<TicketStatus | null>(
    null
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const ticket = getTicketsByStatus("todo")
      .concat(getTicketsByStatus("inprogress"))
      .concat(getTicketsByStatus("done"))
      .find((t) => t.id === active.id);

    setActiveTicket(ticket || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (
      over &&
      typeof over.id === "string" &&
      COLUMNS.some((col) => col.id === over.id)
    ) {
      setDragOverColumn(over.id as TicketStatus);
    } else {
      setDragOverColumn(null);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveTicket(null);
    setDragOverColumn(null);

    if (!over) return;

    const ticketId = active.id as number;
    const newStatus = over.id as TicketStatus;

    if (COLUMNS.some((col) => col.id === newStatus)) {
      moveTicket(ticketId, newStatus);

      // Update backend
      try {
        if (newStatus === "done") {
          await ticketApi.completeTicket(ticketId);
        } else {
          await ticketApi.incompleteTicket(ticketId);
        }
      } catch (error) {
        console.error("Failed to update ticket status:", error);
        // Optionally revert the optimistic update
      }
    }
  };

  const handleCreateTicket = async (description: string) => {
    try {
      const newTicket = await ticketApi.createTicket(description);
      addTicket({ ...newTicket, status: "todo" });
    } catch (err) {
      throw new Error("Failed to create ticket");
    }
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className={styles["kanbanBoard"]}>
          {COLUMNS.map((column) => {
            const tickets = getTicketsByStatus(column.id);
            const IconComponent = column.icon;

            return (
              <div
                key={column.id}
                className={`${styles["column"]} ${styles[column.className]}`}
              >
                <div className={styles["columnHeader"]}>
                  <div className={styles["columnTitle"]}>
                    <div
                      className={`${styles["statusIcon"]} ${
                        styles[column.className]
                      }`}
                    />
                    {column.title}
                  </div>
                  <div className={styles["ticketCount"]}>{tickets.length}</div>
                </div>

                <div
                  className={`${styles["dropZone"]} ${
                    dragOverColumn === column.id ? styles["dragOver"] : ""
                  }`}
                  data-column={column.id}
                >
                  <div className={styles["ticketsList"]}>
                    {tickets.length === 0 ? (
                      <div className={styles["emptyColumn"]}>
                        <IconComponent className={styles["emptyIcon"]} />
                        <p>No tickets in {column.title.toLowerCase()}</p>
                      </div>
                    ) : (
                      tickets.map((ticket) => (
                        <KanbanTicketCard
                          key={ticket.id}
                          ticket={ticket}
                          users={users}
                        />
                      ))
                    )}
                  </div>

                  {column.id === "todo" && (
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className={styles["addTicketButton"]}
                    >
                      <Plus className={styles["icon"]} />
                      Add a ticket
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <DragOverlay>
          {activeTicket ? (
            <KanbanTicketCard ticket={activeTicket} users={users} isDragging />
          ) : null}
        </DragOverlay>
      </DndContext>

      <AddTicketModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTicket}
      />
    </>
  );
}
