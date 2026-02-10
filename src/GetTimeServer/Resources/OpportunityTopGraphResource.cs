using Microsoft.AspNetCore.Hosting;
using ModelContextProtocol.Server;
using System.ComponentModel;

namespace GetTimeServer.Resources;

[McpServerResourceType]
public class OpportunityTopGraphResource
{
    [McpServerResource(
        UriTemplate = "ui://get-opportunity/topgraph",
        Name = "Opportunity Top Graph",
        MimeType = "text/html;profile=mcp-app")]
    [Description("Horizontal bar graph UI for displaying top opportunities ranked by estimated value")]
    public static string GetOpportunityTopGraphHtml(IWebHostEnvironment env)
    {
        var path = Path.Combine(env.WebRootPath, "ui", "opportunitytopgraph.html");

        if (!File.Exists(path))
        {
            throw new FileNotFoundException(
                $"UI resource not found at {path}. Run 'npm run build' in the GetTimeServer.UI project first.");
        }

        return File.ReadAllText(path);
    }
}
