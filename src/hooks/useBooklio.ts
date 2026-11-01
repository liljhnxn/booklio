"use client";

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { BOOKLIO_CONTRACT_ADDRESS } from "@/contracts/contractAddress";
import { BOOKLIO_ABI } from "@/contracts/BooklioABI";
import { useState, useCallback } from "react";

export interface ServiceItem {
  id: bigint;
  name: string;
  description: string;
  owner: `0x${string}`;
  active: boolean;
}

export interface SlotItem {
  id: bigint;
  serviceId: bigint;
  appointmentTime: bigint;
  isAvailable: boolean;
}

export interface BookingDetailItem {
  id: bigint;
  slotId: bigint;
  serviceId: bigint;
  serviceName: string;
  appointmentTime: bigint;
  customer: `0x${string}`;
  serviceOwner: `0x${string}`;
  bookingTime: bigint;
  status: number; // 0: Pending, 1: Confirmed, 2: Cancelled, 3: Completed
}

export interface DashboardStats {
  totalServices: bigint;
  availableSlotsCount: bigint;
  totalBookingsCount: bigint;
  confirmedBookingsCount: bigint;
}

export function useBooklio() {
  const { address, isConnected } = useAccount();

  // Read Services
  const {
    data: servicesData,
    isLoading: isLoadingServices,
    refetch: refetchServices,
  } = useReadContract({
    address: BOOKLIO_CONTRACT_ADDRESS,
    abi: BOOKLIO_ABI,
    functionName: "getAllServices",
  });

  // Read Dashboard Stats
  const {
    data: statsData,
    isLoading: isLoadingStats,
    refetch: refetchStats,
  } = useReadContract({
    address: BOOKLIO_CONTRACT_ADDRESS,
    abi: BOOKLIO_ABI,
    functionName: "getDashboardStats",
  });

  // Read Connected Wallet's Bookings
  const {
    data: myBookingsData,
    isLoading: isLoadingMyBookings,
    refetch: refetchMyBookings,
  } = useReadContract({
    address: BOOKLIO_CONTRACT_ADDRESS,
    abi: BOOKLIO_ABI,
    functionName: "getMyBookingsDetailed",
    account: address,
  });

  const refetchAll = useCallback(() => {
    refetchServices();
    refetchStats();
    if (address) {
      refetchMyBookings();
    }
  }, [refetchServices, refetchStats, refetchMyBookings, address]);

  // Mutations
  const { writeContractAsync, isPending: isTxSending } = useWriteContract();

  const [activeTxHash, setActiveTxHash] = useState<`0x${string}` | undefined>(undefined);
  const [txActionName, setTxActionName] = useState<string>("");

  const {
    isLoading: isTxWaiting,
    isSuccess: isTxSuccess,
    isError: isTxReceiptError,
    error: txReceiptError,
  } = useWaitForTransactionReceipt({
    hash: activeTxHash,
  });

  // Action handlers
  const createService = async (name: string, description: string) => {
    try {
      setTxActionName("Creating Service...");
      const hash = await writeContractAsync({
        address: BOOKLIO_CONTRACT_ADDRESS,
        abi: BOOKLIO_ABI,
        functionName: "createService",
        args: [name, description],
      });
      setActiveTxHash(hash);
      return hash;
    } catch (err) {
      setTxActionName("");
      throw err;
    }
  };

  const createSlot = async (serviceId: bigint, appointmentTime: bigint) => {
    try {
      setTxActionName("Publishing Slot...");
      const hash = await writeContractAsync({
        address: BOOKLIO_CONTRACT_ADDRESS,
        abi: BOOKLIO_ABI,
        functionName: "createSlot",
        args: [serviceId, appointmentTime],
      });
      setActiveTxHash(hash);
      return hash;
    } catch (err) {
      setTxActionName("");
      throw err;
    }
  };

  const bookSlot = async (slotId: bigint) => {
    try {
      setTxActionName("Confirming Booking...");
      const hash = await writeContractAsync({
        address: BOOKLIO_CONTRACT_ADDRESS,
        abi: BOOKLIO_ABI,
        functionName: "bookSlot",
        args: [slotId],
      });
      setActiveTxHash(hash);
      return hash;
    } catch (err) {
      setTxActionName("");
      throw err;
    }
  };

  const confirmBooking = async (bookingId: bigint) => {
    try {
      setTxActionName("Confirming Booking Status...");
      const hash = await writeContractAsync({
        address: BOOKLIO_CONTRACT_ADDRESS,
        abi: BOOKLIO_ABI,
        functionName: "confirmBooking",
        args: [bookingId],
      });
      setActiveTxHash(hash);
      return hash;
    } catch (err) {
      setTxActionName("");
      throw err;
    }
  };

  const cancelBooking = async (bookingId: bigint) => {
    try {
      setTxActionName("Cancelling Booking...");
      const hash = await writeContractAsync({
        address: BOOKLIO_CONTRACT_ADDRESS,
        abi: BOOKLIO_ABI,
        functionName: "cancelBooking",
        args: [bookingId],
      });
      setActiveTxHash(hash);
      return hash;
    } catch (err) {
      setTxActionName("");
      throw err;
    }
  };

  const resetTxState = () => {
    setActiveTxHash(undefined);
    setTxActionName("");
  };

  const services = (servicesData as readonly ServiceItem[]) || [];
  const myBookings = (myBookingsData as readonly BookingDetailItem[]) || [];
  const stats: DashboardStats = statsData
    ? {
        totalServices: (statsData as any)[0] ?? 0n,
        availableSlotsCount: (statsData as any)[1] ?? 0n,
        totalBookingsCount: (statsData as any)[2] ?? 0n,
        confirmedBookingsCount: (statsData as any)[3] ?? 0n,
      }
    : {
        totalServices: 0n,
        availableSlotsCount: 0n,
        totalBookingsCount: 0n,
        confirmedBookingsCount: 0n,
      };

  return {
    address,
    isConnected,
    services,
    isLoadingServices,
    stats,
    isLoadingStats,
    myBookings,
    isLoadingMyBookings,
    refetchAll,
    refetchServices,
    refetchMyBookings,
    refetchStats,
    createService,
    createSlot,
    bookSlot,
    confirmBooking,
    cancelBooking,
    isTxSending,
    isTxWaiting,
    isTxSuccess,
    isTxReceiptError,
    txReceiptError,
    activeTxHash,
    txActionName,
    resetTxState,
  };
}

