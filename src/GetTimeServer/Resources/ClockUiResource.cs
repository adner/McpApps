using Microsoft.AspNetCore.Hosting;
using ModelContextProtocol.Server;
using System.ComponentModel;

namespace GetTimeServer.Resources;

[McpServerResourceType]
public class ClockUiResource
{
    [McpServerResource(
        UriTemplate = "ui://get-time/clock",
        Name = "Clock UI",
        MimeType = "text/html;profile=mcp-app")]
    [Description("Interactive clock UI for the GetTime tool")]
    public static string GetClockHtml(IWebHostEnvironment env)
    {
        var path = Path.Combine(env.WebRootPath, "ui", "index.html");

        if (!File.Exists(path))
        {
            throw new FileNotFoundException(
                $"UI resource not found at {path}. Run 'npm run build' in the GetTimeServer.UI project first.");
        }

        return File.ReadAllText(path);
    }
}
