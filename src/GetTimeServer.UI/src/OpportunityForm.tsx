import { useState } from "react";
import { useApp, useHostStyles } from "@modelcontextprotocol/ext-apps/react";
import dataverseIcon from "./assets/dataverse-icon.webp";

const ANIMATIONS = `
@keyframes card-in {
  from { opacity: 0; transform: translateY(24px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes field-in {
  from { opacity: 0; transform: translateX(-12px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes name-in {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
`;

const TEAL = "#0d9488";
const HEADER_GRADIENT = "linear-gradient(135deg, #0d9488 0%, #1e1e3f 100%)";
const DYNAMICS_BASE = "https://org41df0750.crm4.dynamics.com/main.aspx?appid=6605cbc2-a674-f011-b4cc-000d3ab25cc7&forceUCI=1&pagetype=entityrecord&etn=opportunity&id=";

const ICON_TAG = "M7 7h.01M7 3h5a2 2 0 011.414.586l7 7a2 2 0 010 2.828l-5 5a2 2 0 01-2.828 0l-7-7A2 2 0 013 10V5a2 2 0 012-2z";
const ICON_BUILDING = "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4";
const ICON_DOLLAR = "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z";
const ICON_FLAG = "M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2z";
const ICON_CALENDAR = "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z";
const ICON_CHART = "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z";

const OPPORTUNITY_FIELDS = [
  { key: "name", label: "Topic", icon: ICON_TAG, editable: true },
  { key: "customerid", label: "Account", icon: ICON_BUILDING, editable: false },
  { key: "estimatedvalue", label: "Est. Revenue", icon: ICON_DOLLAR, editable: true },
  { key: "statecode", label: "Status", icon: ICON_FLAG, editable: false },
  { key: "estimatedclosedate", label: "Est. Close Date", icon: ICON_CALENDAR, editable: true },
  { key: "closeprobability", label: "Probability (%)", icon: ICON_CHART, editable: true },
] as const;

type OpportunityData = Record<string, string | undefined>;

function getStatusColor(statecode?: string): string {
  switch (statecode?.toLowerCase()) {
    case "won": return "#059669";
    case "lost": return "#dc2626";
    default: return TEAL;
  }
}

function FieldIcon({ d }: { d: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      <path d={d} />
    </svg>
  );
}

function stripCurrencyFormatting(value: string): string {
  return value.replace(/[^0-9.\-]/g, "");
}

