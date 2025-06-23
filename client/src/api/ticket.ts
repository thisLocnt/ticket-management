import type { Ticket, User } from "../store/ticket-store";

const API_BASE = "/api";

// Add delay simulation for development
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const ticketApi = {
  async getTickets(): Promise<Ticket[]> {
    await delay(800); // Simulate API delay
    const response = await fetch(`${API_BASE}/tickets`);
    if (!response.ok) throw new Error("Failed to fetch tickets");
    return response.json();
  },

  async getTicket(id: number): Promise<Ticket> {
    const response = await fetch(`${API_BASE}/tickets/${id}`);
    if (!response.ok) throw new Error("Failed to fetch ticket");
    return response.json();
  },

  async getUsers(): Promise<User[]> {
    await delay(500);
    const response = await fetch(`${API_BASE}/users`);
    if (!response.ok) throw new Error("Failed to fetch users");
    return response.json();
  },

  async createTicket(description: string): Promise<Ticket> {
    await delay(600);
    const response = await fetch(`${API_BASE}/tickets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description }),
    });
    if (!response.ok) throw new Error("Failed to create ticket");
    return response.json();
  },

  async updateTicket(id: number, updates: Partial<Ticket>): Promise<Ticket> {
    await delay(400);
    const response = await fetch(`${API_BASE}/tickets/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error("Failed to update ticket");
    return response.json();
  },

  // Updated to match backend endpoint structure
  async assignTicket(ticketId: number, userId: number): Promise<void> {
    const response = await fetch(
      `${API_BASE}/tickets/${ticketId}/assign/${userId}`,
      {
        method: "PUT",
      }
    );
    if (!response.ok) throw new Error("Failed to assign ticket");
  },

  async unassignTicket(ticketId: number): Promise<void> {
    const response = await fetch(`${API_BASE}/tickets/${ticketId}/unassign`, {
      method: "PUT",
    });
    if (!response.ok) throw new Error("Failed to unassign ticket");
  },

  async completeTicket(ticketId: number): Promise<void> {
    const response = await fetch(`${API_BASE}/tickets/${ticketId}/complete`, {
      method: "PUT",
    });
    if (!response.ok) throw new Error("Failed to complete ticket");
  },

  async incompleteTicket(ticketId: number): Promise<void> {
    const response = await fetch(`${API_BASE}/tickets/${ticketId}/complete`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to mark ticket as incomplete");
  },
};
