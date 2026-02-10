import { useState } from "react";
import { useApp, useHostStyles } from "@modelcontextprotocol/ext-apps/react";
import type { App } from "@modelcontextprotocol/ext-apps";
import dataverseIcon from "./assets/dataverse-icon.webp";

const ANIMATIONS = `
@keyframes chart-in {
  from { opacity: 0; transform: translateY(24px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
@keyframes count-pop {
  0%   { opacity: 0; transform: scale(0.5); }
  60%  { transform: scale(1.1); }
  100% { opacity: 1; transform: scale(1); }
}
@keyframes bar-grow-x {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}
@keyframes fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
`;

const TEAL = "#0d9488";
const HEADER_GRADIENT = "linear-gradient(135deg, #0d9488 0%, #1e1e3f 100%)";
const DYNAMICS_BASE = "https://org41df0750.crm4.dynamics.com/main.aspx?appid=6605cbc2-a674-f011-b4cc-000d3ab25cc7&forceUCI=1&pagetype=entityrecord&etn=opportunity&id=";

interface Opportunity {
  id: string;
  name?: string;
  customerid?: string;
  estimatedvalue?: string;
  statecode?: string;
  estimatedclosedate?: string;
  closeprobability?: string;
}

function parseValue(raw?: string): number {
  if (!raw) return 0;
  const cleaned = raw.replace(/[^0-9.\-]/g, "");
  const val = parseFloat(cleaned);
  return isNaN(val) ? 0 : val;
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

function OpportunityRow({
  opportunity,
  index,
  maxValue,
  app,
  canOpenLinks,
}: {
  opportunity: Opportunity;
  index: number;
  maxValue: number;
  app: App | null;
  canOpenLinks: boolean;
}) {
  const value = parseValue(opportunity.estimatedvalue);
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
  const oppName = opportunity.name || "Untitled Opportunity";
  const isClickable = canOpenLinks && !!opportunity.id;

  const handleClick = () => {
    if (isClickable && app) {
      app.openLink({ url: `${DYNAMICS_BASE}${opportunity.id}` });
    }
  };

  return (
    <div
      onClick={handleClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        padding: "0.55rem 0.75rem",
        borderRadius: "8px",
        cursor: isClickable ? "pointer" : "default",
        transition: "background 0.2s, box-shadow 0.2s",
        animation: `fade-in 0.35s ease ${0.15 + index * 0.06}s both`,
      }}
      onMouseEnter={(e) => {
        if (isClickable) {
          e.currentTarget.style.background = "rgba(13, 148, 136, 0.06)";
          e.currentTarget.style.boxShadow = "0 1px 6px rgba(0,0,0,0.06)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Opportunity name */}
      <div
        style={{
          width: "140px",
          flexShrink: 0,
          fontSize: "0.82rem",
          fontWeight: 600,
          color: isClickable ? TEAL : "#374151",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
        title={oppName}
      >
        {oppName}
      </div>

      {/* Bar */}
      <div
        style={{
          flex: 1,
          height: "22px",
          background: "#f3f4f6",
          borderRadius: "4px",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: "100%",
            background: `linear-gradient(90deg, ${TEAL}, ${TEAL}cc)`,
            borderRadius: "4px",
            transformOrigin: "left center",
            animation: `bar-grow-x 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${0.2 + index * 0.06}s both`,
          }}
        />
      </div>

      {/* Value */}
      <span
        style={{
          width: "60px",
          flexShrink: 0,
          fontSize: "0.8rem",
          fontWeight: 700,
          color: TEAL,
          textAlign: "right",
          animation: `fade-in 0.3s ease ${0.5 + index * 0.06}s both`,
        }}
      >
        {formatCurrency(value)}
      </span>

      {/* Dataverse link indicator */}
      {isClickable && (
        <img
          src={dataverseIcon}
          alt="Open in Dynamics 365"
          title="Open in Dynamics 365"
          style={{
            width: "16px",
            height: "16px",
            borderRadius: "4px",
            background: "rgba(13, 148, 136, 0.12)",
            padding: "2px",
            flexShrink: 0,
          }}
        />
      )}
    </div>
  );
}

export function OpportunityTopGraph() {
  const [opportunities, setOpportunities] = useState<Opportunity[] | null>(null);
  const [canOpenLinks, setCanOpenLinks] = useState(false);

  const { app, isConnected, error } = useApp({
    appInfo: { name: "Top Opportunities", version: "1.0.0" },
    capabilities: {},
    onAppCreated: (app) => {
      app.ontoolinput = (params) => {
        const raw = (params.arguments as Record<string, unknown>)?.opportunitiesJson;
        if (raw) {
          try {
            const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
            setOpportunities(Array.isArray(parsed) ? parsed : []);
          } catch {
            setOpportunities([]);
          }
        }
        const hostCaps = app.getHostCapabilities();
        setCanOpenLinks(!!hostCaps?.openLinks);
      };
    },
  });

  useHostStyles(app);

  if (error) return <div>Error: {error.message}</div>;
  if (!isConnected) return <div>Connecting...</div>;
  if (!opportunities) return <div>Waiting for opportunity data...</div>;

  // Filter to opportunities with positive estimated value, sort descending, take top 10
  const ranked = opportunities
    .filter((o) => parseValue(o.estimatedvalue) > 0)
    .sort((a, b) => parseValue(b.estimatedvalue) - parseValue(a.estimatedvalue))
    .slice(0, 10);

  const maxValue = ranked.length > 0 ? parseValue(ranked[0].estimatedvalue) : 0;
  const totalValue = ranked.reduce((sum, o) => sum + parseValue(o.estimatedvalue), 0);
  const totalWithValue = opportunities.filter((o) => parseValue(o.estimatedvalue) > 0).length;

  return (
    <div
      style={{
        fontFamily: "var(--font-sans, system-ui, -apple-system, sans-serif)",
        padding: "1.25rem",
        boxSizing: "border-box",
      }}
    >
      <style>{ANIMATIONS}</style>

      <div
        style={{
          maxWidth: "560px",
          borderRadius: "16px",
          background: "#ffffff",
          boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)",
          animation: "chart-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
          overflow: "hidden",
        }}
      >
        {/* Header band */}
        <div
          style={{
            background: HEADER_GRADIENT,
            padding: "1.1rem 1.5rem",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.25) 45%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0.25) 55%, transparent 70%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 8s ease-in-out infinite",
            }}
          />

          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: "1.1rem",
                  fontWeight: 800,
                  color: "#ffffff",
                  letterSpacing: "-0.01em",
                }}
              >
                Top Opportunities
              </h2>
              <p
                style={{
                  margin: "0.15rem 0 0",
                  fontSize: "0.75rem",
                  color: "rgba(255,255,255,0.7)",
                  fontWeight: 500,
                }}
              >
                Ranked by estimated value
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <div
                style={{
                  background: "rgba(255,255,255,0.2)",
                  borderRadius: "20px",
                  padding: "0.25rem 0.7rem",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  color: "#ffffff",
                  animation: "count-pop 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both",
                }}
              >
                {ranked.length}
              </div>

              <img
                src={dataverseIcon}
                alt="Dataverse"
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "6px",
                  background: "rgba(255,255,255,0.25)",
                  padding: "4px",
                }}
              />
            </div>
          </div>
        </div>

        {/* Bar rows */}
        <div style={{ padding: "0.6rem 0.75rem 0.4rem" }}>
          {ranked.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "2rem 1rem",
                color: "#9ca3af",
                fontSize: "0.9rem",
                fontWeight: 500,
              }}
            >
              No opportunity data to display
            </div>
          ) : (
            ranked.map((opp, i) => (
              <OpportunityRow
                key={opp.id ?? i}
                opportunity={opp}
                index={i}
                maxValue={maxValue}
                app={app}
                canOpenLinks={canOpenLinks}
              />
            ))
          )}
        </div>

        {/* Summary footer */}
        {ranked.length > 0 && (
          <div
            style={{
              padding: "0.4rem 1.5rem 0.75rem",
              fontSize: "0.75rem",
              color: "#6b7280",
              fontWeight: 500,
              textAlign: "center",
              animation: "fade-in 0.4s ease 0.6s both",
            }}
          >
            Showing top {ranked.length} of {totalWithValue}
            {" \u00B7 "}
            Total: <strong style={{ color: TEAL }}>{formatCurrency(totalValue)}</strong>
          </div>
        )}
      </div>
    </div>
  );
}
