import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useState, useCallback } from "react";
import { useApp, useHostStyles } from "@modelcontextprotocol/ext-apps/react";
export function App() {
    const [time, setTime] = useState("Waiting for tool result...");
    const { app, isConnected, error } = useApp({
        appInfo: { name: "Clock App", version: "1.0.0" },
        capabilities: {},
        onAppCreated: (app) => {
            app.ontoolresult = (result) => {
                const text = result.content?.find((c) => c.type === "text");
                if (text?.text) {
                    setTime(text.text);
                }
            };
        },
    });
    useHostStyles(app);
    const handleRefresh = useCallback(async () => {
        if (!app)
            return;
        try {
            const result = await app.callServerTool({
                name: "GetTime",
                arguments: {},
            });
            const text = result.content?.find((c) => c.type === "text");
            if (text?.text) {
                setTime(text.text);
            }
        }
        catch (err) {
            setTime(`Error: ${err}`);
        }
    }, [app]);
    if (error)
        return _jsxs("div", { children: ["Error: ", error.message] });
    if (!isConnected)
        return _jsx("div", { children: "Connecting..." });
    return (_jsxs("div", { style: {
            fontFamily: "var(--font-sans, system-ui, sans-serif)",
            padding: "1rem",
            color: "var(--color-text-primary, #000)",
            background: "var(--color-background-primary, #fff)",
        }, children: [_jsx("h2", { children: "Server Clock" }), _jsx("p", { style: { fontSize: "1.5rem", fontFamily: "var(--font-mono, monospace)" }, children: time }), _jsx("button", { onClick: handleRefresh, children: "Refresh" })] }));
}
