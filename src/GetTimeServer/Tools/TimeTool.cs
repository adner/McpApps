using ModelContextProtocol.Server;
using System.ComponentModel;

namespace GetTimeServer.Tools;

[McpServerToolType]
public class TimeTool
{
    [McpServerTool(Name = "GetTime"), Description("Gets the current date and time.")]
    [McpMeta("ui", JsonValue = """{"resourceUri":"ui://get-time/clock"}""")]
    public static string GetTime()
    {
        return DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss") + " UTC";
    }
}
