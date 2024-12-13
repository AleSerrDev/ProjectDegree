using elGalloWebapi;

namespace elGalloWebapi.App.ApiKey;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
public class ApiKeyMiddleware
{
    private readonly RequestDelegate _next;

    public ApiKeyMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, EcommerceContext dbContext)
    {
        try
        {
            var excludedPaths = new[]
            {
                "/api/ApiKey/generate",
                "/swagger",
                "/swagger/index.html",
                "/swagger/v1/swagger.json",
                "/openapi.json",
                "https://localhost:5001/"
            };

            if (excludedPaths.Any(path => context.Request.Path.StartsWithSegments(path)))
            {
                await _next(context);
                return;
            }

            if (excludedPaths.Any(path => context.Request.Path.StartsWithSegments(path)))
            {
                await _next(context);
                return;
            }

            // Validar si el encabezado x-api-key está presente
            if (!context.Request.Headers.TryGetValue("x-api-key", out var extractedApiKey))
            {
                context.Response.StatusCode = 401;
                await context.Response.WriteAsync("API Key was not provided.");
                return;
            }

            // Verificar si la API key es válida y está activa
            var apiKey = await dbContext.ApiKeys
                .FirstOrDefaultAsync(k => k.KeyValue.ToString() == extractedApiKey && k.IsActive && k.ExpiresAt > DateTime.UtcNow);

            if (apiKey == null)
            {
                context.Response.StatusCode = 401;
                await context.Response.WriteAsync("Unauthorized client.");
                return;
            }

            // Añadir el UserId al contexto si es necesario
            context.Items["UserId"] = apiKey.UserId;

            await _next(context);
        }
        catch (Exception ex)
        {
            context.Response.StatusCode = 500;
            await context.Response.WriteAsync($"An unexpected error occurred: {ex.Message}");
        }
    }
}
