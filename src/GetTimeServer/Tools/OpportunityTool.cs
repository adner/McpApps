using Microsoft.Xrm.Sdk;
using ModelContextProtocol.Server;
using System.ComponentModel;
using System.Globalization;

namespace GetTimeServer.Tools;

[McpServerToolType]
public class OpportunityTool
{
    [McpServerTool(Name = "ShowOpportunity")]
    [Description("Displays an interactive opportunity card for exactly ONE opportunity. Use only when ExecuteFetch returned a single opportunity record. Pass that record's fields as arguments. If ExecuteFetch returned multiple opportunities, use ShowManyOpportunities instead.")]
    [McpMeta("ui", JsonValue = """{"resourceUri":"ui://get-opportunity/form"}""")]
    public static string GetOpportunity(
        string id,
        string logicalName,
        string? name,
        string? customerid,
        string? estimatedvalue,
        string? statecode,
        string? estimatedclosedate,
        string? closeprobability)
    {
        return $"{name} - {customerid} ({estimatedvalue})";
    }

    [McpServerTool(Name = "ShowManyOpportunities")]
    [Description("Displays an opportunity list for multiple opportunities. Use when ExecuteFetch returned two or more opportunity records. Pass the full JSON array of opportunity objects from the ExecuteFetch result.")]
    [McpMeta("ui", JsonValue = """{"resourceUri":"ui://get-opportunity/list"}""")]
    public static string GetManyOpportunities(
        string logicalName,
        [Description("A JSON array of opportunity objects from ExecuteFetch. Each object should have id, name, customerid, estimatedvalue, statecode, estimatedclosedate, and closeprobability fields.")]
        string opportunitiesJson)
    {
        return $"Displaying opportunity list ({logicalName})";
    }

    [McpServerTool(Name = "ShowOpportunityPipeline")]
    [Description("Displays the opportunity pipeline — a bar chart of estimated values aggregated by month. Use when the user asks for a pipeline view, chart, visualization, or summary of opportunity values over time. Pass the full JSON array of opportunity objects from the ExecuteFetch result.")]
    [McpMeta("ui", JsonValue = """{"resourceUri":"ui://get-opportunity/chart"}""")]
    public static string GetOpportunityChart(
        string logicalName,
        [Description("A JSON array of opportunity objects from ExecuteFetch. Each object should have id, name, customerid, estimatedvalue, statecode, estimatedclosedate, and closeprobability fields.")]
        string opportunitiesJson)
    {
        return $"Displaying opportunity pipeline ({logicalName})";
    }

    [McpServerTool(Name = "ShowTopOpportunityGraph")]
    [Description("Displays a horizontal bar graph of the top opportunities ranked by estimated value. Use when the user asks for a top opportunities graph, ranking, or leaderboard. Pass the full JSON array of opportunity objects from the ExecuteFetch result.")]
    [McpMeta("ui", JsonValue = """{"resourceUri":"ui://get-opportunity/topgraph"}""")]
    public static string GetTopOpportunityGraph(
        string logicalName,
        [Description("A JSON array of opportunity objects from ExecuteFetch. Each object should have id, name, customerid, estimatedvalue, statecode, estimatedclosedate, and closeprobability fields.")]
        string opportunitiesJson)
    {
        return $"Displaying top opportunity graph ({logicalName})";
    }

    [McpServerTool(Name = "UpdateOpportunity")]
    [Description("Updates an opportunity record in Dataverse. Only callable by the opportunity form UI.")]
    [McpMeta("ui", JsonValue = """{"visibility":["app"]}""")]
    public static string UpdateOpportunity(
        string id,
        string logicalName,
        IOrganizationService orgService,
        string? name = null,
        string? estimatedvalue = null,
        string? estimatedclosedate = null,
        string? closeprobability = null)
    {
        try
        {
            var entity = new Entity(logicalName, Guid.Parse(id));

            if (name is not null) entity["name"] = name;
            if (estimatedvalue is not null) entity["estimatedvalue"] = new Money(decimal.Parse(estimatedvalue, NumberStyles.Any, CultureInfo.InvariantCulture));
            if (estimatedclosedate is not null) entity["estimatedclosedate"] = DateTime.Parse(estimatedclosedate);
            if (closeprobability is not null) entity["closeprobability"] = int.Parse(closeprobability);

            orgService.Update(entity);

            return "Opportunity updated successfully.";
        }
        catch (Exception ex)
        {
            return $"[ERROR] {ex.Message}";
        }
    }
}
