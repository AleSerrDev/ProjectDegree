namespace SerchMapServiceGatway.Controllers;

using Microsoft.EntityFrameworkCore;

public class GalloDbContext : DbContext
{
    public GalloDbContext(DbContextOptions<GalloDbContext> options) : base(options) { }

    // Tabla de API keys
    public DbSet<ApiKey> ApiKeys { get; set; }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        foreach (var entity in modelBuilder.Model.GetEntityTypes())
        {
            entity.SetTableName(entity.GetTableName().ToLowerInvariant());
            foreach (var property in entity.GetProperties())
            {
                property.SetColumnName(property.GetColumnName().ToLowerInvariant());
            }
        }

        base.OnModelCreating(modelBuilder);
    }

}

public class ApiKey
{
    public int ApiKeyId { get; set; }
    public Guid KeyValue { get; set; }
    public string UserId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
    public bool IsActive { get; set; }
}
