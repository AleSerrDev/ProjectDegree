namespace SerchMapServiceGatway.Controllers;
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

    public async Task InvokeAsync(HttpContext context, GalloDbContext dbContext)
    {
        try
        {
            var excludedPaths = new[] { "/api/ApiKey/generate", "/swagger", "/swagger/index.html", "/swagger/v1/swagger.json" };

            if (excludedPaths.Any(path => context.Request.Path.StartsWithSegments(path)))
            {
                await _next(context);
                return;
            }

            if (!context.Request.Headers.TryGetValue("x-api-key", out var extractedApiKeyValues))
            {
                context.Response.StatusCode = 401;
                await context.Response.WriteAsync("API Key was not provided.");
                return;
            }
            
            var extractedApiKey = extractedApiKeyValues.ToString();
            var apiKey = await dbContext.ApiKeys
                .FirstOrDefaultAsync(k => k.KeyValue.ToString() == extractedApiKey && k.IsActive && k.ExpiresAt > DateTime.UtcNow);

            if (apiKey == null)
            {
                context.Response.StatusCode = 401;
                await context.Response.WriteAsync("Unauthorized client.");
                return;
            }

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

