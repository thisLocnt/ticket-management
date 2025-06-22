// import { Ticket } from '@acme/shared-models';
// import styles from './tickets.module.css';

// export interface TicketsProps {
//   tickets: Ticket[];
// }

// export function Tickets(props: TicketsProps) {
//   return (
//     <div className={styles['tickets']}>
//       <h2>Tickets</h2>
//       {props.tickets ? (
//         <ul>
//           {props.tickets.map((t) => (
//             <li key={t.id}>
//               Ticket: {t.id}, {t.description}
//             </li>
//           ))}
//         </ul>
//       ) : (
//         <span>...</span>
//       )}
//     </div>
//   );
// }

// export default Tickets;

"use client";

import { useEffect, useState } from "react";
import { Plus, Filter, Search } from "lucide-react";
import { useTicketStore } from "../../store/ticket-store";
import { ticketApi } from "../../api/ticket";
import { TicketCard } from "../../components/TicketCard";
import { AddTicketModal } from "../../components/AddTicketModal";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import styles from "./tickets.module.scss";

export function Tickets() {
  const {
    tickets,
    users,
    loading,
    error,
    filter,
    setTickets,
    setUsers,
    setLoading,
    setError,
    setFilter,
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
      addTicket(newTicket);
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
      <div className="space-y-6">
        {/* Header */}
        <div className={styles["header"]}>
          <div className={styles["headerContent"]}>
            <h1>Tickets</h1>
            <p>Manage and track your team's work</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className={styles["createButton"]}
          >
            <Plus className={styles["icon"]} />
            Create Ticket
          </button>
        </div>

        {/* Filters and Search */}
        <div className={styles["filtersSection"]}>
          <div className={styles["filterGroup"]}>
            <Filter className={styles["icon"]} />
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
        </div>

        {/* Tickets Grid */}
        {displayedTickets.length === 0 ? (
          <div className={styles["emptyState"]}>
            <div className={styles["emptyIcon"]}>
              <Filter />
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
                className={styles["createButton"]}
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
