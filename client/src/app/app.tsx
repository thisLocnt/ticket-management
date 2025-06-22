// import { useEffect, useState } from 'react';
// import { Routes, Route } from 'react-router-dom';
// import { Ticket, User } from '@acme/shared-models';

// import styles from './app.module.css';
// import Tickets from './tickets/tickets';

// const App = () => {
//   const [tickets, setTickets] = useState([] as Ticket[]);
//   const [users, setUsers] = useState([] as User[]);

//   // Very basic way to synchronize state with server.
//   // Feel free to use any state/fetch library you want (e.g. react-query, xstate, redux, etc.).
//   useEffect(() => {
//     async function fetchTickets() {
//       const data = await fetch('/api/tickets').then();
//       setTickets(await data.json());
//     }

//     async function fetchUsers() {
//       const data = await fetch('/api/users').then();
//       setUsers(await data.json());
//     }

//     fetchTickets();
//     fetchUsers();
//   }, []);

//   return (
//     <div className={styles['app']}>
//       <h1>Ticketing App</h1>
//       <Routes>
//         <Route path="/" element={<Tickets tickets={tickets} />} />
//         {/* Hint: Try `npx nx g component TicketDetails --project=client --no-export` to generate this component  */}
//         <Route path="/:id" element={<h2>Details Not Implemented</h2>} />
//       </Routes>
//     </div>
//   );
// };

// export default App;


"use client"

import { useEffect } from "react"
import { Routes, Route } from "react-router-dom"
import { useTicketStore } from "../store/ticket-store"
import { ticketApi } from "../api/ticket"
import Tickets from "./tickets/tickets"
import styles from "./app.module.scss"
import TicketDetails from "./ticket-details/ticket-details"

const App = () => {
  const { setTickets, setUsers, setLoading, setError } = useTicketStore()

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true)
      setError(null)

      try {
        const [ticketsData, usersData] = await Promise.all([ticketApi.getTickets(), ticketApi.getUsers()])

        setTickets(ticketsData)
        setUsers(usersData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data")
      } finally {
        setLoading(false)
      }
    }

    fetchInitialData()
  }, [setTickets, setUsers, setLoading, setError])

  return (
    // <ErrorBoundary>
    // </ErrorBoundary>
      <div className={styles['app']}>
        <div className={styles['container']}>
          <div className={styles['header']}>
            <h1>Ticketing App</h1>
            <p>Manage and track your team's work efficiently</p>
          </div>
          <Routes>
            <Route path="/" element={<Tickets />} />
            <Route path="/ticket/:id" element={<TicketDetails />} />
          </Routes>
        </div>
      </div>
  )
}

export default App

