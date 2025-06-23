"use client";

import type React from "react";

import { useState } from "react";
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import { Plus, Circle, Clock, CheckCircle2 } from "lucide-react";
import {
  useTicketStore,
  type Ticket,
  type TicketStatus,
} from "client/src/store/ticket-store";
import { ticketApi } from "client/src/api/ticket";
import { KanbanTicketCard } from "../TicketCard/KanbanTicketCard";
import { AddTicketModal } from "../../AddTicketModal/AddTicketModal";
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

function DroppableColumn({
  id,
  children,
  className,
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`${styles["dropZone"]} ${isOver ? styles["dragOver"] : ""} ${
        className || ""
      }`}
      data-column={id}
    >
      {children}
    </div>
  );
}

export function KanbanBoard() {
  const { getTicketsByStatus, users, moveTicket, addTicket, updateTicket } =
    useTicketStore();
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveTicket(null);

    if (!over) return;

    const ticketId = active.id as number;
    const newStatus = over.id as TicketStatus;

    // Check if the drop target is a valid column
    if (!COLUMNS.some((col) => col.id === newStatus)) {
      return;
    }

    const currentTicket = getTicketsByStatus("todo")
      .concat(getTicketsByStatus("inprogress"))
      .concat(getTicketsByStatus("done"))
      .find((t) => t.id === ticketId);

    if (!currentTicket || currentTicket.status === newStatus) {
      return; // No change needed
    }

    // Optimistically update the UI
    moveTicket(ticketId, newStatus);

    // Update backend based on status transitions
    try {
      const wasCompleted = currentTicket.status === "done";
      const willBeCompleted = newStatus === "done";

      if (!wasCompleted && willBeCompleted) {
        // Moving to done - mark as complete
        await ticketApi.completeTicket(ticketId);
      } else if (wasCompleted && !willBeCompleted) {
        // Moving from done to any other status - mark as incomplete
        await ticketApi.incompleteTicket(ticketId);
      }
      // For todo <-> inprogress transitions, no additional API call needed
      // as the status is handled by the moveTicket action

      // Ensure the ticket state is consistent
      updateTicket(ticketId, {
        status: newStatus,
        completed: newStatus === "done",
      });
    } catch (error) {
      console.error("Failed to update ticket status:", error);
      // Revert the optimistic update on error
      moveTicket(ticketId, currentTicket.status);

      // Show user-friendly error message
      // You could add a toast notification here
      alert(`Failed to update ticket status. Please try again.`);
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
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
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

                <DroppableColumn id={column.id}>
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
                </DroppableColumn>
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
