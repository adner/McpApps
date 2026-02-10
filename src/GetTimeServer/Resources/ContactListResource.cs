using Microsoft.AspNetCore.Hosting;
using ModelContextProtocol.Server;
using System.ComponentModel;

namespace GetTimeServer.Resources;

[McpServerResourceType]
public class ContactListResource
{
    [McpServerResource(
        UriTemplate = "ui://get-contact/list",
        Name = "Contact List",
        MimeType = "text/html;profile=mcp-app")]
    [Description("Contact list UI for displaying multiple contacts")]
    public static string GetContactListHtml(IWebHostEnvironment env)
    {
        var path = Path.Combine(env.WebRootPath, "ui", "contactlist.html");

        if (!File.Exists(path))
        {
            throw new FileNotFoundException(
                $"UI resource not found at {path}. Run 'npm run build' in the GetTimeServer.UI project first.");
        }

        return File.ReadAllText(path);
    }
}
