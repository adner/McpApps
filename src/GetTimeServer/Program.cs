using System.Text.Json.Nodes;
using GetTimeServer.Resources;
using GetTimeServer.Tools;
using Microsoft.PowerPlatform.Dataverse.Client;
using Microsoft.Xrm.Sdk;
using ModelContextProtocol.Protocol;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod()
              .WithExposedHeaders("Mcp-Session-Id");
    });
});

builder.Services.AddSingleton<IOrganizationService>(provider =>
{
    var connectionString = builder.Configuration.GetSection("Dataverse")["ConnectionString"]
        ?? throw new InvalidOperationException("Dataverse:ConnectionString not found in configuration.");
    return new ServiceClient(connectionString);
});

builder.Services.AddMcpServer(options =>
{
    options.Capabilities ??= new ServerCapabilities();
    options.Capabilities.Extensions = new JsonObject
    {
        ["io.modelcontextprotocol/ui"] = new JsonObject()
    };
})
.WithHttpTransport()
.WithTools<TimeTool>()
.WithTools<DataverseTool>()
.WithTools<ContactTool>()
.WithTools<OpportunityTool>()
.WithResources<ClockUiResource>()
.WithResources<ContactFormResource>()
.WithResources<ContactListResource>()
.WithResources<OpportunityFormResource>()
.WithResources<OpportunityListResource>()
.WithResources<OpportunityChartResource>()
.WithResources<OpportunityTopGraphResource>();

var app = builder.Build();

app.UseCors();

app.MapMcp();

app.Run();
