
using elGalloWebapi.App.Etities;
using elGalloWebapi.App.Exceptions;
using elGalloWebapi.App.Repositories;
using elGalloWebapi.App.Repositories.specifics;

namespace elGalloWebapi.App.Services
{
    public class MapService
    {
        private readonly IRepository<Map> _mapRepository;

        private const string MAP_NOT_FOUND_MESSAGE = "Map not found.";
        private const string MAP_REPOSITORY_CANNOT_BE_NULL = "Map repository cannot be null.";
        private const string ID_MUST_BE_GREATER_THAN_ZERO = "Id must be greater than zero.";
        private const string MAP_CANNOT_BE_NULL = "Map cannot be null.";

        public MapService(IRepository<Map> mapRepository)
        {
            _mapRepository = mapRepository ?? throw new ArgumentNullException(nameof(mapRepository), MAP_REPOSITORY_CANNOT_BE_NULL);
        }

        public async Task<IEnumerable<Map>> GetMapsAsync()
        {
            var maps = await _mapRepository.GetAllAsync();
            if (!maps.Any())
            {
                throw new EntityNotFoundException(MAP_NOT_FOUND_MESSAGE);
            }
            return maps;
        }

        public async Task<Map> GetMapByIdAsync(int id)
        {
            if (id <= 0)
            {
                throw new ArgumentOutOfRangeException(nameof(id), ID_MUST_BE_GREATER_THAN_ZERO);
            }

            var map = await _mapRepository.GetByIdAsync(id);
            if (map == null)
            {
                throw new EntityNotFoundException(MAP_NOT_FOUND_MESSAGE);
            }

            return map;
        }

        public async Task<Map> AddMapAsync(Map map)
        {
            map.MapText = GeoJsonService.ConvertToGeoJson(map.MapText);
            
            if (map == null)
            {
                throw new ArgumentNullException(nameof(map), MAP_CANNOT_BE_NULL);
            }

            return await _mapRepository.AddAsync(map);
        }

        public async Task<Map> UpdateMapAsync(Map map)
        {
            map.MapText = GeoJsonService.ConvertToGeoJson(map.MapText);
            if (map == null)
            {
                throw new ArgumentNullException(nameof(map), MAP_CANNOT_BE_NULL);
            }

            var existingMap = await _mapRepository.GetByIdAsync(map.MapId);
            if (existingMap == null)
            {
                throw new EntityNotFoundException(MAP_NOT_FOUND_MESSAGE);
            }

            return await _mapRepository.UpdateAsync(map);
        }

        public async Task DeleteMapAsync(int id)
        {
            if (id <= 0)
            {
                throw new ArgumentOutOfRangeException(nameof(id), ID_MUST_BE_GREATER_THAN_ZERO);
            }

            var map = await _mapRepository.GetByIdAsync(id);
            if (map == null)
            {
                throw new EntityNotFoundException(MAP_NOT_FOUND_MESSAGE);
            }

            await _mapRepository.DeleteAsync(id);
        }
        
        public async Task<Map> GetMapByNameAsync(string mapName, string header)
        {
           
            var map = await ((MapRepository)_mapRepository).GetMapByNameAsync(mapName);
            
            map.MapText = GeoJsonService.Convert(map.MapText, header);
            if (map == null)
            {
                throw new EntityNotFoundException("Map with the specified name not found.");
            }

            return map;
        }

        
        public async Task<Map> DeleteMapByNameAsync(string mapName)
        {
            if (string.IsNullOrWhiteSpace(mapName))
            {
                throw new ArgumentException("Map name cannot be null or empty.", nameof(mapName));
            }

            var deletedMap = await ((MapRepository)_mapRepository).DeleteMapByNameAsync(mapName);

            if (deletedMap == null)
            {
                throw new EntityNotFoundException("Map with the specified name not found.");
            }

            return deletedMap;
        }

    }
}
