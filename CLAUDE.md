# McpApps

This repo is an exploration of the MCP Apps extension to the Model Context Protocol. It demonstrates a working MCP server with interactive UIs and Dataverse integration.

## Project Structure

```
src/
  GetTimeServer/           # C# ASP.NET Core MCP server (.NET 8)
    Program.cs             # Server bootstrap, Dataverse ServiceClient, MCP registration
    Tools/
      TimeTool.cs          # GetTime tool (UI: ui://get-time/clock)
      DataverseTool.cs     # WhoAmI, ExecuteFetch (FetchXML queries, no UI)
      ContactTool.cs       # ShowContact, ShowManyContacts (with UI), UpdateContact, UploadContactImage (UI-only)
    Resources/
      ClockUiResource.cs           # Serves ui://get-time/clock
      ContactFormResource.cs       # Serves ui://get-contact/form (requests camera permission)
      ContactListResource.cs       # Serves ui://get-contact/list
    wwwroot/ui/            # Built UI files (output of GetTimeServer.UI build)
    appsettings.json       # Dataverse connection string (contains client secret)
  GetTimeServer.UI/        # TypeScript/React frontend
    src/
      App.tsx              # Clock UI component
      ContactForm.tsx      # Single contact display with edit, camera, image upload
      ContactList.tsx      # Multi-contact card grid
    vite.config.ts         # Vite config, uses vite-plugin-singlefile, outputs to ../GetTimeServer/wwwroot/ui/
    package.json           # React 19, @modelcontextprotocol/ext-apps
tools/
  ext-apps/                # MCP Apps SDK (local copy of @modelcontextprotocol/ext-apps)
csharp-sdk/                # C# MCP SDK (git submodule)
.github/
  agents/                  # VS Code custom agent definitions
.vscode/
  mcp.json                 # Registers McpAppsServer at http://localhost:5000
```

## Tech Stack

- **Backend**: C# / ASP.NET Core / .NET 8.0
- **Dataverse SDK**: Microsoft.PowerPlatform.Dataverse.Client 1.2.10
- **MCP Server SDK**: ModelContextProtocol.AspNetCore (from csharp-sdk submodule)
- **Frontend**: React 19 / TypeScript 5.6 / Vite 6
- **Bundling**: vite-plugin-singlefile (inlines all assets into single HTML files)
- **MCP Apps SDK**: @modelcontextprotocol/ext-apps

## MCP Tools and Resources

| Tool | UI Resource | Visibility | Purpose |
|------|------------|------------|---------|
| GetTime | ui://get-time/clock | model + app | Returns current UTC time, renders clock UI |
| WhoAmI | none | model + app | Executes Dataverse WhoAmIRequest |
| ExecuteFetch | none | model + app | Runs FetchXML queries against Dataverse |
| ShowContact | ui://get-contact/form | model + app | Displays single contact in editable form |
| ShowManyContacts | ui://get-contact/list | model + app | Displays contact list as card grid |
| UpdateContact | none | app only | Updates contact fields (called from ContactForm UI) |
| UploadContactImage | none | app only | Uploads base64 image to contact record (called from ContactForm UI) |

## Building and Running

1. **Build the UI**: `cd src/GetTimeServer.UI && npm install && npm run build`
   - This produces `index.html`, `contact.html`, `contactlist.html` in `src/GetTimeServer/wwwroot/ui/`
2. **Run the server**: `cd src/GetTimeServer && dotnet run`
   - Server starts on `http://localhost:5000`
3. **Connect from VS Code**: The `.vscode/mcp.json` registers the server automatically

## Key Reference Links

- **MCP Extensions Overview**: https://modelcontextprotocol.io/docs/extensions/overview
  - Extensions are optional additions identified by `{vendor-prefix}/{extension-name}` (e.g., `io.modelcontextprotocol/oauth-client-credentials`)
  - Official extensions use the `io.modelcontextprotocol` vendor prefix and live in GitHub repos with `ext-` prefix
  - Clients and servers negotiate extension support via the `extensions` field in capabilities during initialization
  - Extensions are always disabled by default and require explicit opt-in

