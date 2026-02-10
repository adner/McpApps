using Microsoft.AspNetCore.Hosting;
using ModelContextProtocol.Server;
using System.ComponentModel;

namespace GetTimeServer.Resources;

[McpServerResourceType]
public class OpportunityChartResource
{
    [McpServerResource(
        UriTemplate = "ui://get-opportunity/chart",
        Name = "Opportunity Chart",
        MimeType = "text/html;profile=mcp-app")]
    [Description("Opportunity pipeline chart UI for displaying estimated values by month")]
    public static string GetOpportunityChartHtml(IWebHostEnvironment env)
    {
        var path = Path.Combine(env.WebRootPath, "ui", "opportunitychart.html");

        if (!File.Exists(path))
        {
            throw new FileNotFoundException(
                $"UI resource not found at {path}. Run 'npm run build' in the GetTimeServer.UI project first.");
        }

        return File.ReadAllText(path);
    }
}
