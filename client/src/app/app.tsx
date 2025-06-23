"use client";

import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useTicketStore } from "../store/ticket-store";
import { ticketApi } from "../api/ticket";
import Tickets from "./tickets/tickets";
import TicketDetails from "./ticket-details/ticket-details";
import { LayoutGrid, List } from "lucide-react";
import styles from "./app.module.scss";

const App = () => {
  const { setTickets, setUsers, setLoading, setError, viewMode, setViewMode } =
    useTicketStore();

  useEffect(() => {
    const fetchInitialData = async () => {
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

    fetchInitialData();
  }, [setTickets, setUsers, setLoading, setError]);

  return (
      <div className={styles["app"]}>
        <div className={styles["container"]}>
          <div className={styles["header"]}>
            <div className={styles["headerContent"]}>
              <div className={styles["jiraLogo"]}>
                <div className={styles["logoIcon"]}>J</div>
                Jira Clone
              </div>
              <div className={styles["titleSection"]}>
                <h1>Project Board</h1>
                <p>Manage and track your team's work efficiently</p>
              </div>
              <div className={styles["headerActions"]}>
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
              </div>
            </div>
          </div>
          <Routes>
            <Route path="/" element={<Tickets />} />
            <Route path="/ticket/:id" element={<TicketDetails />} />
          </Routes>
        </div>
      </div>
  );
};

export default App;
