import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
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
@keyframes avatar-in {
  from { opacity: 0; transform: scale(0.3); }
  to   { opacity: 1; transform: scale(1); }
}
`;
const AVATAR_COLORS = [
    "#e53e3e", "#d53f8c", "#805ad5", "#3182ce",
    "#0891b2", "#059669", "#d97706", "#c2410c",
    "#7c3aed", "#2563eb", "#0d9488", "#dc2626",
];
function initialsToColor(initials) {
    let hash = 0;
    for (let i = 0; i < initials.length; i++) {
        hash = initials.charCodeAt(i) + ((hash << 5) - hash);
    }
    return AVATAR_COLORS[((hash % AVATAR_COLORS.length) + AVATAR_COLORS.length) % AVATAR_COLORS.length];
}
function getInitials(contact) {
    const first = (contact.firstname ?? "")[0] ?? "";
    const last = (contact.lastname ?? "")[0] ?? "";
    return (first + last).toUpperCase() || "?";
}
function getFullName(contact) {
    return [contact.firstname, contact.lastname].filter(Boolean).join(" ") || "Unknown";
}
function FieldIcon({ d, size = 13 }) {
    return (_jsx("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", style: { flexShrink: 0 }, children: _jsx("path", { d: d }) }));
}
const ICON_EMAIL = "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z";
const ICON_PHONE = "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z";
const ICON_JOB = "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z";
const HEADER_GRADIENT = "linear-gradient(135deg, #3182ce 0%, #1e1e3f 100%)";
const DYNAMICS_BASE = "https://org41df0750.crm4.dynamics.com/main.aspx?appid=6605cbc2-a674-f011-b4cc-000d3ab25cc7&forceUCI=1&pagetype=entityrecord&etn=contact&id=";
function ContactCard({ contact, index, app, canOpenLinks, imageUrl }) {
    const initials = getInitials(contact);
    const color = initialsToColor(initials);
    const fullName = getFullName(contact);
    return (_jsxs("div", { style: {
            background: "#ffffff",
            borderRadius: "12px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.06)",
            animation: `card-in 0.45s cubic-bezier(0.16, 1, 0.3, 1) ${0.15 + index * 0.07}s both`,
            overflow: "hidden",
            transition: "box-shadow 0.2s, transform 0.2s",
        }, children: [_jsx("div", { style: {
                    height: "4px",
                    background: `linear-gradient(90deg, ${color}, ${color}88)`,
                } }), _jsxs("div", { style: { padding: "1rem 1.1rem", position: "relative" }, children: [canOpenLinks && (_jsx("img", { src: dataverseIcon, alt: "Open in Dynamics 365", title: "Open in Dynamics 365", onClick: (e) => {
                            e.stopPropagation();
                            if (app && contact.id) {
                                app.openLink({ url: `${DYNAMICS_BASE}${contact.id}` });
                            }
                        }, style: {
                            position: "absolute",
                            top: "0.5rem",
                            right: "0.5rem",
                            width: "20px",
                            height: "20px",
                            borderRadius: "5px",
                            background: "rgba(49, 130, 206, 0.12)",
                            padding: "3px",
                            cursor: "pointer",
                        } })), _jsxs("div", { style: { display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.7rem" }, children: [_jsx("div", { style: {
                                    width: "44px",
                                    height: "44px",
                                    borderRadius: "50%",
                                    background: imageUrl
                                        ? `url(${imageUrl}) center/cover`
                                        : `linear-gradient(145deg, ${color}, ${color}cc)`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                    transition: "background 0.3s ease",
                                    animation: `avatar-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${0.25 + index * 0.07}s both`,
                                }, children: !imageUrl && (_jsxs("svg", { width: "44", height: "44", viewBox: "0 0 44 44", children: [_jsx("defs", { children: _jsx("clipPath", { id: `clip-${index}`, children: _jsx("circle", { cx: "22", cy: "22", r: "20" }) }) }), _jsxs("g", { clipPath: `url(#clip-${index})`, children: [_jsx("circle", { cx: "22", cy: "15", r: "7", fill: "rgba(255,255,255,0.18)" }), _jsx("ellipse", { cx: "22", cy: "40", rx: "14", ry: "11", fill: "rgba(255,255,255,0.18)" })] }), _jsx("text", { x: "22", y: "26", textAnchor: "middle", fontSize: "14", fontWeight: "800", fill: "#ffffff", fontFamily: "system-ui, -apple-system, sans-serif", children: initials })] })) }), _jsxs("div", { style: { minWidth: 0, flex: 1 }, children: [_jsx("div", { style: {
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "0.35rem",
                                            fontSize: "0.95rem",
                                            fontWeight: 700,
                                            color: "#111827",
                                            letterSpacing: "-0.01em",
                                        }, children: _jsx("span", { style: { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }, children: fullName }) }), contact.jobtitle && (_jsxs("div", { style: {
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "0.3rem",
                                            fontSize: "0.75rem",
                                            color: "#6b7280",
                                            fontWeight: 500,
                                            marginTop: "0.1rem",
                                        }, children: [_jsx(FieldIcon, { d: ICON_JOB, size: 11 }), _jsx("span", { style: { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }, children: contact.jobtitle })] }))] })] }), _jsxs("div", { style: {
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.35rem",
                            paddingLeft: "0.15rem",
                        }, children: [contact.emailaddress1 && (_jsxs("div", { style: { display: "flex", alignItems: "center", gap: "0.4rem" }, children: [_jsx(FieldIcon, { d: ICON_EMAIL, size: 12 }), _jsx("span", { style: {
                                            fontSize: "0.8rem",
                                            color: "#374151",
                                            fontWeight: 500,
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                        }, children: contact.emailaddress1 })] })), contact.telephone1 && (_jsxs("div", { style: { display: "flex", alignItems: "center", gap: "0.4rem" }, children: [_jsx(FieldIcon, { d: ICON_PHONE, size: 12 }), _jsx("span", { style: {
                                            fontSize: "0.8rem",
                                            color: "#374151",
                                            fontWeight: 500,
                                        }, children: contact.telephone1 })] }))] })] })] }));
}
export function ContactList() {
    const [contacts, setContacts] = useState(null);
    const [canOpenLinks, setCanOpenLinks] = useState(false);
    const [contactImages, setContactImages] = useState({});
    const { app, isConnected, error } = useApp({
        appInfo: { name: "Contact List", version: "1.0.0" },
        capabilities: {},
        onAppCreated: (app) => {
            app.ontoolinput = (params) => {
                const args = params.arguments;
                if (args.contactsJson) {
                    try {
                        const parsed = JSON.parse(args.contactsJson);
                        setContacts(parsed);
                    }
                    catch {
                        setContacts([]);
                    }
                }
                const hostCaps = app.getHostCapabilities();
                setCanOpenLinks(!!hostCaps?.openLinks);
            };
        },
    });
    useHostStyles(app);
    // Fetch contact images from Dataverse in parallel
    useEffect(() => {
        if (!app || !contacts || contacts.length === 0)
            return;
        let cancelled = false;
        (async () => {
            const results = await Promise.allSettled(contacts.map((c) => app.callServerTool({
                name: "GetContactImage",
                arguments: { id: c.id, logicalName: "contact" },
            }).then((result) => {
                const text = result.content
                    ?.filter((r) => r.type === "text")
                    .map((r) => r.text)
                    .join("") ?? "";
                return { id: c.id, text };
            })));
            if (cancelled)
                return;
            const images = {};
            for (const r of results) {
                if (r.status === "fulfilled" && r.value.text.startsWith("{")) {
                    try {
                        const data = JSON.parse(r.value.text);
                        if (data.hasImage && data.base64) {
                            images[r.value.id] = `data:${data.mimeType || "image/jpeg"};base64,${data.base64}`;
                        }
                    }
                    catch {
                        // skip malformed JSON
                    }
                }
            }
            setContactImages(images);
        })();
        return () => { cancelled = true; };
    }, [app, contacts]);
    if (error)
        return _jsxs("div", { children: ["Error: ", error.message] });
    if (!isConnected)
        return _jsx("div", { children: "Connecting..." });
    if (!contacts)
        return _jsx("div", { children: "Waiting for contact data..." });
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
                                                }, children: "Contacts" }), _jsx("p", { style: {
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
                                                }, children: contacts.length }), _jsx("img", { src: dataverseIcon, alt: "Dataverse", style: {
                                                    width: "24px",
                                                    height: "24px",
                                                    borderRadius: "6px",
                                                    background: "rgba(255,255,255,0.25)",
                                                    padding: "4px",
                                                } })] })] })] }), _jsx("div", { style: { padding: "0.9rem 1rem 1.1rem", display: "flex", flexDirection: "column", gap: "0.6rem" }, children: contacts.length === 0 ? (_jsx("div", { style: {
                                textAlign: "center",
                                padding: "2rem 1rem",
                                color: "#9ca3af",
                                fontSize: "0.9rem",
                                fontWeight: 500,
                            }, children: "No contacts found" })) : (contacts.map((contact, i) => (_jsx(ContactCard, { contact: contact, index: i, app: app, canOpenLinks: canOpenLinks, imageUrl: contactImages[contact.id] }, contact.id ?? i)))) })] })] }));
}
