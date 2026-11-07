"use client";

import React, { useEffect } from "react";
import { Header } from "@/components/Header";
import { DashboardStats } from "@/components/DashboardStats";
import { ServicesSection } from "@/components/ServicesSection";
import { ManageSlotsSection } from "@/components/ManageSlotsSection";
import { MyBookingsSection } from "@/components/MyBookingsSection";
import { TransactionFeedback } from "@/components/TransactionFeedback";
import { useBooklio } from "@/hooks/useBooklio";
import { RefreshCw, Shield, Sparkles, ExternalLink, Globe, Search } from "lucide-react";
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
        {/* Hero Banner with Refresh & Explorer Link */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-charcoal-800/80">
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
                className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                title="View verified smart contract on BOT Chain Explorer"
              >
                <Search className="w-3 h-3" />
                <span>Contract: {shortenAddress(BOOKLIO_CONTRACT_ADDRESS)}</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-70" />
              </a>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-2.5">
              Your bookings, <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-purple-soft to-brand-green-soft">organized</span>.
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Book appointments directly on BOT Chain Mainnet with guaranteed immutability. No intermediaries, no double-bookings.
            </p>
          </div>

          <div className="flex items-center space-x-2 self-start lg:self-center">
            <a
              href="https://scan.botchain.ai"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-charcoal-800 text-slate-300 hover:text-white hover:bg-charcoal-700/80 border border-charcoal-700/60 transition-all shadow-sm"
            >
              <Search className="w-3.5 h-3.5 text-brand-green-soft" />
              <span>BOT Chain Explorer</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
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
          <div className="card-dark p-4 sm:p-5 rounded-2xl border border-charcoal-700/70 flex flex-col md:flex-row items-center justify-between gap-4 bg-charcoal-850/80">
            {/* BOT Chain Logo & Title */}
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 via-emerald-400/10 to-charcoal-900 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-glowGreen">
                {/* BOT Chain Custom SVG Logo */}
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                </svg>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-white text-sm tracking-wide">BOT Chain Ecosystem</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    Mainnet (677)
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Booklio is powered by the high-performance BOT Chain EVM network
                </p>
              </div>
            </div>

            {/* Mandatory BOT Chain Links */}
            <div className="flex flex-wrap items-center gap-2.5">
              <a
                href="https://botchain.ai"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-charcoal-800 hover:bg-charcoal-700 border border-charcoal-600/70 hover:border-emerald-500/40 transition-all shadow-sm"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span>BOT Chain Website</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>

              <a
                href="https://scan.botchain.ai"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-charcoal-800 hover:bg-charcoal-700 border border-charcoal-600/70 hover:border-emerald-500/40 transition-all shadow-sm"
              >
                <Search className="w-3.5 h-3.5 text-brand-purple-soft" />
                <span>BOT Chain Explorer</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>

              <a
                href={`https://scan.botchain.ai/address/${BOOKLIO_CONTRACT_ADDRESS}#code`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all"
              >
                <span>Verified Contract</span>
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
              Live on BOT Chain Mainnet • Zero customer PII collected
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
