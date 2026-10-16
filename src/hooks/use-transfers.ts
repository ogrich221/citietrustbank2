import { useState, useEffect, useCallback } from "react";
import {
  getStoredTransfers,
  getStoredAccounts,
  saveTransfer,
  updateTransferStatus,
  resetTransfersToDefault,
  type BankTransfer,
  type BankAccount,
  type TransferStatus,
} from "@/lib/transfers-store";

export function useTransfers() {
  const [transfers, setTransfers] = useState<BankTransfer[]>([]);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const refresh = useCallback(() => {
    setTransfers(getStoredTransfers());
    setAccounts(getStoredAccounts());
  }, []);

  useEffect(() => {
    refresh();
    setIsLoaded(true);

    const handleUpdate = () => {
      refresh();
    };

    window.addEventListener("citietrust_transfers_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("citietrust_transfers_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [refresh]);

  return {
    transfers,
    accounts,
    isLoaded,
    refresh,
    saveTransfer,
    updateTransferStatus,
    resetTransfersToDefault,
  };
}
