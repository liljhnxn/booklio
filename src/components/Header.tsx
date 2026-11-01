"use client";

import React, { useState } from "react";
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from "wagmi";
import { shortenAddress } from "@/utils/formatters";
import { BOTCHAIN_CHAIN_ID, BOTCHAIN_EXPLORER_URL } from "@/contracts/contractAddress";
import { Calendar, Wallet, LogOut, Check, Copy, AlertTriangle, ExternalLink } from "lucide-react";

export function Header() {
  const { address, isConnected } = useAccount();
  const { connectors, connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const [copied, setCopied] = useState(false);
  const isWrongNetwork = isConnected && chainId !== BOTCHAIN_CHAIN_ID;

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleConnect = () => {
    const metaMaskConnector = connectors.find((c) => c.id === "metaMaskSDK" || c.id === "metaMask") || connectors[0];
    if (metaMaskConnector) {
      connect({ connector: metaMaskConnector });
    }
  };

  return (
    <header className="border-b border-charcoal-700/60 bg-charcoal-900/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand & Tagline */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-purple/20 via-brand-purple to-brand-green/80 flex items-center justify-center shadow-glowPurple border border-brand-purple/40">
            <Calendar className="w-5 h-5 text-charcoal-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight text-white font-mono">Booklio</span>
              <span className="text-[10px] tracking-wide font-medium uppercase px-2 py-0.5 rounded-full bg-brand-purple/10 text-brand-purple-soft border border-brand-purple/20">
                Web3
              </span>
            </div>
            <p className="text-xs text-slate-400 font-normal">Your bookings, organized.</p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-3">
          {/* Network Indicator */}
          {isConnected && (
            <div className="hidden sm:flex items-center">
              {isWrongNetwork ? (
                <button
                  onClick={() => switchChain?.({ chainId: BOTCHAIN_CHAIN_ID })}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition-colors"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Switch to Botchain</span>
                </button>
              ) : (
                <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-charcoal-800 border border-charcoal-700 text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
                  <span>Botchain Testnet (968)</span>
                </div>
              )}
            </div>
          )}

          {/* Wallet Actions */}
          {isConnected && address ? (
            <div className="flex items-center space-x-2 bg-charcoal-800/90 border border-charcoal-700 rounded-xl p-1 shadow-sm">
              <button
                onClick={handleCopy}
                title="Click to copy address"
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono text-slate-200 hover:bg-charcoal-700/60 transition-colors"
              >
                <span>{shortenAddress(address)}</span>
                {copied ? <Check className="w-3.5 h-3.5 text-brand-green" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              </button>

              <a
                href={`${BOTCHAIN_EXPLORER_URL}/address/${address}`}
                target="_blank"
                rel="noreferrer"
                title="View on Bohr Explorer"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-charcoal-700/60 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => disconnect()}
                title="Disconnect Wallet"
                className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-brand-purple to-brand-purple-muted hover:from-brand-purple-soft hover:to-brand-purple transition-all shadow-glowPurple disabled:opacity-50"
            >
              <Wallet className="w-4 h-4" />
              <span>{isConnecting ? "Connecting..." : "Connect MetaMask"}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

