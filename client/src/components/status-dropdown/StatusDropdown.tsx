"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import type { TicketStatus } from "client/src/store/ticket-store";
import { StatusBadge } from "../status-badge/StatusBadge";
import styles from "./StatusDropdown.module.scss";

interface StatusDropdownProps {
  value: TicketStatus;
  onChange: (status: TicketStatus) => void;
  disabled?: boolean;
}

// Simplified to match server API - only TODO and DONE
const STATUS_OPTIONS: { value: TicketStatus; label: string }[] = [
  { value: "todo", label: "To Do" },
  { value: "done", label: "Done" },
];

export function StatusDropdown({
  value,
  onChange,
  disabled = false,
}: StatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (status: TicketStatus) => {
    onChange(status);
    setIsOpen(false);
  };

  return (
    <div className={styles["dropdown"]} ref={dropdownRef}>
      <button
        type="button"
        className={`${styles["trigger"]} ${isOpen ? styles["open"] : ""}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <StatusBadge status={value} />
        <ChevronDown
          className={`${styles["icon"]} ${isOpen ? styles["rotated"] : ""}`}
        />
      </button>

      {isOpen && (
        <div className={styles["menu"]}>
          {STATUS_OPTIONS.map((option) => (
            <div
              key={option.value}
              className={`${styles["option"]} ${
                value === option.value ? styles["selected"] : ""
              }`}
              onClick={() => handleSelect(option.value)}
            >
              <div
                className={`${styles["statusIcon"]} ${styles[option.value]}`}
              />
              <span>{option.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
