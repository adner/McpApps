import { useState, useCallback } from "react";
import { useApp, useHostStyles } from "@modelcontextprotocol/ext-apps/react";

export function App() {
  const [time, setTime] = useState<string>("Waiting for tool result...");

  const { app, isConnected, error } = useApp({
    appInfo: { name: "Clock App", version: "1.0.0" },
    capabilities: {},
    onAppCreated: (app) => {
      app.ontoolresult = (result) => {
        const text = result.content?.find(
          (c: { type: string }) => c.type === "text"
        ) as { text?: string } | undefined;
        if (text?.text) {
          setTime(text.text);
        }
      };
    },
  });

  useHostStyles(app);

  const handleRefresh = useCallback(async () => {
    if (!app) return;
    try {
      const result = await app.callServerTool({
        name: "GetTime",
        arguments: {},
      });
      const text = result.content?.find(
        (c: { type: string }) => c.type === "text"
      ) as { text?: string } | undefined;
      if (text?.text) {
        setTime(text.text);
      }
    } catch (err) {
      setTime(`Error: ${err}`);
    }
  }, [app]);

  if (error) return <div>Error: {error.message}</div>;
  if (!isConnected) return <div>Connecting...</div>;

  return (
    <div
      style={{
        fontFamily: "var(--font-sans, system-ui, sans-serif)",
        padding: "1rem",
        color: "var(--color-text-primary, #000)",
        background: "var(--color-background-primary, #fff)",
      }}
    >
      <h2>Server Clock</h2>
      <p style={{ fontSize: "1.5rem", fontFamily: "var(--font-mono, monospace)" }}>
        {time}
      </p>
      <button onClick={handleRefresh}>Refresh</button>
    </div>
  );
}
