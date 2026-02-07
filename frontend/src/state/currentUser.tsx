import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const USERS = ["alice", "bob", "charlie", "diana", "eve", "frank", "grace", "hector"];

type CurrentUserContextValue = {
  currentUser: string;
  setCurrentUser: (next: string) => void;
  users: string[];
};

const CurrentUserContext = createContext<CurrentUserContextValue | null>(null);

export function CurrentUserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState(() => {
    if (typeof window === "undefined") return USERS[0];
    return localStorage.getItem("currentUser") ?? USERS[0];
  });

  useEffect(() => {
    localStorage.setItem("currentUser", currentUser);
  }, [currentUser]);

  const value = useMemo(
    () => ({ currentUser, setCurrentUser, users: USERS }),
    [currentUser]
  );

  return (
    <CurrentUserContext.Provider value={value}>
      {children}
    </CurrentUserContext.Provider>
  );
}

export function useCurrentUser() {
  const ctx = useContext(CurrentUserContext);
  if (!ctx) {
    throw new Error("useCurrentUser must be used within CurrentUserProvider");
  }
  return ctx;
}
