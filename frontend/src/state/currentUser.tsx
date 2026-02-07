import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAccount, useChainId, useSignMessage } from "wagmi";
import { api } from "../api";
import { toast } from "../components/Toast";

const USERS = ["alice", "bob", "charlie", "diana", "eve", "frank", "grace", "hector"];

type CurrentUserContextValue = {
  currentUser: string;
  setCurrentUser: (next: string) => void;
  users: string[];
  walletAddress?: string;
  walletStatus: "disconnected" | "signing" | "verifying" | "authenticated" | "error";
  walletError: string | null;
};

const CurrentUserContext = createContext<CurrentUserContextValue | null>(null);

export function CurrentUserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState(() => {
    if (typeof window === "undefined") return USERS[0];
    return localStorage.getItem("currentUser") ?? USERS[0];
  });
  const [walletStatus, setWalletStatus] = useState<
    "disconnected" | "signing" | "verifying" | "authenticated" | "error"
  >("disconnected");
  const [walletError, setWalletError] = useState<string | null>(null);
  const [walletAuthedAddress, setWalletAuthedAddress] = useState<string | null>(null);

  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const chainId = useChainId();

  useEffect(() => {
    localStorage.setItem("currentUser", currentUser);
  }, [currentUser]);

  const buildSiweMessage = (addr: string, nonce: string) => {
    if (typeof window === "undefined") return "";
    const domain = window.location.host;
    const origin = window.location.origin;
    const statement = "Sign in to Oracle.";
    const issuedAt = new Date().toISOString();
    return `${domain} wants you to sign in with your Ethereum account:\n${addr}\n\n${statement}\n\nURI: ${origin}\nVersion: 1\nChain ID: ${chainId}\nNonce: ${nonce}\nIssued At: ${issuedAt}`;
  };

  const linkWallet = async (addr: string) => {
    try {
      setWalletError(null);
      setWalletStatus("signing");
      const { nonce } = await api.getAuthNonce(addr);
      const message = buildSiweMessage(addr, nonce);
      const signature = await signMessageAsync({ message });
      setWalletStatus("verifying");
      await api.connectWallet({ message, signature });
      setWalletAuthedAddress(addr);
      setWalletStatus("authenticated");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Wallet authentication failed";
      setWalletError(message);
      setWalletStatus("error");
      toast(message, "error");
    }
  };

  useEffect(() => {
    if (!isConnected || !address) {
      setWalletStatus("disconnected");
      setWalletError(null);
      setWalletAuthedAddress(null);
      return;
    }
    if (walletStatus === "authenticated" && walletAuthedAddress?.toLowerCase() === address.toLowerCase()) {
      return;
    }
    void linkWallet(address);
  }, [address, isConnected]);

  const effectiveUser =
    walletStatus === "authenticated" && address ? address : currentUser;

  const value = useMemo(
    () => ({
      currentUser: effectiveUser,
      setCurrentUser,
      users: USERS,
      walletAddress: address,
      walletStatus,
      walletError,
    }),
    [effectiveUser, address, walletStatus, walletError, currentUser]
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
