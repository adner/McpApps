import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { useApp, useHostStyles } from "@modelcontextprotocol/ext-apps/react";
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
@keyframes bar-grow {
  from { transform: scaleY(0); }
  to   { transform: scaleY(1); }
}
@keyframes fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
`;
const TEAL = "#0d9488";
const HEADER_GRADIENT = "linear-gradient(135deg, #0d9488 0%, #1e1e3f 100%)";
function parseValue(raw) {
    if (!raw)
        return 0;
    const cleaned = raw.replace(/[^0-9.\-]/g, "");
    const val = parseFloat(cleaned);
    return isNaN(val) ? 0 : val;
}
function formatCurrency(value) {
    if (value >= 1_000_000)
        return `$${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000)
        return `$${(value / 1_000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
}
const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function aggregateByMonth(opportunities) {
    const map = new Map();
    for (const opp of opportunities) {
        if (!opp.estimatedclosedate)
            continue;
        const date = new Date(opp.estimatedclosedate);
        if (isNaN(date.getTime()))
            continue;
        const value = parseValue(opp.estimatedvalue);
        if (value <= 0)
            continue;
        const year = date.getFullYear();
        const month = date.getMonth();
        const key = `${year}-${String(month + 1).padStart(2, "0")}`;
        const label = `${MONTH_SHORT[month]} ${String(year).slice(2)}`;
        const existing = map.get(key);
        if (existing) {
            existing.total += value;
            existing.count += 1;
        }
        else {
            map.set(key, { key, label, total: value, count: 1 });
        }
    }
    return Array.from(map.values()).sort((a, b) => a.key.localeCompare(b.key));
}
function niceMax(value) {
    if (value <= 0)
        return 100;
    const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
    const normalized = value / magnitude;
    if (normalized <= 1)
        return magnitude;
    if (normalized <= 2)
        return 2 * magnitude;
    if (normalized <= 5)
        return 5 * magnitude;
    return 10 * magnitude;
}
function BarChart({ buckets }) {
    const svgWidth = 480;
    const svgHeight = 230;
    const marginLeft = 60;
    const marginRight = 20;
    const marginTop = 20;
    const marginBottom = 50;
    const chartWidth = svgWidth - marginLeft - marginRight;
    const chartHeight = svgHeight - marginTop - marginBottom;
    const maxValue = niceMax(Math.max(...buckets.map((b) => b.total)));
    const gridLines = 4;
    const barGap = 8;
    const barWidth = Math.max(12, Math.min(48, (chartWidth - barGap * (buckets.length + 1)) / buckets.length));
    const totalBarsWidth = buckets.length * barWidth + (buckets.length + 1) * barGap;
    const offsetX = marginLeft + (chartWidth - totalBarsWidth) / 2;
    return (_jsxs("svg", { width: svgWidth, height: svgHeight, viewBox: `0 0 ${svgWidth} ${svgHeight}`, style: { width: "100%", height: "auto", display: "block" }, children: [Array.from({ length: gridLines + 1 }, (_, i) => {
                const y = marginTop + chartHeight - (i / gridLines) * chartHeight;
                const val = (i / gridLines) * maxValue;
                return (_jsxs("g", { children: [_jsx("line", { x1: marginLeft, y1: y, x2: svgWidth - marginRight, y2: y, stroke: "#e5e7eb", strokeWidth: "1", strokeDasharray: "4 2" }), _jsx("text", { x: marginLeft - 8, y: y + 4, textAnchor: "end", fontSize: "11", fill: "#9ca3af", fontFamily: "system-ui, sans-serif", children: formatCurrency(val) })] }, `grid-${i}`));
            }), _jsx("line", { x1: marginLeft, y1: marginTop + chartHeight, x2: svgWidth - marginRight, y2: marginTop + chartHeight, stroke: "#d1d5db", strokeWidth: "1" }), buckets.map((bucket, i) => {
                const barHeight = maxValue > 0 ? (bucket.total / maxValue) * chartHeight : 0;
                const x = offsetX + barGap + i * (barWidth + barGap);
                const y = marginTop + chartHeight - barHeight;
                return (_jsxs("g", { children: [_jsx("rect", { x: x, y: y, width: barWidth, height: barHeight, rx: "4", fill: TEAL, opacity: "0.85", style: {
                                transformOrigin: `${x + barWidth / 2}px ${marginTop + chartHeight}px`,
                                animation: `bar-grow 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${0.2 + i * 0.05}s both`,
                            } }), _jsx("text", { x: x + barWidth / 2, y: y - 6, textAnchor: "middle", fontSize: "10", fontWeight: "700", fill: TEAL, fontFamily: "system-ui, sans-serif", style: {
                                animation: `fade-in 0.3s ease ${0.5 + i * 0.05}s both`,
                            }, children: formatCurrency(bucket.total) }), _jsx("text", { x: x + barWidth / 2, y: marginTop + chartHeight + 14, textAnchor: "end", fontSize: "10", fill: "#6b7280", fontFamily: "system-ui, sans-serif", transform: `rotate(-45, ${x + barWidth / 2}, ${marginTop + chartHeight + 14})`, children: bucket.label })] }, bucket.key));
            })] }));
}
export function OpportunityChart() {
    const [opportunities, setOpportunities] = useState(null);
    const { app, isConnected, error } = useApp({
        appInfo: { name: "Opportunity Chart", version: "1.0.0" },
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
    const buckets = aggregateByMonth(opportunities);
    const totalValue = buckets.reduce((sum, b) => sum + b.total, 0);
    const totalCount = opportunities.filter((o) => o.estimatedclosedate && parseValue(o.estimatedvalue) > 0).length;
    const dateRange = buckets.length > 0
        ? buckets.length === 1
            ? buckets[0].label
            : `${buckets[0].label}\u2013${buckets[buckets.length - 1].label}`
        : "";
    return (_jsxs("div", { style: {
            fontFamily: "var(--font-sans, system-ui, -apple-system, sans-serif)",
            padding: "1.25rem",
            boxSizing: "border-box",
        }, children: [_jsx("style", { children: ANIMATIONS }), _jsxs("div", { style: {
                    maxWidth: "560px",
                    borderRadius: "16px",
                    background: "#ffffff",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)",
                    animation: "chart-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
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
                                } }), _jsxs("div", { style: {
                                    position: "relative",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                }, children: [_jsxs("div", { children: [_jsx("h2", { style: {
                                                    margin: 0,
                                                    fontSize: "1.1rem",
                                                    fontWeight: 800,
                                                    color: "#ffffff",
                                                    letterSpacing: "-0.01em",
                                                }, children: "Opportunity Pipeline" }), _jsx("p", { style: {
                                                    margin: "0.15rem 0 0",
                                                    fontSize: "0.75rem",
                                                    color: "rgba(255,255,255,0.7)",
                                                    fontWeight: 500,
                                                }, children: "Estimated values by month" })] }), _jsxs("div", { style: { display: "flex", alignItems: "center", gap: "0.6rem" }, children: [_jsx("div", { style: {
                                                    background: "rgba(255,255,255,0.2)",
                                                    borderRadius: "20px",
                                                    padding: "0.25rem 0.7rem",
                                                    fontSize: "0.8rem",
                                                    fontWeight: 700,
                                                    color: "#ffffff",
                                                    animation: "count-pop 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both",
                                                }, children: formatCurrency(totalValue) }), _jsx("img", { src: dataverseIcon, alt: "Dataverse", style: {
                                                    width: "24px",
                                                    height: "24px",
                                                    borderRadius: "6px",
                                                    background: "rgba(255,255,255,0.25)",
                                                    padding: "4px",
                                                } })] })] })] }), _jsx("div", { style: { padding: "0.5rem 1rem 0.25rem" }, children: buckets.length === 0 ? (_jsx("div", { style: {
                                textAlign: "center",
                                padding: "2rem 1rem",
                                color: "#9ca3af",
                                fontSize: "0.9rem",
                                fontWeight: 500,
                            }, children: "No opportunity data to chart" })) : (_jsx(BarChart, { buckets: buckets })) }), buckets.length > 0 && (_jsxs("div", { style: {
                            padding: "0.4rem 1.5rem 0.75rem",
                            fontSize: "0.75rem",
                            color: "#6b7280",
                            fontWeight: 500,
                            textAlign: "center",
                            animation: "fade-in 0.4s ease 0.6s both",
                        }, children: ["Total: ", _jsx("strong", { style: { color: TEAL }, children: formatCurrency(totalValue) }), " \u00B7 ", totalCount, " opportunit", totalCount === 1 ? "y" : "ies", dateRange && (_jsxs(_Fragment, { children: [" \u00B7 ", dateRange] }))] }))] })] }));
}
