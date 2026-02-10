using Microsoft.AspNetCore.Hosting;
using ModelContextProtocol.Server;
using System.ComponentModel;

namespace GetTimeServer.Resources;

[McpServerResourceType]
public class ContactFormResource
{
    [McpServerResource(
        UriTemplate = "ui://get-contact/form",
        Name = "Contact Form",
        MimeType = "text/html;profile=mcp-app")]
    [Description("Contact form UI")]
    [McpMeta("ui", JsonValue = """{"permissions":{"camera":{}}}""")]
    public static string GetContactFormHtml(IWebHostEnvironment env)
    {
        var path = Path.Combine(env.WebRootPath, "ui", "contact.html");

        if (!File.Exists(path))
        {
            throw new FileNotFoundException(
                $"UI resource not found at {path}. Run 'npm run build' in the GetTimeServer.UI project first.");
        }

        return File.ReadAllText(path);
    }
}
