import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useRef, useCallback, useEffect } from "react";
import { useApp, useHostStyles } from "@modelcontextprotocol/ext-apps/react";
import dataverseIcon from "./assets/dataverse-icon.webp";
const ANIMATIONS = `
@keyframes card-in {
  from { opacity: 0; transform: translateY(24px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes avatar-pop {
  0%   { opacity: 0; transform: translateX(-50%) scale(0.3); }
  60%  { transform: translateX(-50%) scale(1.08); }
  100% { opacity: 1; transform: translateX(-50%) scale(1); }
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
@keyframes glow-pulse {
  0%, 100% { box-shadow: 0 0 12px var(--glow-color), 0 4px 16px var(--glow-color-dim); }
  50%      { box-shadow: 0 0 24px var(--glow-color), 0 4px 24px var(--glow-color-dim); }
}
@keyframes overlay-in {
  from { opacity: 0; transform: scale(0.9); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes flash {
  0%   { opacity: 0.8; }
  100% { opacity: 0; }
}
`;
const CONTACT_FIELDS = [
    { key: "firstname", label: "First Name", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
    { key: "lastname", label: "Last Name", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
    { key: "emailaddress1", label: "Email", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
    { key: "telephone1", label: "Phone", icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" },
    { key: "jobtitle", label: "Job Title", icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
];
const DYNAMICS_BASE = "https://org41df0750.crm4.dynamics.com/main.aspx?appid=6605cbc2-a674-f011-b4cc-000d3ab25cc7&forceUCI=1&pagetype=entityrecord&etn=contact&id=";
function getInitials(data) {
    const first = (data.firstname ?? "")[0] ?? "";
    const last = (data.lastname ?? "")[0] ?? "";
    return (first + last).toUpperCase() || "?";
}
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
function FieldIcon({ d }) {
    return (_jsx("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", style: { flexShrink: 0 }, children: _jsx("path", { d: d }) }));
}
export function ContactForm() {
    const [contactData, setContactData] = useState(null);
    const [editedFields, setEditedFields] = useState({});
    const [saving, setSaving] = useState(false);
    const [saveResult, setSaveResult] = useState(null);
    const [hasCamera, setHasCamera] = useState(false);
    const [canOpenLinks, setCanOpenLinks] = useState(false);
    const [cameraMode, setCameraMode] = useState("off");
    const [capturedImage, setCapturedImage] = useState(null);
    const [avatarImage, setAvatarImage] = useState(null);
    const [fetchedImage, setFetchedImage] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [showFlash, setShowFlash] = useState(false);
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const fileInputRef = useRef(null);
    const { app, isConnected, error } = useApp({
        appInfo: { name: "Contact Form", version: "1.0.0" },
        capabilities: {},
        onAppCreated: (app) => {
            app.ontoolinput = (params) => {
                const args = params.arguments;
                setContactData(args);
                const caps = app.getHostCapabilities();
                setHasCamera(!!caps?.sandbox?.permissions?.camera);
                setCanOpenLinks(!!caps?.openLinks);
            };
        },
    });
    useHostStyles(app);
    const isDirty = Object.keys(editedFields).length > 0;
    const stopCamera = useCallback(() => {
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
    }, []);
    const startCamera = useCallback(async () => {
        setCameraMode("live");
        setCapturedImage(null);
        setSaveResult(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user", width: { ideal: 480 }, height: { ideal: 480 } },
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        }
        catch (e) {
            setCameraMode("off");
            const msg = e instanceof Error ? e.message : "Camera access denied";
            setSaveResult({ ok: false, message: `Camera: ${msg}` });
        }
    }, []);
    const captureSnapshot = useCallback(() => {
        const video = videoRef.current;
        if (!video)
            return;
        const canvas = document.createElement("canvas");
        const size = Math.min(video.videoWidth, video.videoHeight);
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        const offsetX = (video.videoWidth - size) / 2;
        const offsetY = (video.videoHeight - size) / 2;
        ctx.drawImage(video, offsetX, offsetY, size, size, 0, 0, size, size);
        const dataUrl = canvas.toDataURL("image/png");
        setCapturedImage(dataUrl);
        setShowFlash(true);
        setTimeout(() => setShowFlash(false), 300);
        stopCamera();
        setCameraMode("captured");
    }, [stopCamera]);
    const discardCapture = useCallback(() => {
        stopCamera();
        setCapturedImage(null);
        setCameraMode("off");
    }, [stopCamera]);
    const saveImage = useCallback(async () => {
        if (!app || !contactData || !capturedImage)
            return;
        setUploadingImage(true);
        setSaveResult(null);
        try {
            const base64 = capturedImage.replace(/^data:image\/\w+;base64,/, "");
            const result = await app.callServerTool({
                name: "UploadContactImage",
                arguments: {
                    id: contactData.id,
                    logicalName: contactData.logicalName,
                    imageBase64: base64,
                },
            });
            const text = result.content
                ?.filter((c) => c.type === "text")
                .map((c) => c.text)
                .join("") ?? "";
            if (text.startsWith("[ERROR]")) {
                setSaveResult({ ok: false, message: text });
            }
            else {
                setAvatarImage(capturedImage);
                setSaveResult({ ok: true, message: text || "Image saved" });
                setCameraMode("off");
                setCapturedImage(null);
            }
        }
        catch (e) {
            const message = e instanceof Error ? e.message : "Upload failed";
            setSaveResult({ ok: false, message });
        }
        finally {
            setUploadingImage(false);
        }
    }, [app, contactData, capturedImage]);
    const handleFileSelect = useCallback((e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        const reader = new FileReader();
        reader.onload = () => {
            setCapturedImage(reader.result);
            setCameraMode("captured");
            setSaveResult(null);
        };
        reader.readAsDataURL(file);
        e.target.value = "";
    }, []);
    const handleAvatarClick = useCallback(() => {
        if (cameraMode !== "off")
            return;
        if (hasCamera) {
            startCamera();
        }
        else {
            fileInputRef.current?.click();
        }
    }, [cameraMode, hasCamera, startCamera]);
    // Cleanup stream on unmount
    useEffect(() => () => stopCamera(), [stopCamera]);
    // Fetch contact image from Dataverse
    useEffect(() => {
        if (!app || !contactData?.id || !contactData?.logicalName || avatarImage)
            return;
        let cancelled = false;
        (async () => {
            try {
                const result = await app.callServerTool({
                    name: "GetContactImage",
                    arguments: { id: contactData.id, logicalName: contactData.logicalName },
                });
                if (cancelled)
                    return;
                const text = result.content
                    ?.filter((c) => c.type === "text")
                    .map((c) => c.text)
                    .join("") ?? "";
                if (text.startsWith("{")) {
                    const data = JSON.parse(text);
                    if (data.hasImage && data.base64) {
                        setFetchedImage(`data:${data.mimeType || "image/jpeg"};base64,${data.base64}`);
                    }
                }
            }
            catch {
                // Silently ignore — initials fallback remains
            }
        })();
        return () => { cancelled = true; };
    }, [app, contactData?.id, contactData?.logicalName, avatarImage]);
    const handleFieldChange = (key, value) => {
        setEditedFields((prev) => {
            const original = contactData?.[key] ?? "";
            if (value === original) {
                const { [key]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [key]: value };
        });
        setSaveResult(null);
    };
    const handleSave = async () => {
        if (!app || !contactData || !isDirty)
            return;
        setSaving(true);
        setSaveResult(null);
        try {
            const result = await app.callServerTool({
                name: "UpdateContact",
                arguments: {
                    id: contactData.id,
                    logicalName: contactData.logicalName,
                    ...editedFields,
                },
            });
            const text = result.content
                ?.filter((c) => c.type === "text")
                .map((c) => c.text)
                .join("") ?? "";
            if (text.startsWith("[ERROR]")) {
                setSaveResult({ ok: false, message: text });
            }
            else {
                setContactData((prev) => ({ ...prev, ...editedFields }));
                setEditedFields({});
                setSaveResult({ ok: true, message: text || "Saved" });
            }
        }
        catch (e) {
            const message = e instanceof Error ? e.message : "Save failed";
            setSaveResult({ ok: false, message });
        }
        finally {
            setSaving(false);
        }
    };
    if (error)
        return _jsxs("div", { children: ["Error: ", error.message] });
    if (!isConnected)
        return _jsx("div", { children: "Connecting..." });
    if (!contactData)
        return _jsx("div", { children: "Waiting for contact data..." });
    const displayData = { ...contactData, ...editedFields };
    const initials = getInitials(displayData);
    const color = initialsToColor(initials);
    const fullName = [displayData.firstname, displayData.lastname].filter(Boolean).join(" ") || "Unknown";
    return (_jsxs("div", { style: {
            fontFamily: "var(--font-sans, system-ui, -apple-system, sans-serif)",
            padding: "1.25rem",
            boxSizing: "border-box",
        }, children: [_jsx("style", { children: ANIMATIONS }), _jsxs("div", { style: {
                    maxWidth: "420px",
                    borderRadius: "16px",
                    background: "#ffffff",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)",
                    animation: "card-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
                }, children: [_jsxs("div", { style: { position: "relative", paddingBottom: "52px" }, children: [_jsxs("div", { style: {
                                    height: "64px",
                                    background: `linear-gradient(135deg, ${color} 0%, #1e1e3f 100%)`,
                                    borderRadius: "16px 16px 0 0",
                                    position: "relative",
                                    overflow: "hidden",
                                }, children: [_jsx("div", { style: {
                                            position: "absolute",
                                            inset: 0,
                                            background: "linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.25) 45%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0.25) 55%, transparent 70%)",
                                            backgroundSize: "200% 100%",
                                            animation: "shimmer 8s ease-in-out infinite",
                                        } }), _jsx("img", { src: dataverseIcon, alt: "Dataverse", title: canOpenLinks ? "Open in Dynamics 365" : undefined, onClick: canOpenLinks && contactData ? () => app?.openLink({ url: `${DYNAMICS_BASE}${contactData.id}` }) : undefined, style: {
                                            position: "absolute",
                                            top: "12px",
                                            right: "14px",
                                            width: "24px",
                                            height: "24px",
                                            borderRadius: "6px",
                                            background: "rgba(255, 255, 255, 0.25)",
                                            padding: "4px",
                                            zIndex: 1,
                                            cursor: canOpenLinks ? "pointer" : "default",
                                        } })] }), _jsx("div", { style: {
                                    position: "absolute",
                                    bottom: 0,
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                    animation: "avatar-pop 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both",
                                }, children: _jsxs("div", { onClick: cameraMode === "off" ? handleAvatarClick : undefined, style: {
                                        width: "96px",
                                        height: "96px",
                                        borderRadius: "50%",
                                        background: capturedImage && cameraMode !== "off"
                                            ? `url(${capturedImage}) center/cover`
                                            : avatarImage
                                                ? `url(${avatarImage}) center/cover`
                                                : fetchedImage
                                                    ? `url(${fetchedImage}) center/cover`
                                                    : `linear-gradient(145deg, ${color}, ${color}cc)`,
                                        transition: "background 0.3s ease",
                                        border: "4px solid #ffffff",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        cursor: cameraMode === "off" ? "pointer" : "default",
                                        position: "relative",
                                        overflow: "hidden",
                                        // @ts-expect-error CSS custom properties
                                        "--glow-color": `${color}88`,
                                        "--glow-color-dim": `${color}44`,
                                        animation: "glow-pulse 2.5s ease-in-out infinite",
                                    }, children: [(cameraMode === "off" || cameraMode === "live") && !capturedImage && !avatarImage && !fetchedImage && (_jsxs("svg", { width: "96", height: "96", viewBox: "0 0 96 96", children: [_jsx("defs", { children: _jsx("clipPath", { id: "avatar-clip", children: _jsx("circle", { cx: "48", cy: "48", r: "44" }) }) }), _jsxs("g", { clipPath: "url(#avatar-clip)", children: [_jsx("circle", { cx: "48", cy: "34", r: "16", fill: "rgba(255,255,255,0.2)" }), _jsx("ellipse", { cx: "48", cy: "88", rx: "32", ry: "24", fill: "rgba(255,255,255,0.2)" })] }), _jsx("text", { x: "48", y: "56", textAnchor: "middle", fontSize: "30", fontWeight: "800", fill: "#ffffff", fontFamily: "system-ui, -apple-system, sans-serif", children: initials })] })), cameraMode === "off" && (_jsx("div", { style: {
                                                position: "absolute",
                                                bottom: "2px",
                                                right: "2px",
                                                width: "26px",
                                                height: "26px",
                                                borderRadius: "50%",
                                                background: "#ffffff",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                                            }, children: hasCamera ? (_jsxs("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("path", { d: "M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" }), _jsx("circle", { cx: "12", cy: "13", r: "4" })] })) : (_jsxs("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("path", { d: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" }), _jsx("polyline", { points: "17 8 12 3 7 8" }), _jsx("line", { x1: "12", y1: "3", x2: "12", y2: "15" })] })) })), _jsx("input", { ref: fileInputRef, type: "file", accept: "image/*", onChange: handleFileSelect, style: { display: "none" } })] }) })] }), cameraMode !== "off" && (_jsxs("div", { style: {
                            padding: "0.75rem 1.5rem 0",
                            animation: "overlay-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) both",
                        }, children: [_jsxs("div", { style: {
                                    position: "relative",
                                    borderRadius: "12px",
                                    overflow: "hidden",
                                    background: "#000",
                                    aspectRatio: "1",
                                    maxWidth: "240px",
                                    margin: "0 auto",
                                }, children: [cameraMode === "live" && (_jsx("video", { ref: videoRef, autoPlay: true, playsInline: true, muted: true, style: {
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover",
                                            transform: "scaleX(-1)",
                                            display: "block",
                                        } })), cameraMode === "captured" && capturedImage && (_jsx("img", { src: capturedImage, alt: "Captured", style: { width: "100%", height: "100%", objectFit: "cover", display: "block" } })), showFlash && (_jsx("div", { style: {
                                            position: "absolute",
                                            inset: 0,
                                            background: "#ffffff",
                                            animation: "flash 0.3s ease-out forwards",
                                            pointerEvents: "none",
                                        } }))] }), _jsxs("div", { style: { display: "flex", gap: "0.5rem", justifyContent: "center", marginTop: "0.6rem" }, children: [cameraMode === "live" && (_jsxs(_Fragment, { children: [_jsx("button", { onClick: captureSnapshot, style: {
                                                    padding: "0.45rem 1rem",
                                                    border: "none",
                                                    borderRadius: "8px",
                                                    fontSize: "0.8rem",
                                                    fontWeight: 700,
                                                    color: "#fff",
                                                    background: color,
                                                    cursor: "pointer",
                                                }, children: "Capture" }), _jsx("button", { onClick: discardCapture, style: {
                                                    padding: "0.45rem 1rem",
                                                    border: "1.5px solid #e2e8f0",
                                                    borderRadius: "8px",
                                                    fontSize: "0.8rem",
                                                    fontWeight: 700,
                                                    color: "#6b7280",
                                                    background: "#fff",
                                                    cursor: "pointer",
                                                }, children: "Cancel" })] })), cameraMode === "captured" && (_jsxs(_Fragment, { children: [_jsx("button", { onClick: saveImage, disabled: uploadingImage, style: {
                                                    padding: "0.45rem 1rem",
                                                    border: "none",
                                                    borderRadius: "8px",
                                                    fontSize: "0.8rem",
                                                    fontWeight: 700,
                                                    color: "#fff",
                                                    background: uploadingImage ? "#9ca3af" : "#059669",
                                                    cursor: uploadingImage ? "not-allowed" : "pointer",
                                                    opacity: uploadingImage ? 0.7 : 1,
                                                }, children: uploadingImage ? "Saving..." : "Save" }), _jsx("button", { onClick: discardCapture, disabled: uploadingImage, style: {
                                                    padding: "0.45rem 1rem",
                                                    border: "1.5px solid #e2e8f0",
                                                    borderRadius: "8px",
                                                    fontSize: "0.8rem",
                                                    fontWeight: 700,
                                                    color: "#6b7280",
                                                    background: "#fff",
                                                    cursor: uploadingImage ? "not-allowed" : "pointer",
                                                }, children: "Discard" })] }))] })] })), _jsxs("div", { style: {
                            textAlign: "center",
                            padding: "0.5rem 1.5rem 0",
                            animation: "name-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.35s both",
                        }, children: [_jsx("h2", { style: {
                                    margin: "0 0 0.1rem",
                                    fontSize: "1.3rem",
                                    fontWeight: 800,
                                    color: "#111827",
                                    letterSpacing: "-0.01em",
                                }, children: fullName }), displayData.jobtitle && (_jsx("p", { style: {
                                    margin: 0,
                                    fontSize: "0.85rem",
                                    color: "#6b7280",
                                    fontWeight: 500,
                                }, children: displayData.jobtitle }))] }), _jsx("div", { style: {
                            height: "1px",
                            background: `linear-gradient(to right, transparent, ${color}44, transparent)`,
                            margin: "1.1rem 1.5rem 0",
                        } }), _jsxs("div", { style: { padding: "0.9rem 1.5rem 1.4rem" }, children: [_jsx("div", { style: {
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "0.75rem",
                                }, children: CONTACT_FIELDS.map(({ key, label, icon }, i) => {
                                    const isEdited = key in editedFields;
                                    return (_jsxs("div", { style: {
                                            animation: `field-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${0.4 + i * 0.08}s both`,
                                        }, children: [_jsxs("label", { style: {
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "0.3rem",
                                                    fontSize: "0.65rem",
                                                    fontWeight: 700,
                                                    textTransform: "uppercase",
                                                    letterSpacing: "0.06em",
                                                    color: color,
                                                    marginBottom: "0.25rem",
                                                }, children: [_jsx(FieldIcon, { d: icon }), label] }), _jsx("input", { type: "text", value: editedFields[key] ?? contactData[key] ?? "", onChange: (e) => handleFieldChange(key, e.target.value), style: {
                                                    width: "100%",
                                                    padding: "0.55rem 0.75rem",
                                                    border: "1.5px solid #e2e8f0",
                                                    borderLeft: isEdited ? `3px solid ${color}` : "1.5px solid #e2e8f0",
                                                    borderRadius: "8px",
                                                    fontSize: "0.875rem",
                                                    fontWeight: 600,
                                                    color: "#1e293b",
                                                    background: isEdited ? "#fffbeb" : "#f8fafc",
                                                    boxSizing: "border-box",
                                                    outline: "none",
                                                    transition: "border-color 0.2s, box-shadow 0.2s, background 0.2s",
                                                } })] }, key));
                                }) }), isDirty && (_jsx("button", { onClick: handleSave, disabled: saving, style: {
                                    marginTop: "1rem",
                                    width: "100%",
                                    padding: "0.65rem 1rem",
                                    border: "none",
                                    borderRadius: "8px",
                                    fontSize: "0.875rem",
                                    fontWeight: 700,
                                    color: "#ffffff",
                                    background: saving ? "#9ca3af" : color,
                                    cursor: saving ? "not-allowed" : "pointer",
                                    transition: "background 0.2s, opacity 0.2s",
                                    opacity: saving ? 0.7 : 1,
                                }, children: saving ? "Saving..." : "Save Changes" })), saveResult && (_jsx("div", { style: {
                                    marginTop: "0.5rem",
                                    padding: "0.5rem 0.75rem",
                                    borderRadius: "6px",
                                    fontSize: "0.8rem",
                                    fontWeight: 600,
                                    background: saveResult.ok ? "#ecfdf5" : "#fef2f2",
                                    color: saveResult.ok ? "#065f46" : "#991b1b",
                                    border: `1px solid ${saveResult.ok ? "#a7f3d0" : "#fecaca"}`,
                                }, children: saveResult.message }))] })] })] }));
}
