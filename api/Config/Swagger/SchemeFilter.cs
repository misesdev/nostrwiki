using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using api.Models;

namespace api.Config.Swagger;

public class HidePropertiesSchemaFilter : ISchemaFilter
{
    public void Apply(OpenApiSchema schema, SchemaFilterContext context)
    {
        if (context.Type == typeof(SignUser))
        {
            schema.Properties.Remove("updatedAt");
        }
    }
}

