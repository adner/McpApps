using Microsoft.AspNetCore.Hosting;
using ModelContextProtocol.Server;
using System.ComponentModel;

namespace GetTimeServer.Resources;

[McpServerResourceType]
public class OpportunityFormResource
{
    [McpServerResource(
        UriTemplate = "ui://get-opportunity/form",
        Name = "Opportunity Form",
        MimeType = "text/html;profile=mcp-app")]
    [Description("Opportunity form UI")]
    public static string GetOpportunityFormHtml(IWebHostEnvironment env)
    {
        var path = Path.Combine(env.WebRootPath, "ui", "opportunity.html");

        if (!File.Exists(path))
        {
            throw new FileNotFoundException(
                $"UI resource not found at {path}. Run 'npm run build' in the GetTimeServer.UI project first.");
        }

        return File.ReadAllText(path);
    }
}
