import { create } from "zustand";

export interface Ticket {
  id: number;
  description: string;
  assigneeId: number | null;
  completed: boolean;
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

  // Actions
  setTickets: (tickets: Ticket[]) => void;
  setUsers: (users: User[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilter: (filter: "all" | "completed" | "pending") => void;
  addTicket: (ticket: Ticket) => void;
  updateTicket: (id: number, updates: Partial<Ticket>) => void;
  removeTicket: (id: number) => void;

  // Computed
  filteredTickets: () => Ticket[];
  getTicketById: (id: number) => Ticket | undefined;
}

export const useTicketStore = create<TicketStore>((set, get) => ({
  tickets: [],
  users: [],
  loading: false,
  error: null,
  filter: "all",

  setTickets: (tickets) => set({ tickets }),
  setUsers: (users) => set({ users }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setFilter: (filter) => set({ filter }),
  addTicket: (ticket) =>
    set((state) => ({ tickets: [...state.tickets, ticket] })),
  updateTicket: (id, updates) =>
    set((state) => ({
      tickets: state.tickets.map((ticket) =>
        ticket.id === id ? { ...ticket, ...updates } : ticket
      ),
    })),
  removeTicket: (id) =>
    set((state) => ({
      tickets: state.tickets.filter((ticket) => ticket.id !== id),
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
}));
