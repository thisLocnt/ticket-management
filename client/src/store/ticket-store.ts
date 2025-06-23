import { create } from "zustand";

export type TicketStatus = "todo" | "inprogress" | "done";

export interface Ticket {
  id: number;
  description: string;
  assigneeId: number | null;
  completed: boolean;
  status: TicketStatus;
}

export interface User {
  id: number;
  name: string;
}

interface TicketStore {
  tickets: Ticket[];
  users: User[];
  loading: boolean;
  error: string | null;
  filter: "all" | "completed" | "pending";
  viewMode: "list" | "kanban";

  // Actions
  setTickets: (tickets: Ticket[]) => void;
  setUsers: (users: User[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilter: (filter: "all" | "completed" | "pending") => void;
  setViewMode: (mode: "list" | "kanban") => void;
  addTicket: (ticket: Ticket) => void;
  updateTicket: (id: number, updates: Partial<Ticket>) => void;
  removeTicket: (id: number) => void;
  moveTicket: (ticketId: number, newStatus: TicketStatus) => void;

  // Computed
  filteredTickets: () => Ticket[];
  getTicketById: (id: number) => Ticket | undefined;
  getTicketsByStatus: (status: TicketStatus) => Ticket[];
}

// Helper function to convert completed boolean to status
const getStatusFromCompleted = (completed: boolean): TicketStatus => {
  return completed ? "done" : "todo";
};

// Helper function to convert status to completed boolean
const getCompletedFromStatus = (status: TicketStatus): boolean => {
  return status === "done";
};

export const useTicketStore = create<TicketStore>((set, get) => ({
  tickets: [],
  users: [],
  loading: false,
  error: null,
  filter: "all",
  viewMode: "kanban",

  setTickets: (tickets) =>
    set({
      tickets: tickets.map((ticket) => ({
        ...ticket,
        status: ticket.status || getStatusFromCompleted(ticket.completed),
      })),
    }),
  setUsers: (users) => set({ users }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setFilter: (filter) => set({ filter }),
  setViewMode: (mode) => set({ viewMode: mode }),
  addTicket: (ticket) =>
    set((state) => ({
      tickets: [
        ...state.tickets,
        {
          ...ticket,
          status: ticket.status || getStatusFromCompleted(ticket.completed),
        },
      ],
    })),
  updateTicket: (id, updates) =>
    set((state) => ({
      tickets: state.tickets.map((ticket) =>
        ticket.id === id
          ? {
              ...ticket,
              ...updates,
              status:
                updates.status ||
                (updates.completed !== undefined
                  ? getStatusFromCompleted(updates.completed)
                  : ticket.status),
              completed:
                updates.completed !== undefined
                  ? updates.completed
                  : getCompletedFromStatus(updates.status || ticket.status),
            }
          : ticket
      ),
    })),
  removeTicket: (id) =>
    set((state) => ({
      tickets: state.tickets.filter((ticket) => ticket.id !== id),
    })),
  moveTicket: (ticketId, newStatus) =>
    set((state) => ({
      tickets: state.tickets.map((ticket) =>
        ticket.id === ticketId
          ? {
              ...ticket,
              status: newStatus,
              completed: getCompletedFromStatus(newStatus),
            }
          : ticket
      ),
    })),

  filteredTickets: () => {
    const { tickets, filter } = get();
    switch (filter) {
      case "completed":
        return tickets.filter((ticket) => ticket.completed);
      case "pending":
        return tickets.filter((ticket) => !ticket.completed);
      default:
        return tickets;
    }
  },

  getTicketById: (id) => {
    const { tickets } = get();
    return tickets.find((ticket) => ticket.id === id);
  },

  getTicketsByStatus: (status) => {
    const { tickets } = get();
    return tickets.filter((ticket) => ticket.status === status);
  },
}));
