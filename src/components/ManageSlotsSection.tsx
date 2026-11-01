"use client";

import React, { useState } from "react";
import { ServiceItem, SlotItem } from "@/hooks/useBooklio";
import { useReadContract } from "wagmi";
import { BOOKLIO_CONTRACT_ADDRESS } from "@/contracts/contractAddress";
import { BOOKLIO_ABI } from "@/contracts/BooklioABI";
import { formatAppointmentDate, formatAppointmentTime } from "@/utils/formatters";
import { CalendarPlus, Clock, Calendar, Check, AlertCircle, Loader2 } from "lucide-react";

interface ManageSlotsSectionProps {
  services: readonly ServiceItem[];
  userAddress?: `0x${string}`;
  onPublishSlot: (serviceId: bigint, timestamp: bigint) => Promise<any>;
  isPublishing: boolean;
  onSlotPublished?: () => void;
}

export function ManageSlotsSection({
  services,
  userAddress,
  onPublishSlot,
  isPublishing,
  onSlotPublished,
}: ManageSlotsSectionProps) {
  // Filter services owned by current wallet
  const ownedServices = services.filter(
    (s) => userAddress && s.owner.toLowerCase() === userAddress.toLowerCase()
  );

  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    ownedServices.length > 0 ? ownedServices[0].id.toString() : ""
  );

  // Default date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split("T")[0];

  const [date, setDate] = useState<string>(defaultDateStr);
  const [time, setTime] = useState<string>("10:00");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // If ownedServices changes and none selected, select first
  React.useEffect(() => {
    if ((!selectedServiceId || !ownedServices.some((s) => s.id.toString() === selectedServiceId)) && ownedServices.length > 0) {
      setSelectedServiceId(ownedServices[0].id.toString());
    }
  }, [ownedServices, selectedServiceId]);

  // Read existing slots for selected service
  const currentServiceIdBigInt = selectedServiceId ? BigInt(selectedServiceId) : BigInt(0);
  const { data: rawServiceSlots, refetch: refetchServiceSlots } = useReadContract({
    address: BOOKLIO_CONTRACT_ADDRESS,
    abi: BOOKLIO_ABI,
    functionName: "getAllSlotsForService",
    args: currentServiceIdBigInt > BigInt(0) ? [currentServiceIdBigInt] : undefined,
    query: {
      enabled: currentServiceIdBigInt > BigInt(0),
    },
  });

  const serviceSlots = (rawServiceSlots as readonly SlotItem[]) || [];

  // Calculate Unix timestamp (seconds)
  const calculateTimestamp = (): number | null => {
    if (!date || !time) return null;
    const [year, month, day] = date.split("-").map(Number);
    const [hours, minutes] = time.split(":").map(Number);
    const dateObj = new Date(year, month - 1, day, hours, minutes, 0);
    return Math.floor(dateObj.getTime() / 1000);
  };

  const previewTimestamp = calculateTimestamp();
  const isFuture = previewTimestamp ? previewTimestamp * 1000 > Date.now() : false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!selectedServiceId) {
      setFeedback({ type: "error", message: "Please select one of your services." });
      return;
    }

    const timestamp = calculateTimestamp();
    if (!timestamp || timestamp * 1000 <= Date.now()) {
      setFeedback({ type: "error", message: "Appointment time must be in the future." });
      return;
    }

    try {
      await onPublishSlot(BigInt(selectedServiceId), BigInt(timestamp));
      setFeedback({ type: "success", message: "Slot published successfully!" });
      refetchServiceSlots();
      onSlotPublished?.();
    } catch (err: any) {
      console.error(err);
      setFeedback({ type: "error", message: err?.message || "Failed to publish slot." });
    }
  };

  if (!userAddress) {
    return (
      <div className="card-dark border border-charcoal-700/60 rounded-2xl p-6 text-center">
        <CalendarPlus className="w-8 h-8 text-slate-500 mx-auto mb-2 opacity-50" />
        <h3 className="text-sm font-semibold text-white">Service Management</h3>
        <p className="text-xs text-slate-400 mt-1">
          Connect your wallet to manage and publish appointment slots for your services.
        </p>
      </div>
    );
  }

  if (ownedServices.length === 0) {
    return (
      <div className="card-dark border border-charcoal-700/60 rounded-2xl p-6 text-center">
        <CalendarPlus className="w-8 h-8 text-brand-purple-soft mx-auto mb-2 opacity-60" />
        <h3 className="text-sm font-semibold text-white">No Services Created Yet</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
          You haven't created any services under this wallet. Create a service first above to start scheduling appointment slots.
        </p>
      </div>
    );
  }

  return (
    <div className="card-dark border border-charcoal-700/60 rounded-2xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 pb-4 border-b border-charcoal-700/60">
        <div className="w-9 h-9 rounded-xl bg-brand-green/10 border border-brand-green/20 flex items-center justify-center text-brand-green-soft">
          <CalendarPlus className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">Manage Appointment Slots</h3>
          <p className="text-xs text-slate-400">Publish open time slots for your clients to book</p>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center space-x-2 ${
            feedback.type === "success"
              ? "bg-brand-green/10 text-brand-green-soft border border-brand-green/20"
              : "bg-rose-500/10 text-rose-300 border border-rose-500/20"
          }`}
        >
          {feedback.type === "success" ? (
            <Check className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Service selector */}
        <div className="md:col-span-1">
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Select Your Service
          </label>
          <select
            value={selectedServiceId}
            onChange={(e) => setSelectedServiceId(e.target.value)}
            disabled={isPublishing}
            className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-800 border border-charcoal-700 text-sm text-white focus:outline-none focus:border-brand-purple transition-all"
          >
            {ownedServices.map((s) => (
              <option key={s.id.toString()} value={s.id.toString()}>
                {s.name} (ID: {s.id.toString()})
              </option>
            ))}
          </select>
        </div>

        {/* Date picker */}
        <div className="md:col-span-1">
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Appointment Date
          </label>
          <input
            type="date"
            required
            min={new Date().toISOString().split("T")[0]}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={isPublishing}
            className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-800 border border-charcoal-700 text-sm text-white focus:outline-none focus:border-brand-purple transition-all"
          />
        </div>

        {/* Time picker */}
        <div className="md:col-span-1">
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Appointment Time
          </label>
          <input
            type="time"
            required
            value={time}
            onChange={(e) => setTime(e.target.value)}
            disabled={isPublishing}
            className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-800 border border-charcoal-700 text-sm text-white focus:outline-none focus:border-brand-purple transition-all"
          />
        </div>

        {/* Preview & Submit */}
        <div className="md:col-span-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="text-xs text-slate-400 flex items-center space-x-2">
            <Clock className="w-4 h-4 text-brand-purple-soft" />
            {previewTimestamp && isFuture ? (
              <span>
                Slot scheduled for:{" "}
                <strong className="text-white font-medium">
                  {formatAppointmentDate(previewTimestamp)} at {formatAppointmentTime(previewTimestamp)}
                </strong>
              </span>
            ) : (
              <span className="text-amber-400">Please choose a valid future date & time</span>
            )}
          </div>

          <button
            type="submit"
            disabled={isPublishing || !isFuture}
            className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-brand-green-muted to-brand-green hover:brightness-110 transition-all shadow-glowGreen disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPublishing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Publishing Slot...</span>
              </>
            ) : (
              <>
                <CalendarPlus className="w-4 h-4" />
                <span>Publish Available Slot</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Published slots overview for selected service */}
      {serviceSlots.length > 0 && (
        <div className="pt-4 border-t border-charcoal-700/60">
          <h4 className="text-xs font-semibold text-slate-300 mb-3 flex items-center justify-between">
            <span>Published Slots for this Service ({serviceSlots.length})</span>
            <span className="text-[11px] text-slate-500 font-normal">Auto-updated on-chain</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto pr-1">
            {serviceSlots.map((slot) => {
              const isPast = Number(slot.appointmentTime) * 1000 < Date.now();
              return (
                <div
                  key={slot.id.toString()}
                  className="p-2.5 rounded-lg bg-charcoal-800/60 border border-charcoal-700/50 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-medium text-slate-200">
                      {formatAppointmentDate(slot.appointmentTime)}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {formatAppointmentTime(slot.appointmentTime)}
                    </p>
                  </div>

                  <div>
                    {isPast ? (
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 border border-slate-700">
                        Expired
                      </span>
                    ) : slot.isAvailable ? (
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                        Available
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] bg-brand-purple/10 text-brand-purple-soft border border-brand-purple/20 font-medium">
                        Booked
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
