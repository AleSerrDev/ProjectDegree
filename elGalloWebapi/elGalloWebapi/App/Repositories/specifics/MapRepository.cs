using elGalloWebapi.App.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace elGalloWebapi.App.Repositories.specifics;
using elGalloWebapi.App.Etities;

public class MapRepository: Repository<Map>
{
    public MapRepository(EcommerceContext context) : base(context) { }
    public async Task<Map?> GetMapByNameAsync(string mapName)
    {
        Console.WriteLine($"Receive REPOSITORY, MapName: {mapName}");
        return await _context.Set<Map>()
            .FirstOrDefaultAsync(map => map.MapName == mapName);
    }
    
    public async Task<Map?> DeleteMapByNameAsync(string mapName)
    {
        if (string.IsNullOrWhiteSpace(mapName))
        {
            throw new ArgumentException("Map name cannot be null or empty.", nameof(mapName));
        }

        var map = await _context.Set<Map>()
            .FirstOrDefaultAsync(map => map.MapName == mapName);

        if (map == null)
        {
            throw new EntityNotFoundException($"Map with name '{mapName}' not found.");
        }
        
        _context.Set<Map>().Remove(map);
        await _context.SaveChangesAsync();
        return map;
    }

}