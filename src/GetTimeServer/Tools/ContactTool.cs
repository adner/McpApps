using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using ModelContextProtocol.Server;
using System.ComponentModel;

namespace GetTimeServer.Tools;

[McpServerToolType]
public class ContactTool
{
    [McpServerTool(Name = "ShowContact")]
    [Description("Displays an interactive contact card for exactly ONE contact. Use only when ExecuteFetch returned a single contact record. Pass that record's fields as arguments. If ExecuteFetch returned multiple contacts, use ShowManyContacts instead.")]
    [McpMeta("ui", JsonValue = """{"resourceUri":"ui://get-contact/form"}""")]
    public static string GetContact(
        string id,
        string logicalName,
        string? firstname,
        string? lastname,
        string? emailaddress1,
        string? telephone1,
        string? jobtitle)
    {
        return $"{firstname} {lastname} ({emailaddress1})";
    }

    [McpServerTool(Name = "ShowManyContacts")]
    [Description("Displays a contact list for multiple contacts. Use when ExecuteFetch returned two or more contact records. Pass the full JSON array of contact objects from the ExecuteFetch result.")]
    [McpMeta("ui", JsonValue = """{"resourceUri":"ui://get-contact/list"}""")]
    public static string GetManyContacts(
        string logicalName,
        [Description("A JSON array of contact objects from ExecuteFetch. Each object should have id, firstname, lastname, emailaddress1, telephone1, and jobtitle fields.")]
        string contactsJson)
    {
        return $"Displaying contact list ({logicalName})";
    }

    [McpServerTool(Name = "UploadContactImage")]
    [Description("Uploads a photo as the entity image for a contact record in Dataverse. Only callable by the contact form UI.")]
    [McpMeta("ui", JsonValue = """{"visibility":["app"]}""")]
    public static string UploadContactImage(
        string id,
        string logicalName,
        [Description("Base64-encoded image data (without the data:image/... prefix)")]
        string imageBase64,
        IOrganizationService orgService)
    {
        try
        {
            var entity = new Entity(logicalName, Guid.Parse(id));
            entity["entityimage"] = Convert.FromBase64String(imageBase64);
            orgService.Update(entity);
            return "Contact image updated successfully.";
        }
        catch (Exception ex)
        {
            return $"[ERROR] {ex.Message}";
        }
    }

    [McpServerTool(Name = "GetContactImage")]
    [Description("Retrieves the entity image for a contact record from Dataverse. Only callable by app UIs.")]
    [McpMeta("ui", JsonValue = """{"visibility":["app"]}""")]
    public static string GetContactImage(
        string id,
        string logicalName,
        IOrganizationService orgService)
    {
        try
        {
            var entity = orgService.Retrieve(logicalName, Guid.Parse(id), new ColumnSet("entityimage"));
            if (entity.Contains("entityimage") && entity["entityimage"] is byte[] imageBytes && imageBytes.Length > 0)
            {
                var base64 = Convert.ToBase64String(imageBytes);
                return $$$"""{"hasImage":true,"base64":"{{{base64}}}","mimeType":"image/jpeg"}""";
            }
            return """{"hasImage":false}""";
        }
        catch (Exception ex)
        {
            return $"[ERROR] {ex.Message}";
        }
    }

    [McpServerTool(Name = "UpdateContact")]
    [Description("Updates a contact record in Dataverse. Only callable by the contact form UI.")]
    [McpMeta("ui", JsonValue = """{"visibility":["app"]}""")]
    public static string UpdateContact(
        string id,
        string logicalName,
        IOrganizationService orgService,
        string? firstname = null,
        string? lastname = null,
        string? emailaddress1 = null,
        string? telephone1 = null,
        string? jobtitle = null)
    {
        try
        {
            var entity = new Entity(logicalName, Guid.Parse(id));

            if (firstname is not null) entity["firstname"] = firstname;
            if (lastname is not null) entity["lastname"] = lastname;
            if (emailaddress1 is not null) entity["emailaddress1"] = emailaddress1;
            if (telephone1 is not null) entity["telephone1"] = telephone1;
            if (jobtitle is not null) entity["jobtitle"] = jobtitle;

            orgService.Update(entity);

            return "Contact updated successfully.";
        }
        catch (Exception ex)
        {
            return $"[ERROR] {ex.Message}";
        }
    }
}
