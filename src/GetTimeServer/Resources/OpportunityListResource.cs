using Microsoft.AspNetCore.Hosting;
using ModelContextProtocol.Server;
using System.ComponentModel;

namespace GetTimeServer.Resources;

[McpServerResourceType]
public class OpportunityListResource
{
    [McpServerResource(
        UriTemplate = "ui://get-opportunity/list",
        Name = "Opportunity List",
        MimeType = "text/html;profile=mcp-app")]
    [Description("Opportunity list UI for displaying multiple opportunities")]
    public static string GetOpportunityListHtml(IWebHostEnvironment env)
    {
        var path = Path.Combine(env.WebRootPath, "ui", "opportunitylist.html");

        if (!File.Exists(path))
        {
            throw new FileNotFoundException(
                $"UI resource not found at {path}. Run 'npm run build' in the GetTimeServer.UI project first.");
        }

        return File.ReadAllText(path);
    }
}
