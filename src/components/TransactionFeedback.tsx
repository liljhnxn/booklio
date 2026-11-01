"use client";

import React from "react";
import { Loader2, CheckCircle2, AlertCircle, ExternalLink, X } from "lucide-react";
import { BOTCHAIN_EXPLORER_URL } from "@/contracts/contractAddress";
import { shortenAddress } from "@/utils/formatters";

interface TransactionFeedbackProps {
  isSending: boolean;
  isWaiting: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: Error | null;
  txHash?: `0x${string}`;
  actionName: string;
  onClose: () => void;
}

export function TransactionFeedback({
  isSending,
  isWaiting,
  isSuccess,
  isError,
  error,
  txHash,
  actionName,
  onClose,
}: TransactionFeedbackProps) {
  if (!isSending && !isWaiting && !isSuccess && !isError) {
    return null;
  }

  // Parse error message into clean text
  const parseErrorMessage = (err: Error | null) => {
    if (!err) return "Transaction encountered an unexpected error.";
    const msg = err.message || "";
    if (msg.includes("User rejected") || msg.includes("user rejected")) {
      return "Transaction was cancelled in your wallet.";
    }
    if (msg.includes("Slot is already booked")) {
      return "Slot was already booked by another user.";
    }
    if (msg.includes("Cannot book past appointment")) {
      return "This appointment time has already elapsed.";
    }
    if (msg.includes("Cannot book your own service")) {
      return "Business owners cannot book their own service.";
    }
    if (msg.includes("Only service owner can create slots")) {
      return "Only the service creator can publish appointment slots.";
    }
    if (msg.includes("Only service owner can confirm booking")) {
      return "Only the service owner is authorized to confirm this booking.";
    }
    if (msg.includes("Not authorized to cancel")) {
      return "You are not authorized to cancel this booking.";
    }
    return msg.slice(0, 160) + (msg.length > 160 ? "..." : "");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="card-dark border rounded-2xl p-4 shadow-2xl relative overflow-hidden backdrop-blur-xl bg-charcoal-900/95">
        <div className="flex items-start justify-between gap-3">
          {/* Status Icon */}
          <div className="flex-shrink-0 mt-0.5">
            {(isSending || isWaiting) && (
              <div className="w-8 h-8 rounded-xl bg-brand-purple/10 border border-brand-purple/30 flex items-center justify-center text-brand-purple-soft animate-spin">
                <Loader2 className="w-4 h-4" />
              </div>
            )}
            {isSuccess && (
              <div className="w-8 h-8 rounded-xl bg-brand-green/10 border border-brand-green/30 flex items-center justify-center text-brand-green-soft">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            )}
            {isError && (
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <AlertCircle className="w-4 h-4" />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-white">
              {isSending && (actionName || "Awaiting Wallet Signature...")}
              {isWaiting && "Confirming on Botchain..."}
              {isSuccess && "Transaction Confirmed!"}
              {isError && "Transaction Failed"}
            </h4>

            <p className="text-xs text-slate-400 mt-1">
              {isSending && "Please confirm the transaction prompt in your MetaMask wallet."}
              {isWaiting && "Transaction submitted. Waiting for block validation..."}
              {isSuccess && "On-chain state updated successfully."}
              {isError && parseErrorMessage(error)}
            </p>

            {txHash && (
              <div className="mt-2.5 flex items-center space-x-2">
                <a
                  href={`${BOTCHAIN_EXPLORER_URL}/tx/${txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1.5 text-[11px] font-mono text-brand-purple-soft hover:text-white transition-colors bg-brand-purple/10 border border-brand-purple/20 px-2.5 py-1 rounded-lg"
                >
                  <span>Tx: {shortenAddress(txHash, 6)}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-charcoal-700/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress bar line */}
        {(isSending || isWaiting) && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-charcoal-800 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-brand-purple to-brand-green animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
}

