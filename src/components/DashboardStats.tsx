"use client";

import React from "react";
import { Briefcase, CalendarCheck, Calendar, CheckCircle2 } from "lucide-react";
import { DashboardStats as StatsType } from "@/hooks/useBooklio";

interface DashboardStatsProps {
  stats: StatsType;
  isLoading: boolean;
}

export function DashboardStats({ stats, isLoading }: DashboardStatsProps) {
  const statCards = [
    {
      title: "Total Services",
      value: stats.totalServices.toString(),
      icon: Briefcase,
      color: "text-brand-purple-soft",
      bgColor: "bg-brand-purple/10",
      borderColor: "border-brand-purple/20",
      subtitle: "Published active offerings",
    },
    {
      title: "Available Slots",
      value: stats.availableSlotsCount.toString(),
      icon: CalendarCheck,
      color: "text-brand-green-soft",
      bgColor: "bg-brand-green/10",
      borderColor: "border-brand-green/20",
      subtitle: "Open for customer booking",
    },
    {
      title: "Total Bookings",
      value: stats.totalBookingsCount.toString(),
      icon: Calendar,
      color: "text-slate-300",
      bgColor: "bg-charcoal-700/40",
      borderColor: "border-charcoal-600/40",
      subtitle: "Lifetime appointments",
    },
    {
      title: "Confirmed Bookings",
      value: stats.confirmedBookingsCount.toString(),
      icon: CheckCircle2,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
      subtitle: "Approved by owners",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className={`card-dark card-interactive p-5 rounded-2xl border ${stat.borderColor} relative overflow-hidden transition-all duration-200`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  {stat.title}
                </p>
                <div className="mt-2 flex items-baseline space-x-2">
                  <span className="text-3xl font-bold tracking-tight text-white font-mono">
                    {isLoading ? (
                      <span className="inline-block w-8 h-7 bg-charcoal-700/60 animate-pulse rounded" />
                    ) : (
                      stat.value
                    )}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">{stat.subtitle}</p>
              </div>

              <div className={`p-3 rounded-xl ${stat.bgColor} ${stat.color} border border-white/5`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>

            {/* Subtle bottom accent line */}
            <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${stat.bgColor}`} />
          </div>
        );
      })}
    </div>
  );
}

