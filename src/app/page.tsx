"use client";

import React, { useEffect } from "react";
import { Header } from "@/components/Header";
import { DashboardStats } from "@/components/DashboardStats";
import { ServicesSection } from "@/components/ServicesSection";
import { ManageSlotsSection } from "@/components/ManageSlotsSection";
import { MyBookingsSection } from "@/components/MyBookingsSection";
import { TransactionFeedback } from "@/components/TransactionFeedback";
import { useBooklio } from "@/hooks/useBooklio";
import { RefreshCw, Shield, Sparkles, ExternalLink } from "lucide-react";
import { BOOKLIO_CONTRACT_ADDRESS, BOTCHAIN_EXPLORER_URL } from "@/contracts/contractAddress";
import { shortenAddress } from "@/utils/formatters";

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
        {/* Hero Banner with Official BOT Chain Links & Mainnet Contract */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-5 border-b border-charcoal-800/80">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-purple/10 text-brand-purple-soft border border-brand-purple/20">
                <Sparkles className="w-3.5 h-3.5 text-brand-purple-soft" />
                <span>Decentralized Scheduling</span>
              </span>
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-mono text-slate-400 bg-charcoal-900 border border-charcoal-800">
                <Shield className="w-3 h-3 text-brand-green-soft" />
                <span>Double-Booking Protected</span>
              </span>
              <a
                href={`${BOTCHAIN_EXPLORER_URL}/address/${BOOKLIO_CONTRACT_ADDRESS}#code`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 hover:bg-emerald-500/20 transition-all shadow-sm group"
                title="View verified smart contract on BOT Chain Explorer"
              >
                <img
                  src="/botchain-logo.png"
                  alt="BOT Chain Logo"
                  className="w-3.5 h-3.5 rounded object-contain"
                />
                <span className="font-semibold">Mainnet:</span>
                <span>{shortenAddress(BOOKLIO_CONTRACT_ADDRESS)}</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-70 group-hover:opacity-100 transition-opacity" />
              </a>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-2.5">
              Your bookings, <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-purple-soft to-brand-green-soft">organized</span>.
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Book appointments directly on BOT Chain Mainnet with guaranteed immutability. No intermediaries, no double-bookings.
            </p>
          </div>

          {/* Quick Ecosystem & State Actions with BOT Chain Logo at Front */}
          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center">
            <a
              href="https://botchain.ai"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-charcoal-800 hover:bg-charcoal-700 border border-charcoal-700 hover:border-emerald-500/40 transition-all shadow-sm group"
            >
              <img
                src="/botchain-logo.png"
                alt="BOT Chain Logo"
                className="w-4 h-4 rounded object-contain group-hover:scale-105 transition-transform"
              />
              <span>BOT Chain Website</span>
              <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-emerald-400 transition-colors" />
            </a>

            <a
              href="https://scan.botchain.ai"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-charcoal-800 hover:bg-charcoal-700 border border-charcoal-700 hover:border-emerald-500/40 transition-all shadow-sm group"
            >
              <img
                src="/botchain-logo.png"
                alt="BOT Chain Logo"
                className="w-4 h-4 rounded object-contain group-hover:scale-105 transition-transform"
              />
              <span>BOT Chain Explorer</span>
              <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-emerald-400 transition-colors" />
            </a>

            <button
              onClick={() => refetchAll()}
              className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-charcoal-800 text-slate-300 hover:text-white hover:bg-charcoal-700/80 border border-charcoal-700/60 transition-all shadow-sm"
              title="Refresh on-chain data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingServices || isLoadingStats ? "animate-spin text-brand-purple" : ""}`} />
              <span>Refresh State</span>
            </button>
          </div>
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

      {/* Ecosystem Footer with BOT Chain branding and required links */}
      <footer className="border-t border-charcoal-800/80 bg-charcoal-900/90 py-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Ecosystem Banner */}
          <div className="card-dark p-5 sm:p-6 rounded-2xl border border-charcoal-700/70 flex flex-col md:flex-row items-center justify-between gap-5 bg-charcoal-850/80 shadow-card">
            {/* BOT Chain Logo & Title */}
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-xl bg-charcoal-900 border border-emerald-500/30 flex items-center justify-center p-1.5 shadow-glowGreen">
                <img
                  src="/botchain-logo.png"
                  alt="BOT Chain Logo"
                  className="w-full h-full object-contain rounded"
                />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-white text-sm tracking-wide">BOT Chain Ecosystem</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    Mainnet (677)
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Booklio is built on and powered by the high-performance BOT Chain EVM network
                </p>
              </div>
            </div>

            {/* Mandatory BOT Chain Links with Official Logo at the Front */}
            <div className="flex flex-wrap items-center gap-2.5">
              <a
                href="https://botchain.ai"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-white bg-charcoal-800 hover:bg-charcoal-700 border border-charcoal-600/70 hover:border-emerald-500/40 transition-all shadow-sm group"
              >
                <img
                  src="/botchain-logo.png"
                  alt="BOT Chain Logo"
                  className="w-4 h-4 rounded object-contain group-hover:scale-105 transition-transform"
                />
                <span>BOT Chain Website</span>
                <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-emerald-400 transition-colors" />
              </a>

              <a
                href="https://scan.botchain.ai"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-white bg-charcoal-800 hover:bg-charcoal-700 border border-charcoal-600/70 hover:border-emerald-500/40 transition-all shadow-sm group"
              >
                <img
                  src="/botchain-logo.png"
                  alt="BOT Chain Logo"
                  className="w-4 h-4 rounded object-contain group-hover:scale-105 transition-transform"
                />
                <span>BOT Chain Explorer</span>
                <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-emerald-400 transition-colors" />
              </a>

              <a
                href={`https://scan.botchain.ai/address/${BOOKLIO_CONTRACT_ADDRESS}#code`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all group"
              >
                <img
                  src="/botchain-logo.png"
                  alt="BOT Chain Logo"
                  className="w-3.5 h-3.5 rounded object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                />
                <span>Mainnet Contract: {shortenAddress(BOOKLIO_CONTRACT_ADDRESS)}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Bottom Copyright & Disclaimer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 text-xs text-slate-500">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-slate-300">Booklio</span>
              <span>—</span>
              <span>Your bookings, organized.</span>
            </div>
            <p className="font-mono text-[11px] text-slate-500 text-center sm:text-right">
              Live on BOT Chain Mainnet (Chain ID 677) • Zero customer PII collected
            </p>
          </div>
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