- **MCP Apps Extension**: https://modelcontextprotocol.io/docs/extensions/apps
  - Allows MCP servers to return interactive HTML UIs (charts, forms, dashboards) rendered inline within conversations
  - Tools declare a `_meta.ui.resourceUri` field pointing to a `ui://` resource; the host renders it in a sandboxed iframe
  - Uses `@modelcontextprotocol/ext-apps` package for both server-side (`registerAppTool`, `registerAppResource`) and client-side (`App` class) helpers
  - Communication between app and host uses JSON-RPC over postMessage
  - The `App` class provides `connect()`, `ontoolresult`, `callServerTool()`, and context update methods
  - Supported by Claude (web), Claude Desktop, VS Code Insiders, Goose, Postman, and MCPJam
  - Full API docs: https://modelcontextprotocol.github.io/ext-apps/api/
  - GitHub repo: https://github.com/modelcontextprotocol/ext-apps
  - Specification: https://github.com/modelcontextprotocol/ext-apps/blob/main/specification/draft/apps.mdx

## Architecture Notes

### Tool + Resource Model

Every MCP App consists of two parts bound together:

- **Tool** — an action that takes arguments, runs server-side logic, and returns data
- **Resource** — a static, cacheable HTML template (served via `ui://` scheme) that knows how to render data but contains none itself
- **Binding** — the tool's `_meta.ui.resourceUri` links the two together

Neither part works alone. A resource without a tool has no data. A tool without a resource has no interactive UI.

### Why Tools Mediate Resources (Not Resources Alone)

The tool+resource split exists for several architectural reasons:

1. **Prefetching** — `resourceUri` is declared in `tools/list` metadata at connection time, so hosts can prefetch and cache the HTML template before any tool is ever called
2. **Streaming** — because the template is already loaded in an iframe before tool execution finishes, the spec can deliver `ontoolinputpartial` (streaming partial JSON as the LLM generates arguments) for progressive rendering
3. **Security auditing** — hosts can inspect all UI templates, CSP declarations, and permission requests at connection time, before any server-side code runs
4. **Interactivity via `callServerTool`** — the UI can call tools on the server for fresh data (refresh buttons, pagination, form submissions) without routing through the model. Resources are read-only in MCP and have no equivalent
5. **Tool visibility** — `_meta.ui.visibility: ["app"]` creates tools only the UI can call, hidden from the model. Resources have no access control concept
6. **Graceful degradation** — tools always return a `content` array with text fallback for hosts that don't support MCP Apps

### UI Rendering Behavior

- The spec says: *"If `ui.resourceUri` is present and host supports MCP Apps, host renders tool results using the specified UI resource"*
- This is conditional on host capability, not an unconditional MUST
- Hosts that don't support the extension show the text fallback from the tool's `content` array
- The spec is ambiguous on whether a supporting host can choose NOT to render — the intent is that it always does, but there's no strict normative "MUST render" language

### Tool Types in a Single Server

A single MCP server can expose:

- **App tools** — tools with `_meta.ui.resourceUri` that trigger a UI when called
- **Plain tools** — regular MCP tools with no `_meta.ui`, callable by the model or by app UIs via `callServerTool`
- **UI-only tools** — tools with `_meta.ui.visibility: ["app"]`, hidden from the model but callable by any UI on the same server

### Server Boundaries

- **Tools and their resources must be on the same MCP server.** The `ui://` scheme resolves via `resources/read` on the server that declared the tool. There is no cross-server resource reference mechanism.
- **`callServerTool` is scoped to the originating server.** The spec states: *"Cross-server tool calls are always blocked for app-only tools."* A UI resource from Server A cannot call tools on Server B.
- **No external URL resources.** The `ui://` scheme is MCP-internal. You cannot point `resourceUri` at an `https://` URL. The resource must be a single self-contained HTML blob served through MCP's `resources/read`.

### Rendering Model: Client-Side Only

- Resources are static, cacheable HTML templates — **not** dynamically generated per request
- Hosts MAY prefetch and cache resources at connection time, so SSR that bakes data into HTML would produce stale cached results
- There is no HTTP request/response cycle; `resources/read` is an MCP RPC call
- **Server-side rendering (SSR) does not fit this model.** The architecture enforces client-side rendering: static template + dynamic data via message passing
- For dynamic HTML generation, the tool result can carry generated HTML/data which the static UI template then injects/renders at runtime
- All assets (CSS, JS, images) must be inlined into a single HTML file using `vite-plugin-singlefile`