export function OpportunityForm() {
  const [oppData, setOppData] = useState<OpportunityData | null>(null);
  const [editedFields, setEditedFields] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [canOpenLinks, setCanOpenLinks] = useState(false);

  const { app, isConnected, error } = useApp({
    appInfo: { name: "Opportunity Form", version: "1.0.0" },
    capabilities: {},
    onAppCreated: (app) => {
      app.ontoolinput = (params) => {
        const args = params.arguments as OpportunityData;
        setOppData(args);
        const caps = app.getHostCapabilities();
        setCanOpenLinks(!!caps?.openLinks);
      };
    },
  });

  useHostStyles(app);

  const isDirty = Object.keys(editedFields).length > 0;

  const handleFieldChange = (key: string, value: string) => {
    setEditedFields((prev) => {
      const original = oppData?.[key] ?? "";
      if (value === original) {
        const { [key]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: value };
    });
    setSaveResult(null);
  };

  const handleSave = async () => {
    if (!app || !oppData || !isDirty) return;
    setSaving(true);
    setSaveResult(null);
    try {
      const args: Record<string, string> = {
        id: oppData.id!,
        logicalName: oppData.logicalName!,
      };
      for (const [key, value] of Object.entries(editedFields)) {
        if (key === "estimatedvalue") {
          args[key] = stripCurrencyFormatting(value);
        } else {
          args[key] = value;
        }
      }
      const result = await app.callServerTool({
        name: "UpdateOpportunity",
        arguments: args,
      });
      const text = result.content
        ?.filter((c): c is Extract<typeof c, { type: "text" }> => c.type === "text")
        .map((c) => c.text)
        .join("") ?? "";
      if (text.startsWith("[ERROR]")) {
        setSaveResult({ ok: false, message: text });
      } else {
        setOppData((prev) => ({ ...prev, ...editedFields }));
        setEditedFields({});
        setSaveResult({ ok: true, message: text || "Saved" });
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Save failed";
      setSaveResult({ ok: false, message });
    } finally {
      setSaving(false);
    }
  };

  if (error) return <div>Error: {error.message}</div>;
  if (!isConnected) return <div>Connecting...</div>;
  if (!oppData) return <div>Waiting for opportunity data...</div>;

  const displayData: OpportunityData = { ...oppData, ...editedFields };
  const oppName = displayData.name || "Untitled Opportunity";
  const statusColor = getStatusColor(displayData.statecode);

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
          maxWidth: "420px",
          borderRadius: "16px",
          background: "#ffffff",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)",
          animation: "card-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
          overflow: "hidden",
        }}
      >
        {/* Header gradient */}
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
          <div style={{ position: "relative", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2
                style={{
                  margin: 0,
                  fontSize: "1.15rem",
                  fontWeight: 800,
                  color: "#ffffff",
                  letterSpacing: "-0.01em",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {oppName}
              </h2>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  marginTop: "0.3rem",
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: statusColor,
                    border: "1.5px solid rgba(255,255,255,0.5)",
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: "0.78rem",
                    color: "rgba(255,255,255,0.8)",
                    fontWeight: 600,
                  }}
                >
                  {displayData.statecode || "Open"}
                </span>
                {displayData.customerid && (
                  <>
                    <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.7rem" }}>|</span>
                    <span
                      style={{
                        fontSize: "0.78rem",
                        color: "rgba(255,255,255,0.7)",
                        fontWeight: 500,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {displayData.customerid}
                    </span>
                  </>
                )}
              </div>
            </div>
            <img
              src={dataverseIcon}
              alt="Dataverse"
              title={canOpenLinks ? "Open in Dynamics 365" : undefined}
              onClick={canOpenLinks && oppData ? () => app?.openLink({ url: `${DYNAMICS_BASE}${oppData.id}` }) : undefined}
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "6px",
                background: "rgba(255, 255, 255, 0.25)",
                padding: "4px",
                flexShrink: 0,
                marginLeft: "0.5rem",
                cursor: canOpenLinks ? "pointer" : "default",
              }}
            />
          </div>
        </div>

        {/* Fields */}
        <div style={{ padding: "1rem 1.5rem 1.4rem" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            {OPPORTUNITY_FIELDS.map(({ key, label, icon, editable }, i) => {
              const isEdited = key in editedFields;
              return (
                <div
                  key={key}
                  style={{
                    animation: `field-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${0.3 + i * 0.08}s both`,
                  }}
                >
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.3rem",
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      color: TEAL,
                      marginBottom: "0.25rem",
                    }}
                  >
                    <FieldIcon d={icon} />
                    {label}
                  </label>
                  <input
                    type="text"
                    value={editedFields[key] ?? oppData[key] ?? ""}
                    onChange={(e) => handleFieldChange(key, e.target.value)}
                    readOnly={!editable}
                    style={{
                      width: "100%",
                      padding: "0.55rem 0.75rem",
                      border: "1.5px solid #e2e8f0",
                      borderLeft: isEdited ? `3px solid ${TEAL}` : "1.5px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: editable ? "#1e293b" : "#6b7280",
                      background: !editable ? "#f1f5f9" : isEdited ? "#f0fdfa" : "#f8fafc",
                      boxSizing: "border-box",
                      outline: "none",
                      cursor: editable ? "text" : "default",
                      transition: "border-color 0.2s, box-shadow 0.2s, background 0.2s",
                    }}
                  />
                </div>
              );
            })}
          </div>

          {isDirty && (
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                marginTop: "1rem",
                width: "100%",
                padding: "0.65rem 1rem",
                border: "none",
                borderRadius: "8px",
                fontSize: "0.875rem",
                fontWeight: 700,
                color: "#ffffff",
                background: saving ? "#9ca3af" : TEAL,
                cursor: saving ? "not-allowed" : "pointer",
                transition: "background 0.2s, opacity 0.2s",
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          )}

          {saveResult && (
            <div
              style={{
                marginTop: "0.5rem",
                padding: "0.5rem 0.75rem",
                borderRadius: "6px",
                fontSize: "0.8rem",
                fontWeight: 600,
                background: saveResult.ok ? "#ecfdf5" : "#fef2f2",
                color: saveResult.ok ? "#065f46" : "#991b1b",
                border: `1px solid ${saveResult.ok ? "#a7f3d0" : "#fecaca"}`,
              }}
            >
              {saveResult.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
