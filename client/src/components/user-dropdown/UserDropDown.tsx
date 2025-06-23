"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, User } from "lucide-react";
import type { User as UserType } from "client/src/store/ticket-store";
import styles from "./UserDropdown.module.scss";

interface UserDropdownProps {
  users: UserType[];
  value: number | null;
  onChange: (userId: number | null) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function UserDropdown({
  users,
  value,
  onChange,
  disabled = false,
  placeholder = "Unassigned",
}: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedUser = users.find((user) => user.id === value);

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

  const handleSelect = (userId: number | null) => {
    onChange(userId);
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
        <div className={styles["userInfo"]}>
          {selectedUser ? (
            <>
              <div className={styles["avatar"]}>
                {selectedUser.name.charAt(0).toUpperCase()}
              </div>
              <span>{selectedUser.name}</span>
            </>
          ) : (
            <>
              <User size={16} />
              <span className={styles["unassigned"]}>{placeholder}</span>
            </>
          )}
        </div>
        <ChevronDown
          className={`${styles["icon"]} ${isOpen ? styles["rotated"] : ""}`}
        />
      </button>

      {isOpen && (
        <div className={styles["menu"]}>
          <div
            className={`${styles["option"]} ${
              value === null ? styles["selected"] : ""
            }`}
            onClick={() => handleSelect(null)}
          >
            <User size={16} />
            <span className={styles["unassigned"]}>Unassigned</span>
          </div>
          {users.map((user) => (
            <div
              key={user.id}
              className={`${styles["option"]} ${
                value === user.id ? styles["selected"] : ""
              }`}
              onClick={() => handleSelect(user.id)}
            >
              <div className={styles["avatar"]}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span>{user.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
