"use client";

import React, { useState } from "react";
import { BookingDetailItem } from "@/hooks/useBooklio";
import {
  formatAppointmentDate,
  formatAppointmentTime,
  getBookingStatusInfo,
  shortenAddress,
} from "@/utils/formatters";
import { Calendar, Clock, User, CheckCircle2, XCircle, AlertCircle, Loader2, ExternalLink } from "lucide-react";
import { BOTCHAIN_EXPLORER_URL } from "@/contracts/contractAddress";

interface MyBookingsSectionProps {
  bookings: readonly BookingDetailItem[];
  isLoading: boolean;
  userAddress?: `0x${string}`;
  onConfirmBooking: (bookingId: bigint) => Promise<any>;
  onCancelBooking: (bookingId: bigint) => Promise<any>;
  isProcessing: boolean;
}

export function MyBookingsSection({
  bookings,
  isLoading,
  userAddress,
  onConfirmBooking,
  onCancelBooking,
  isProcessing,
}: MyBookingsSectionProps) {
  const [activeTab, setActiveTab] = useState<"all" | "customer" | "owner">("all");
  const [processingBookingId, setProcessingBookingId] = useState<bigint | null>(null);

  if (!userAddress) {
    return (
      <div className="card-dark border border-charcoal-700/60 rounded-2xl p-8 text-center">
        <Calendar className="w-8 h-8 text-slate-500 mx-auto mb-2 opacity-50" />
        <h3 className="text-sm font-semibold text-white">View Your Appointments</h3>
        <p className="text-xs text-slate-400 mt-1">
          Connect your MetaMask wallet to view and manage your booked and received appointments.
        </p>
      </div>
    );
  }

  // Filter bookings based on activeTab
  const filteredBookings = bookings.filter((b) => {
    const isCustomer = b.customer.toLowerCase() === userAddress.toLowerCase();
    const isOwner = b.serviceOwner.toLowerCase() === userAddress.toLowerCase();
    if (activeTab === "customer") return isCustomer;
    if (activeTab === "owner") return isOwner;
    return true;
  });

  const handleConfirm = async (bookingId: bigint) => {
    setProcessingBookingId(bookingId);
    try {
      await onConfirmBooking(bookingId);
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingBookingId(null);
    }
  };

  const handleCancel = async (bookingId: bigint) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    setProcessingBookingId(bookingId);
    try {
      await onCancelBooking(bookingId);
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingBookingId(null);
    }
  };

  return (
    <section className="space-y-6">
      {/* Section Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-brand-green-soft" />
              <span>My Bookings</span>
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-green/10 text-brand-green-soft border border-brand-green/20 font-mono">
              {bookings.length}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Appointments tied to your connected wallet as a customer or service provider
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center space-x-1 p-1 bg-charcoal-800/80 border border-charcoal-700 rounded-xl text-xs">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === "all"
                ? "bg-brand-purple text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            All ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab("customer")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === "customer"
                ? "bg-brand-purple text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            As Customer
          </button>
          <button
            onClick={() => setActiveTab("owner")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === "owner"
                ? "bg-brand-purple text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            As Owner
          </button>
        </div>
      </div>

      {/* Bookings List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="card-dark p-5 rounded-2xl border border-charcoal-700/60 animate-pulse space-y-3">
              <div className="h-5 bg-charcoal-700/60 rounded w-1/3" />
              <div className="h-4 bg-charcoal-700/40 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="card-dark border border-charcoal-700/60 rounded-2xl p-10 text-center">
          <Calendar className="w-8 h-8 text-slate-500 mx-auto mb-2 opacity-50" />
          <h3 className="text-sm font-semibold text-white">No Bookings Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            {activeTab === "all"
              ? "You do not have any active or past appointments under this wallet."
              : activeTab === "customer"
              ? "You haven't booked any services yet. Browse available services above to book an appointment!"
              : "No clients have booked your services yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBookings.map((b) => {
            const isCustomer = b.customer.toLowerCase() === userAddress.toLowerCase();
            const isOwner = b.serviceOwner.toLowerCase() === userAddress.toLowerCase();
            const statusInfo = getBookingStatusInfo(b.status);
            const isBusy = isProcessing && processingBookingId === b.id;

            // Permissions
            const canConfirm = isOwner && b.status === 0; // Pending
            const canCancel = (isCustomer || isOwner) && (b.status === 0 || b.status === 1); // Pending or Confirmed

            return (
              <div
                key={b.id.toString()}
                className="card-dark card-interactive p-5 rounded-2xl border border-charcoal-700/60 hover:border-charcoal-600 flex flex-col justify-between transition-all"
              >
                <div>
                  {/* Top Bar: Booking ID & Status Pill */}
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="font-mono text-[11px] text-slate-500">
                      Booking #{b.id.toString()}
                    </span>

                    <span
                      className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${statusInfo.badgeClass}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotClass}`} />
                      <span>{statusInfo.label}</span>
                    </span>
                  </div>

                  {/* Service Title */}
                  <h3 className="text-base font-bold text-white mb-2">
                    {b.serviceName || `Service #${b.serviceId.toString()}`}
                  </h3>

                  {/* Appointment Datetime */}
                  <div className="space-y-1.5 mb-4 p-3 rounded-xl bg-charcoal-800/70 border border-charcoal-700/50">
                    <div className="flex items-center space-x-2 text-xs font-semibold text-slate-200">
                      <Calendar className="w-3.5 h-3.5 text-brand-purple-soft" />
                      <span>{formatAppointmentDate(b.appointmentTime)}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-brand-green-soft" />
                      <span>{formatAppointmentTime(b.appointmentTime)}</span>
                    </div>
                  </div>

                  {/* Parties Info */}
                  <div className="space-y-1 text-xs text-slate-400 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center space-x-1">
                        <User className="w-3 h-3 text-slate-500" />
                        <span>Service Owner:</span>
                      </span>
                      <a
                        href={`${BOTCHAIN_EXPLORER_URL}/address/${b.serviceOwner}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-slate-300 hover:text-brand-purple-soft transition-colors flex items-center space-x-1"
                      >
                        <span>{shortenAddress(b.serviceOwner)}</span>
                        {isOwner && (
                          <span className="text-[10px] text-brand-purple-soft font-sans font-semibold">
                            (You)
                          </span>
                        )}
                        <ExternalLink className="w-3 h-3 text-slate-500" />
                      </a>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center space-x-1">
                        <User className="w-3 h-3 text-slate-500" />
                        <span>Customer:</span>
                      </span>
                      <a
                        href={`${BOTCHAIN_EXPLORER_URL}/address/${b.customer}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-slate-300 hover:text-brand-purple-soft transition-colors flex items-center space-x-1"
                      >
                        <span>{shortenAddress(b.customer)}</span>
                        {isCustomer && (
                          <span className="text-[10px] text-brand-green-soft font-sans font-semibold">
                            (You)
                          </span>
                        )}
                        <ExternalLink className="w-3 h-3 text-slate-500" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {(canConfirm || canCancel) && (
                  <div className="pt-3 border-t border-charcoal-700/60 flex items-center space-x-2">
                    {canConfirm && (
                      <button
                        onClick={() => handleConfirm(b.id)}
                        disabled={isBusy}
                        className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-brand-green-muted to-brand-green hover:brightness-110 transition-all flex items-center justify-center space-x-1.5 shadow-sm disabled:opacity-50"
                      >
                        {isBusy ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Confirm Booking</span>
                          </>
                        )}
                      </button>
                    )}

                    {canCancel && (
                      <button
                        onClick={() => handleCancel(b.id)}
                        disabled={isBusy}
                        className="py-2 px-3 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/30 transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50"
                      >
                        {isBusy ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Cancel</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

