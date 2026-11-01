"use client";

import React, { useState } from "react";
import { ServiceItem } from "@/hooks/useBooklio";
import { shortenAddress } from "@/utils/formatters";
import { SlotBookingModal } from "./SlotBookingModal";
import { CreateServiceModal } from "./CreateServiceModal";
import { Briefcase, Calendar, Sparkles, User, ExternalLink, Plus } from "lucide-react";
import { BOTCHAIN_EXPLORER_URL } from "@/contracts/contractAddress";

interface ServicesSectionProps {
  services: readonly ServiceItem[];
  isLoading: boolean;
  userAddress?: `0x${string}`;
  onCreateService: (name: string, description: string) => Promise<any>;
  onBookSlot: (slotId: bigint) => Promise<any>;
  isCreating: boolean;
  isBooking: boolean;
}

export function ServicesSection({
  services,
  isLoading,
  userAddress,
  onCreateService,
  onBookSlot,
  isCreating,
  isBooking,
}: ServicesSectionProps) {
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <section className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center space-x-2">
              <Briefcase className="w-5 h-5 text-brand-purple-soft" />
              <span>Available Services</span>
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-purple/10 text-brand-purple-soft border border-brand-purple/20 font-mono">
              {services.length}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Browse verified services published directly on Botchain
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-brand-purple to-brand-purple-muted hover:from-brand-purple-soft hover:to-brand-purple transition-all shadow-glowPurple"
        >
          <Plus className="w-4 h-4" />
          <span>Create Service</span>
        </button>
      </div>

      {/* Services Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card-dark p-6 rounded-2xl border border-charcoal-700/60 animate-pulse space-y-4">
              <div className="h-5 bg-charcoal-700/60 rounded w-2/3" />
              <div className="h-12 bg-charcoal-700/40 rounded w-full" />
              <div className="h-8 bg-charcoal-700/50 rounded w-full pt-4" />
            </div>
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="card-dark border border-charcoal-700/60 rounded-2xl p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-center text-brand-purple-soft mx-auto mb-3">
            <Briefcase className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-white">No Services Published Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-5">
            Be the first business owner to publish a service and open appointments on Botchain!
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-brand-purple hover:bg-brand-purple-soft transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Your First Service</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((service) => {
            const isOwner =
              userAddress && service.owner.toLowerCase() === userAddress.toLowerCase();

            return (
              <div
                key={service.id.toString()}
                className="card-dark card-interactive p-5 rounded-2xl border border-charcoal-700/60 hover:border-brand-purple/40 flex flex-col justify-between transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="font-mono text-[11px] text-slate-500">
                      ID #{service.id.toString()}
                    </span>
                    {isOwner ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-brand-purple/20 text-brand-purple-soft border border-brand-purple/30">
                        Your Service
                      </span>
                    ) : (
                      <span className="flex items-center space-x-1 text-[10px] text-brand-green-soft bg-brand-green/10 px-2 py-0.5 rounded-full border border-brand-green/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-green" />
                        <span>Active</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-brand-purple-soft transition-colors">
                    {service.name}
                  </h3>

                  <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed min-h-[3rem]">
                    {service.description || "No description provided."}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-charcoal-700/60 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center space-x-1.5">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      <span>Owner:</span>
                    </span>
                    <a
                      href={`${BOTCHAIN_EXPLORER_URL}/address/${service.owner}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-slate-300 hover:text-brand-purple-soft transition-colors flex items-center space-x-1"
                    >
                      <span>{shortenAddress(service.owner)}</span>
                      <ExternalLink className="w-3 h-3 text-slate-500" />
                    </a>
                  </div>

                  <button
                    onClick={() => setSelectedService(service as ServiceItem)}
                    className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold text-white bg-charcoal-800 hover:bg-brand-purple/20 hover:text-brand-purple-soft border border-charcoal-700 hover:border-brand-purple/30 transition-all flex items-center justify-center space-x-2"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>View Available Slots</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <SlotBookingModal
        isOpen={!!selectedService}
        onClose={() => setSelectedService(null)}
        service={selectedService}
        onBook={onBookSlot}
        isBooking={isBooking}
      />

      <CreateServiceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={onCreateService}
        isCreating={isCreating}
      />
    </section>
  );
}

