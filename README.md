# McpApps

A working example of the [MCP Apps](https://modelcontextprotocol.io/docs/extensions/apps) extension to the Model Context Protocol. MCP Apps lets servers return interactive HTML UIs that render inline within a conversation — things like forms, charts, and card grids — instead of plain text.

This repo demonstrates the pattern with a C#/.NET MCP server that connects to Dataverse and exposes several tools, some with interactive UIs and some without.

## What's in here

**Tools with UIs (MCP Apps):**
- Clock — shows the current time in a rendered clock face
- Contact card / contact list — displays Dataverse contact records with edit and camera support
- Opportunity card / opportunity list — displays opportunity records as interactive cards
- Opportunity pipeline — bar chart of estimated values aggregated by month
- Top opportunities graph — horizontal bar chart ranking opportunities by value, with clickable links to Dataverse records

**Plain tools (no UI):**
- WhoAmI — calls the Dataverse WhoAmI endpoint
- ExecuteFetch — runs FetchXML queries against Dataverse
- UpdateContact / UpdateOpportunity — write-back tools called by the UIs, hidden from the model

Each MCP App is a pair: a **tool** (server-side logic that returns data) bound to a **resource** (a static HTML template served via `ui://` that renders the data client-side). The host prefetches and caches the templates, then populates them with tool results at runtime.

## Stack

- **Server:** C# / ASP.NET Core / .NET 8
- **Frontend:** React 19 / TypeScript / Vite, bundled into single HTML files with `vite-plugin-singlefile`
- **Dataverse:** Microsoft.PowerPlatform.Dataverse.Client
- **MCP Apps SDK:** `@modelcontextprotocol/ext-apps` (client-side, in `tools/ext-apps/`)

## Submodule dependency

The `csharp-sdk/` directory is a git submodule pointing to a fork of the [C# Model Context Protocol SDK](https://github.com/modelcontextprotocol/csharp-sdk). The fork includes modifications to support the MCP Apps specification (resource MIME types, UI metadata on tools, etc.) that are not yet in the upstream SDK.

## Running it

1. Build the UI: `cd src/GetTimeServer.UI && npm install && npm run build`
2. Configure Dataverse connection in `src/GetTimeServer/appsettings.json`
3. Run the server: `cd src/GetTimeServer && dotnet run`
4. Connect from a host that supports MCP Apps (VS Code Insiders, Claude Desktop, etc.) — the `.vscode/mcp.json` file registers the server at `http://localhost:5000`
