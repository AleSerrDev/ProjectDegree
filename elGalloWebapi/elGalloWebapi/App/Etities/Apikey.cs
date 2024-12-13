namespace elGalloWebapi.App.Etities;

public class ApiKey
{
    public int ApiKeyId { get; set; }
    public Guid KeyValue { get; set; }
    public string UserId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
    public bool IsActive { get; set; }
}
