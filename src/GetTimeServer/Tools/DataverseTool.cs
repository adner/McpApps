using Microsoft.Crm.Sdk.Messages;
using Microsoft.PowerPlatform.Dataverse.Client;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using ModelContextProtocol.Server;
using System.ComponentModel;

namespace GetTimeServer.Tools;

[McpServerToolType]
public class DataverseTool
{
    [McpServerTool, Description("Executes a WhoAmI request against Dataverse and returns the result as a JSON string.")]
    public static string WhoAmI(IOrganizationService orgService)
    {
        try
        {
            var result = orgService.Execute(new WhoAmIRequest());
            return Newtonsoft.Json.JsonConvert.SerializeObject(result);
        }
        catch (Exception err)
        {
            Console.Error.WriteLine(err.ToString());
            return err.ToString();
        }
    }

    [McpServerTool, Description("Executes a FetchXML request using the supplied expression that needs to be a valid FetchXml expression. Returns the result as a compact JSON string with field schema names and their formatted values. If the request fails, the response will be prepended with [ERROR] and the error should be presented to the user.")]
    public static string ExecuteFetch(string fetchXmlRequest, IOrganizationService orgService)
    {
        try
        {
            var fetchExpression = new FetchExpression(fetchXmlRequest);
            var result = orgService.RetrieveMultiple(fetchExpression);
            var compact = FormatEntityCollection(result);
            return Newtonsoft.Json.JsonConvert.SerializeObject(compact);
        }
        catch (Exception err)
        {
            var errorString = "[ERROR] " + err.ToString();
            Console.Error.WriteLine(err.ToString());
            return errorString;
        }
    }

    private static object FormatEntityCollection(EntityCollection collection)
    {
        var records = collection.Entities.Select(entity =>
        {
            var record = new Dictionary<string, object?>
            {
                ["id"] = entity.Id.ToString(),
                ["logicalName"] = entity.LogicalName
            };

            foreach (var attr in entity.Attributes)
            {
                if (entity.FormattedValues.TryGetValue(attr.Key, out var formatted))
                {
                    record[attr.Key] = formatted;
                }
                else
                {
                    record[attr.Key] = UnwrapAttributeValue(attr.Value);
                }
            }

            return record;
        }).ToList();

        return new
        {
            entityName = collection.EntityName,
            records,
            count = collection.Entities.Count,
            moreRecords = collection.MoreRecords
        };
    }

    private static object? UnwrapAttributeValue(object? value) => value switch
    {
        OptionSetValue osv => osv.Value,
        Money money => money.Value,
        EntityReference er => er.Id.ToString(),
        AliasedValue av => UnwrapAttributeValue(av.Value),
        null => null,
        _ => value
    };
}
