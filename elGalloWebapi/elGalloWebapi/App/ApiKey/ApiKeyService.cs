

namespace elGalloWebapi.App.ApiKey;

using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;


public class ApiKeyService
{
    private readonly EcommerceContext _dbContext;
    private readonly ILogger<ApiKeyService> _logger;

    public ApiKeyService(EcommerceContext dbContext, ILogger<ApiKeyService> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task<Etities.ApiKey> GenerateApiKeyAsync(string userId, TimeSpan expirationTime)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(userId))
            {
                throw new ArgumentException("User ID cannot be null or empty.", nameof(userId));
            }

            var apiKeyValue = Guid.NewGuid();

            var newApiKey = new Etities.ApiKey
            {
                KeyValue = apiKeyValue,
                UserId = userId,
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.Add(expirationTime),
                IsActive = true
            };

            _dbContext.ApiKeys.Add(newApiKey);
            await _dbContext.SaveChangesAsync();

            return newApiKey;
        }
        catch (DbUpdateException ex)
        {
            _logger.LogError(ex, "An error occurred while updating the database.");
            throw new Exception("An error occurred while creating the API key. Please try again later.", ex);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid argument provided: {Message}", ex.Message);
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unexpected error occurred.");
            throw new Exception("An unexpected error occurred while creating the API key. Please contact support.", ex);
        }
    }
}
