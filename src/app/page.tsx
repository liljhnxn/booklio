"use client";

import React, { useEffect } from "react";
import { Header } from "@/components/Header";
import { DashboardStats } from "@/components/DashboardStats";
import { ServicesSection } from "@/components/ServicesSection";
import { ManageSlotsSection } from "@/components/ManageSlotsSection";
import { MyBookingsSection } from "@/components/MyBookingsSection";
import { TransactionFeedback } from "@/components/TransactionFeedback";
import { useBooklio } from "@/hooks/useBooklio";
import { RefreshCw, Shield, Sparkles } from "lucide-react";

export default function Home() {
  const {
    address,
    isConnected,
    services,
    isLoadingServices,
    stats,
    isLoadingStats,
    myBookings,
    isLoadingMyBookings,
    refetchAll,
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
  } = useBooklio();

  // Auto refresh data on successful transaction receipt
  useEffect(() => {
    if (isTxSuccess) {
      refetchAll();
      const timer = setTimeout(() => {
        resetTxState();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isTxSuccess, refetchAll, resetTxState]);

  return (
    <div className="min-h-screen flex flex-col bg-charcoal-950 text-slate-200">
      {/* Navigation Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Hero Banner with Refresh */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-charcoal-800/80">
          <div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-purple/10 text-brand-purple-soft border border-brand-purple/20">
                <Sparkles className="w-3.5 h-3.5 text-brand-purple-soft" />
                <span>Decentralized Scheduling</span>
              </span>
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-mono text-slate-400 bg-charcoal-900 border border-charcoal-800">
                <Shield className="w-3 h-3 text-brand-green-soft" />
                <span>Double-Booking Protected</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-2">
              Your bookings, <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-purple-soft to-brand-green-soft">organized</span>.
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Book appointments directly on Botchain with guaranteed immutability. No intermediaries, no double-bookings.
            </p>
          </div>

          <button
            onClick={() => refetchAll()}
            className="self-start sm:self-center inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-charcoal-800 text-slate-300 hover:text-white hover:bg-charcoal-700/80 border border-charcoal-700/60 transition-all shadow-sm"
            title="Refresh on-chain data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingServices || isLoadingStats ? "animate-spin text-brand-purple" : ""}`} />
            <span>Refresh State</span>
          </button>
        </div>

        {/* Dashboard Statistics */}
        <section aria-label="Dashboard Statistics">
          <DashboardStats stats={stats} isLoading={isLoadingStats} />
        </section>

        {/* Services & Booking Section */}
        <ServicesSection
          services={services}
          isLoading={isLoadingServices}
          userAddress={address}
          onCreateService={createService}
          onBookSlot={bookSlot}
          isCreating={isTxSending || isTxWaiting}
          isBooking={isTxSending || isTxWaiting}
        />

        {/* Business Owner Slot Management */}
        <section aria-label="Manage Appointment Slots">
          <ManageSlotsSection
            services={services}
            userAddress={address}
            onPublishSlot={createSlot}
            isPublishing={isTxSending || isTxWaiting}
            onSlotPublished={refetchAll}
          />
        </section>

        {/* My Bookings Section */}
        <MyBookingsSection
          bookings={myBookings}
          isLoading={isLoadingMyBookings}
          userAddress={address}
          onConfirmBooking={confirmBooking}
          onCancelBooking={cancelBooking}
          isProcessing={isTxSending || isTxWaiting}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-charcoal-800/80 bg-charcoal-900/60 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-400">Booklio</span>
            <span>—</span>
            <span>Your bookings, organized.</span>
          </div>
          <p className="font-mono text-[11px] text-slate-500">
            Deployed on Botchain Testnet (Chain ID 968) • Zero user data collected
          </p>
        </div>
      </footer>

      {/* Global Transaction Feedback */}
      <TransactionFeedback
        isSending={isTxSending}
        isWaiting={isTxWaiting}
        isSuccess={isTxSuccess}
        isError={isTxReceiptError}
        error={txReceiptError}
        txHash={activeTxHash}
        actionName={txActionName}
        onClose={resetTxState}
      />
    </div>
  );
}

