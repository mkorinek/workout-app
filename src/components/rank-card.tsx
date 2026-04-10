"use client";

import { useMemo } from "react";
import { getNextRank } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { getRankVisual, getRankThreshold, makeParticles } from "@/lib/rank-visuals";

export function RankCard({
  rank,
  totalVolumeKg,
  displayName,
}: {
  rank: string;
  totalVolumeKg: number;
  displayName: string;
}) {
  const t = useTranslations("profile");
  const vis = getRankVisual(rank);
  const nextRank = getNextRank(rank);

  const currentThreshold = getRankThreshold(rank);
  const progress = nextRank
    ? Math.min(
        100,
        ((totalVolumeKg - currentThreshold) /
          (nextRank.volumeNeeded - currentThreshold)) *
          100,
      )
    : 100;

  const particles = useMemo(
    () => (vis.level >= 5 ? makeParticles(vis.level >= 6 ? 8 : 5) : []),
    [vis.level],
  );

  const isLegend = rank === "LEGEND";

  // Forced-dark card: always dark bg (#1a1a1e), white text, rank color for accents only.
  // This guarantees readability for ALL ranks.
  return (
    <div
      className="relative"
      style={
        {
          "--rank-color-1": vis.colors[0],
          "--rank-color-2": vis.colors[1],
        } as React.CSSProperties
      }
    >
      {/* Particles (ELITE+) — outside card so not clipped */}
      {particles.map((p, i) => (
        <span
          key={i}
          className="rank-particle"
          style={
            {
              left: p.left,
              "--particle-delay": p.delay,
              "--particle-duration": p.duration,
              "--particle-drift": p.drift,
              "--particle-size": p.size,
            } as React.CSSProperties
          }
        />
      ))}

      <div
        className="rounded-[var(--radius-md)] overflow-hidden relative"
        style={{
          background: "#1a1a1e",
          borderLeft: `4px solid ${vis.colors[0]}`,
          boxShadow: vis.level >= 3
            ? `0 0 24px ${vis.colors[0]}15, 0 4px 16px rgba(0,0,0,0.4)`
            : "0 4px 16px rgba(0,0,0,0.3)",
        }}
      >
        {isLegend && <div className="rank-burst-ring" />}

        {/* Ambient glow from rank color — subtle, never overpowers text */}
        {vis.level >= 1 && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at 0% 50%, ${vis.colors[0]}${vis.level >= 3 ? "12" : "08"} 0%, transparent 60%)`,
            }}
          />
        )}

        <div className={`relative px-5 pt-5 pb-4 text-center ${isLegend ? "rank-burst" : ""}`}>
          {/* Rank symbol */}
          {vis.label && (
            <div
              className="text-xs tracking-[0.3em] mb-1 font-medium"
              style={{ color: vis.darkColors[0] }}
            >
              {vis.label}
            </div>
          )}

          {/* Rank name — always white or rainbow */}
          <h2
            className={`text-2xl font-black tracking-wider ${
              isLegend ? "text-rainbow" : ""
            }`}
            style={isLegend ? undefined : { color: "#f0f0f3" }}
          >
            {rank}
          </h2>

          {/* User name */}
          {displayName && (
            <p className="text-xs mt-1" style={{ color: "#6b7280" }}>
              {displayName}
            </p>
          )}

          {/* Volume — rank colored, always bright variant for dark bg */}
          <p
            className="text-lg font-bold tabular-nums mt-2"
            style={{ color: vis.darkColors[0] }}
          >
            {totalVolumeKg.toLocaleString()} kg
          </p>
          <p className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: "#6b7280" }}>
            {t("volume")}
          </p>
        </div>

        {/* Progress bar */}
        {nextRank ? (
          <div className="px-5 pb-4">
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#2a2a2e" }}>
              <div
                className="rank-progress-bar h-full rounded-full"
                style={{
                  width: `${progress}%`,
                  background: `linear-gradient(90deg, ${vis.colors[0]}, ${vis.colors[1]})`,
                }}
              />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-[10px]" style={{ color: "#6b7280" }}>
                {Math.round(progress)}%
              </span>
              <span className="text-[10px]" style={{ color: "#6b7280" }}>
                {nextRank.name} @ {(nextRank.volumeNeeded / 1000).toFixed(0)}k kg
              </span>
            </div>
          </div>
        ) : (
          <div className="px-5 pb-4">
            <div className="h-1.5 rounded-full overflow-hidden" style={{
              background: `linear-gradient(90deg, ${vis.colors[0]}, ${vis.colors[1]}, ${vis.colors[0]})`,
              backgroundSize: "200% 100%",
              animation: "shimmer 2s ease-in-out infinite",
            }} />
            <p className="text-[10px] text-center mt-1.5" style={{ color: "#6b7280" }}>
              MAX RANK
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
