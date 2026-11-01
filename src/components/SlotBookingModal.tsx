"use client";

import React, { useState } from "react";
import { useReadContract, useAccount } from "wagmi";
import { BOOKLIO_CONTRACT_ADDRESS } from "@/contracts/contractAddress";
import { BOOKLIO_ABI } from "@/contracts/BooklioABI";
import { ServiceItem, SlotItem } from "@/hooks/useBooklio";
import { formatAppointmentDate, formatAppointmentTime, shortenAddress } from "@/utils/formatters";
import { X, Calendar, Clock, User, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface SlotBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: ServiceItem | null;
  onBook: (slotId: bigint) => Promise<any>;
  isBooking: boolean;
}

export function SlotBookingModal({
  isOpen,
  onClose,
  service,
  onBook,
  isBooking,
}: SlotBookingModalProps) {
  const { address, isConnected } = useAccount();
  const [selectedSlotId, setSelectedSlotId] = useState<bigint | null>(null);

  const {
    data: rawSlots,
    isLoading: isLoadingSlots,
    refetch: refetchSlots,
  } = useReadContract({
    address: BOOKLIO_CONTRACT_ADDRESS,
    abi: BOOKLIO_ABI,
    functionName: "getAvailableSlots",
    args: service ? [service.id] : undefined,
    query: {
      enabled: !!service && isOpen,
    },
  });

  if (!isOpen || !service) return null;

  const slots = (rawSlots as readonly SlotItem[]) || [];
  const isOwner = address && service.owner.toLowerCase() === address.toLowerCase();

  const handleBook = async (slotId: bigint) => {
    setSelectedSlotId(slotId);
    try {
      await onBook(slotId);
      refetchSlots();
    } catch (err) {
      console.error(err);
    } finally {
      setSelectedSlotId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="card-dark border border-charcoal-700 w-full max-w-2xl rounded-2xl p-6 shadow-2xl relative bg-charcoal-900 max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isBooking}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-charcoal-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6 pb-4 border-b border-charcoal-700/60">
          <div className="flex items-center space-x-2 text-xs text-brand-purple-soft font-mono mb-1">
            <span>Service #{service.id.toString()}</span>
            <span>•</span>
            <span>Owner: {shortenAddress(service.owner)}</span>
          </div>
          <h3 className="text-xl font-bold text-white">{service.name}</h3>
          {service.description && (
            <p className="text-sm text-slate-400 mt-1">{service.description}</p>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-brand-green-soft" />
              <span>Available Appointment Slots</span>
            </h4>
            <span className="text-xs px-2.5 py-1 rounded-full bg-charcoal-800 text-slate-300 border border-charcoal-700">
              {slots.length} {slots.length === 1 ? "slot" : "slots"} open
            </span>
          </div>

          {isOwner && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>You are the owner of this service. Business owners cannot book their own slots.</span>
            </div>
          )}

          {!isConnected && (
            <div className="p-3.5 rounded-xl bg-brand-purple/10 border border-brand-purple/20 text-xs text-brand-purple-soft flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Please connect your MetaMask wallet to book an appointment slot.</span>
            </div>
          )}

          {isLoadingSlots ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-3">
              <Loader2 className="w-6 h-6 animate-spin text-brand-purple" />
              <p className="text-xs">Loading available slots from Botchain...</p>
            </div>
          ) : slots.length === 0 ? (
            <div className="py-12 text-center rounded-xl bg-charcoal-800/40 border border-charcoal-700/50 p-8">
              <Calendar className="w-8 h-8 text-slate-500 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium text-slate-300">No available slots at this time</p>
              <p className="text-xs text-slate-500 mt-1">
                The business owner has not published upcoming slots or all existing slots are currently booked.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {slots.map((slot) => {
                const isSelected = selectedSlotId === slot.id && isBooking;
                return (
                  <div
                    key={slot.id.toString()}
                    className="p-4 rounded-xl bg-charcoal-800/90 border border-charcoal-700 hover:border-brand-purple/50 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                        <span className="font-mono text-[11px] text-slate-500">Slot #{slot.id.toString()}</span>
                        <span className="flex items-center space-x-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full text-[10px] font-medium border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span>Available</span>
                        </span>
                      </div>

                      <div className="space-y-1.5 mb-4">
                        <div className="flex items-center space-x-2 text-sm font-semibold text-white">
                          <Calendar className="w-4 h-4 text-brand-purple-soft" />
                          <span>{formatAppointmentDate(slot.appointmentTime)}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-slate-300">
                          <Clock className="w-4 h-4 text-brand-green-soft" />
                          <span>{formatAppointmentTime(slot.appointmentTime)}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleBook(slot.id)}
                      disabled={isBooking || !isConnected || isOwner}
                      className="w-full py-2 px-3 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-brand-purple to-brand-purple-muted hover:from-brand-purple-soft hover:to-brand-purple transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center space-x-1.5"
                    >
                      {isSelected ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Confirming Booking...</span>
                        </>
                      ) : (
                        <span>Book Appointment</span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="mt-6 pt-4 border-t border-charcoal-700/60 flex items-center justify-between text-xs text-slate-500">
          <span>Times displayed in your local device timezone</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg hover:bg-charcoal-800 text-slate-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

