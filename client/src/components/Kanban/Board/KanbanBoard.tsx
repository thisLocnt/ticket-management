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
import { Plus, Circle, CheckCircle2 } from "lucide-react";
import {
  useTicketStore,
  type Ticket,
  type TicketStatus,
} from "client/src/store/ticket-store";

import styles from "./KanbanBoard.module.scss";
import { ticketApi } from "client/src/api/ticket";
import { InlineTicketForm } from "../../inline-ticket-form/InlineTicketForm";
import { KanbanTicketCard } from "../TicketCard/KanbanTicketCard";

// Simplified to match server API - only TODO and DONE
const COLUMNS = [
  {
    id: "todo" as TicketStatus,
    title: "To Do",
    icon: Circle,
    className: "todo",
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
  const [showInlineForm, setShowInlineForm] = useState(false);

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
      .concat(getTicketsByStatus("done"))
      .find((t) => t.id === ticketId);

    if (!currentTicket || currentTicket.status === newStatus) {
      return; // No change needed
    }

    // Optimistically update the UI
    moveTicket(ticketId, newStatus);

    // Update backend based on status transitions
    try {
      const wasCompleted = currentTicket.completed;
      const willBeCompleted = newStatus === "done";

      if (!wasCompleted && willBeCompleted) {
        // Moving to done - mark as complete
        await ticketApi.completeTicket(ticketId);
      } else if (wasCompleted && !willBeCompleted) {
        // Moving from done to todo - mark as incomplete
        await ticketApi.incompleteTicket(ticketId);
      }

      // Ensure the ticket state is consistent
      updateTicket(ticketId, {
        status: newStatus,
        completed: newStatus === "done",
      });
    } catch (error) {
      console.error("Failed to update ticket status:", error);
      // Revert the optimistic update on error
      moveTicket(
        ticketId,
        currentTicket.status || (currentTicket.completed ? "done" : "todo")
      );
      alert(`Failed to update ticket status. Please try again.`);
    }
  };

  const handleCreateTicket = async (data: {
    description: string;
    status: TicketStatus;
    assigneeId: number | null;
  }) => {
    try {
      // Create the ticket with the title as description (server requirement)
      const newTicket = await ticketApi.createTicket(
        data.description
      );

      // Handle assignment if specified
      if (data.assigneeId) {
        await ticketApi.assignTicket(newTicket.id, data.assigneeId);
        newTicket.assigneeId = data.assigneeId;
      }

      // Handle completion status if creating as done
      if (data.status === "done") {
        await ticketApi.completeTicket(newTicket.id);
        newTicket.completed = true;
      }

      // Add to store with proper status
      addTicket({
        ...newTicket,
        status: data.status,
        completed: data.status === "done",
      });
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
                    {/* Inline form for TODO column */}
                    {column.id === "todo" && showInlineForm && (
                      <InlineTicketForm
                        users={users}
                        onSubmit={handleCreateTicket}
                        onCancel={() => setShowInlineForm(false)}
                      />
                    )}

                    {tickets.length === 0 && !showInlineForm ? (
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

                  {column.id === "todo" && !showInlineForm && (
                    <button
                      onClick={() => setShowInlineForm(true)}
                      className={styles["addTicketButton"]}
                    >
                      <Plus className={styles["icon"]} />
                      Create
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
    </>
  );
}
