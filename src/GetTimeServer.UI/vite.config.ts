import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";
import path from "path";

export default defineConfig(({ mode }) => {
  const entries: Record<string, string> = { contact: "contact", contactlist: "contactlist", opportunity: "opportunity", opportunitylist: "opportunitylist", opportunitychart: "opportunitychart", opportunitytopgraph: "opportunitytopgraph" };
  const entry = entries[mode] ?? "index";

  return {
    plugins: [react(), viteSingleFile()],
    build: {
      outDir: path.resolve(__dirname, "../GetTimeServer/wwwroot/ui"),
      emptyOutDir: false,
      rollupOptions: {
        input: path.resolve(__dirname, `${entry}.html`),
      },
    },
  };
});
