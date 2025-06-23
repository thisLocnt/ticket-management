"use client";

import { useEffect, useState } from "react";
import { Plus, Filter, Search, LayoutGrid, List } from "lucide-react";
import { useTicketStore } from "../../store/ticket-store";
import { ticketApi } from "../../api/ticket";
import { TicketCard } from "../../components/TicketCard/TicketCard";
import { KanbanBoard } from "client/src/components/Kanban/Board/KanbanBoard";
import { AddTicketModal } from "../../components/AddTicketModal/AddTicketModal";
import { LoadingSpinner } from "../../components/loading-spinner/LoadingSpinner";
import styles from "./tickets.module.scss";

export function Tickets() {
  const {
    tickets,
    users,
    loading,
    error,
    filter,
    viewMode,
    setTickets,
    setUsers,
    setLoading,
    setError,
    setFilter,
    setViewMode,
    addTicket,
    filteredTickets,
  } = useTicketStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [ticketsData, usersData] = await Promise.all([
          ticketApi.getTickets(),
          ticketApi.getUsers(),
        ]);

        setTickets(ticketsData);
        setUsers(usersData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [setTickets, setUsers, setLoading, setError]);

  const handleCreateTicket = async (description: string) => {
    try {
      const newTicket = await ticketApi.createTicket(description);
      addTicket({ ...newTicket, status: "todo" });
    } catch (err) {
      throw new Error("Failed to create ticket");
    }
  };

  const displayedTickets = filteredTickets().filter((ticket) =>
    ticket.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFilterCount = (filterType: typeof filter) => {
    switch (filterType) {
      case "completed":
        return tickets.filter((t) => t.completed).length;
      case "pending":
        return tickets.filter((t) => !t.completed).length;
      default:
        return tickets.length;
    }
  };

  if (loading) {
    return (
      <div className={styles["loadingContainer"]}>
        <div className={styles["loadingContent"]}>
          <LoadingSpinner size="lg" />
          <p>Loading tickets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles["errorContainer"]}>
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className={styles["ticketsContainer"]}>
      <div className="space-y-lg">
        {/* Controls */}
        <div className={styles["controls"]}>
          <div className={styles["leftControls"]}>
            <div className={styles["viewToggle"]}>
              <button
                onClick={() => setViewMode("kanban")}
                className={viewMode === "kanban" ? styles["active"] : ""}
              >
                <LayoutGrid size={16} />
                Board
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={viewMode === "list" ? styles["active"] : ""}
              >
                <List size={16} />
                List
              </button>
            </div>

            {viewMode === "list" && (
              <div className={styles["filterGroup"]}>
                <Filter size={16} />
                <div className={styles["filterTabs"]}>
                  {(["all", "pending", "completed"] as const).map(
                    (filterOption) => (
                      <button
                        key={filterOption}
                        onClick={() => setFilter(filterOption)}
                        className={`${styles["filterTab"]} ${
                          filter === filterOption ? styles["active"] : ""
                        }`}
                      >
                        {filterOption === "all"
                          ? "All"
                          : filterOption === "pending"
                          ? "To Do"
                          : "Done"}
                        <span className={styles["filterCount"]}>
                          {getFilterCount(filterOption)}
                        </span>
                      </button>
                    )
                  )}
                </div>
              </div>
            )}
          </div>

          <div className={styles["rightControls"]}>
            {viewMode === "list" && (
              <div className={styles["searchContainer"]}>
                <Search className={styles["searchIcon"]} />
                <input
                  type="text"
                  placeholder="Search tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles["searchInput"]}
                />
              </div>
            )}

            <button
              onClick={() => setIsModalOpen(true)}
              className={`btn primary ${styles["createButton"]}`}
            >
              <Plus size={16} />
              Create Ticket
            </button>
          </div>
        </div>

        {/* Content */}
        {viewMode === "kanban" ? (
          <KanbanBoard />
        ) : (
          <>
            {displayedTickets.length === 0 ? (
              <div className={styles["emptyState"]}>
                <div className={styles["emptyIcon"]}>
                  <Filter size={48} />
                </div>
                <h3>No tickets found</h3>
                <p>
                  {searchTerm
                    ? "Try adjusting your search terms"
                    : "Get started by creating your first ticket"}
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn primary"
                  >
                    Create First Ticket
                  </button>
                )}
              </div>
            ) : (
              <div className={styles["ticketsGrid"]}>
                {displayedTickets.map((ticket) => (
                  <TicketCard key={ticket.id} ticket={ticket} users={users} />
                ))}
              </div>
            )}
          </>
        )}

        <AddTicketModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateTicket}
        />
      </div>
    </div>
  );
}

export default Tickets;
