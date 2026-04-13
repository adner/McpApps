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
- UpdateContact / UploadContactImage / GetContactImage / UpdateOpportunity — write-back tools called by the UIs

Each MCP App is a pair: a **tool** (server-side logic that returns data) bound to a **resource** (a static HTML template served via `ui://` that renders the data client-side). The host prefetches and caches the templates, then populates them with tool results at runtime.

## Declarative agent compatibility

The write-back tools (`UpdateContact`, `UploadContactImage`, `GetContactImage`, `UpdateOpportunity`) were originally restricted to app-only visibility (`"visibility": ["app"]`), meaning only the MCP Apps UI could call them — not the model. This restriction was relaxed so that these tools are now visible to both the model and the app. The change was needed for compatibility with the MCP JavaScript widget that powers [Microsoft declarative agent](https://learn.microsoft.com/en-us/microsoft-365-copilot/extensibility/overview-declarative-copilot) integration, which calls tools directly rather than through the MCP Apps iframe messaging channel (?). The tools also now return structured results (`StructuredContent`) alongside the text fallback - also to make it work with the declarative agent widget, that expects this format.

See it in action: [LinkedIn post](https://www.linkedin.com/posts/andreasadner_powerapps-microsoftcopilot-activity-7448784585456357376-X9bX)

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
