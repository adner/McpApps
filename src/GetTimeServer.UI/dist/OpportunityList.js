import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useApp, useHostStyles } from "@modelcontextprotocol/ext-apps/react";
import dataverseIcon from "./assets/dataverse-icon.webp";
const ANIMATIONS = `
@keyframes list-in {
  from { opacity: 0; transform: translateY(24px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes card-in {
  from { opacity: 0; transform: translateY(16px) scale(0.95); }
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
`;
const TEAL = "#0d9488";
const HEADER_GRADIENT = "linear-gradient(135deg, #0d9488 0%, #1e1e3f 100%)";
const DYNAMICS_BASE = "https://org41df0750.crm4.dynamics.com/main.aspx?appid=6605cbc2-a674-f011-b4cc-000d3ab25cc7&forceUCI=1&pagetype=entityrecord&etn=opportunity&id=";
const ICON_BUILDING = "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4";
function getStatusColor(statecode) {
    switch (statecode?.toLowerCase()) {
        case "won": return "#059669";
        case "lost": return "#dc2626";
        default: return TEAL;
    }
}
function FieldIcon({ d, size = 13 }) {
    return (_jsx("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", style: { flexShrink: 0 }, children: _jsx("path", { d: d }) }));
}
function OpportunityCard({ opportunity, index, app, canOpenLinks }) {
    const statusColor = getStatusColor(opportunity.statecode);
    const oppName = opportunity.name || "Untitled Opportunity";
    return (_jsxs("div", { style: {
            background: "#ffffff",
            borderRadius: "12px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.06)",
            animation: `card-in 0.45s cubic-bezier(0.16, 1, 0.3, 1) ${0.15 + index * 0.07}s both`,
            overflow: "hidden",
            transition: "box-shadow 0.2s, transform 0.2s",
        }, children: [_jsx("div", { style: {
                    height: "4px",
                    background: `linear-gradient(90deg, ${statusColor}, ${statusColor}88)`,
                } }), _jsxs("div", { style: { padding: "0.85rem 1.1rem", position: "relative" }, children: [canOpenLinks && (_jsx("img", { src: dataverseIcon, alt: "Open in Dynamics 365", title: "Open in Dynamics 365", onClick: (e) => {
                            e.stopPropagation();
                            if (app && opportunity.id) {
                                app.openLink({ url: `${DYNAMICS_BASE}${opportunity.id}` });
                            }
                        }, style: {
                            position: "absolute",
                            bottom: "0.5rem",
                            right: "0.5rem",
                            width: "20px",
                            height: "20px",
                            borderRadius: "5px",
                            background: "rgba(13, 148, 136, 0.12)",
                            padding: "3px",
                            cursor: "pointer",
                        } })), _jsxs("div", { style: {
                            display: "flex",
                            alignItems: "baseline",
                            justifyContent: "space-between",
                            gap: "0.75rem",
                            marginBottom: "0.35rem",
                        }, children: [_jsx("span", { style: {
                                    fontSize: "0.95rem",
                                    fontWeight: 700,
                                    color: "#111827",
                                    letterSpacing: "-0.01em",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    flex: 1,
                                    minWidth: 0,
                                }, children: oppName }), opportunity.estimatedvalue && (_jsx("span", { style: {
                                    fontSize: "0.9rem",
                                    fontWeight: 700,
                                    color: TEAL,
                                    whiteSpace: "nowrap",
                                    flexShrink: 0,
                                }, children: opportunity.estimatedvalue }))] }), opportunity.customerid && (_jsxs("div", { style: {
                            display: "flex",
                            alignItems: "center",
                            gap: "0.35rem",
                            paddingLeft: "0.1rem",
                        }, children: [_jsx(FieldIcon, { d: ICON_BUILDING, size: 12 }), _jsx("span", { style: {
                                    fontSize: "0.8rem",
                                    color: "#6b7280",
                                    fontWeight: 500,
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                }, children: opportunity.customerid })] }))] })] }));
}
export function OpportunityList() {
    const [opportunities, setOpportunities] = useState(null);
    const [canOpenLinks, setCanOpenLinks] = useState(false);
    const { app, isConnected, error } = useApp({
        appInfo: { name: "Opportunity List", version: "1.0.0" },
        capabilities: {},
        onAppCreated: (app) => {
            app.ontoolinput = (params) => {
                const raw = params.arguments?.opportunitiesJson;
                if (raw) {
                    try {
                        const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
                        setOpportunities(Array.isArray(parsed) ? parsed : []);
                    }
                    catch {
                        setOpportunities([]);
                    }
                }
                const hostCaps = app.getHostCapabilities();
                setCanOpenLinks(!!hostCaps?.openLinks);
            };
        },
    });
    useHostStyles(app);
    if (error)
        return _jsxs("div", { children: ["Error: ", error.message] });
    if (!isConnected)
        return _jsx("div", { children: "Connecting..." });
    if (!opportunities)
        return _jsx("div", { children: "Waiting for opportunity data..." });
    return (_jsxs("div", { style: {
            fontFamily: "var(--font-sans, system-ui, -apple-system, sans-serif)",
            padding: "1.25rem",
            boxSizing: "border-box",
        }, children: [_jsx("style", { children: ANIMATIONS }), _jsxs("div", { style: {
                    maxWidth: "520px",
                    borderRadius: "16px",
                    background: "#ffffff",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)",
                    animation: "list-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
                    overflow: "hidden",
                }, children: [_jsxs("div", { style: {
                            background: HEADER_GRADIENT,
                            padding: "1.1rem 1.5rem",
                            position: "relative",
                            overflow: "hidden",
                        }, children: [_jsx("div", { style: {
                                    position: "absolute",
                                    inset: 0,
                                    background: "linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.25) 45%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0.25) 55%, transparent 70%)",
                                    backgroundSize: "200% 100%",
                                    animation: "shimmer 8s ease-in-out infinite",
                                } }), _jsxs("div", { style: { position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between" }, children: [_jsxs("div", { children: [_jsx("h2", { style: {
                                                    margin: 0,
                                                    fontSize: "1.1rem",
                                                    fontWeight: 800,
                                                    color: "#ffffff",
                                                    letterSpacing: "-0.01em",
                                                }, children: "Opportunities" }), _jsx("p", { style: {
                                                    margin: "0.15rem 0 0",
                                                    fontSize: "0.75rem",
                                                    color: "rgba(255,255,255,0.7)",
                                                    fontWeight: 500,
                                                }, children: "Dataverse query results" })] }), _jsxs("div", { style: { display: "flex", alignItems: "center", gap: "0.6rem" }, children: [_jsx("div", { style: {
                                                    background: "rgba(255,255,255,0.2)",
                                                    borderRadius: "20px",
                                                    padding: "0.25rem 0.7rem",
                                                    fontSize: "0.8rem",
                                                    fontWeight: 700,
                                                    color: "#ffffff",
                                                    animation: "count-pop 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both",
                                                }, children: opportunities.length }), _jsx("img", { src: dataverseIcon, alt: "Dataverse", style: {
                                                    width: "24px",
                                                    height: "24px",
                                                    borderRadius: "6px",
                                                    background: "rgba(255,255,255,0.25)",
                                                    padding: "4px",
                                                } })] })] })] }), _jsx("div", { style: { padding: "0.9rem 1rem 1.1rem", display: "flex", flexDirection: "column", gap: "0.6rem" }, children: opportunities.length === 0 ? (_jsx("div", { style: {
                                textAlign: "center",
                                padding: "2rem 1rem",
                                color: "#9ca3af",
                                fontSize: "0.9rem",
                                fontWeight: 500,
                            }, children: "No opportunities found" })) : (opportunities.map((opp, i) => (_jsx(OpportunityCard, { opportunity: opp, index: i, app: app, canOpenLinks: canOpenLinks }, opp.id ?? i)))) })] })] }));
}
