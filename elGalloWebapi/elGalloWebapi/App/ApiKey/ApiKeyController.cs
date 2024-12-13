namespace elGalloWebapi.App.ApiKey;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

[Route("api/[controller]")]
[ApiController]
public class ApiKeyController : ControllerBase
{
    private readonly ApiKeyService _apiKeyService;

    public ApiKeyController(ApiKeyService apiKeyService)
    {
        _apiKeyService = apiKeyService;
    }

    [HttpPost("generate")]
    public async Task<IActionResult> GenerateApiKey([FromBody] GenerateApiKeyRequest request)
    {
        if (request == null || string.IsNullOrEmpty(request.UserId))
        {
            return BadRequest("Invalid request");
        }

        var expirationTime = TimeSpan.FromDays(30);
        var apiKey = await _apiKeyService.GenerateApiKeyAsync(request.UserId, expirationTime);

        return Ok(new { apiKey.KeyValue, apiKey.ExpiresAt });
    }
}

public class GenerateApiKeyRequest
{
    public string UserId { get; set; }
}
