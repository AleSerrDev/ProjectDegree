
using elGalloWebapi.App.Services;
using Microsoft.AspNetCore.Mvc;
using System.Text;
using elGalloWebapi.App.Etities;
using elGalloWebapi.App.Exceptions;

namespace elGalloWebapi.App.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MapController : ControllerBase
    {
        private readonly MapService _mapService;

        public MapController(MapService mapService)
        {
            _mapService = mapService ?? throw new ArgumentNullException(nameof(mapService), "Map service cannot be null.");
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Map>>> GetMaps()
        {
            try
            {
                var maps = await _mapService.GetMapsAsync();
                return Ok(maps);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<Map>> GetMapById(int id)
        {
            try
            {
                var map = await _mapService.GetMapByIdAsync(id);
                return Ok(map);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("SkeletonStores")]
        public async Task<ActionResult<Map>> AddSkeletonStoresMap([FromForm] string? heatherMap, [FromForm] string? accessTokenMap, IFormFile mapFile)
        {
            try
            {
                if (mapFile == null || mapFile.Length == 0)
                {
                    return BadRequest("Map file is required.");
                }

                string mapText;
                using (var stream = new StreamReader(mapFile.OpenReadStream()))
                {
                    mapText = await stream.ReadToEndAsync();
                }

                var map = new Map
                {
                    MapName = "SKStores",
                    HeatherMap = heatherMap,
                    MapText = mapText,
                    AccessTokenMap = accessTokenMap
                };

                var addedMap = await _mapService.AddMapAsync(map);
                return CreatedAtAction(nameof(GetMapById), new { id = addedMap.MapId }, addedMap);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        
        [HttpPost("SkeletonStreats")]
        public async Task<ActionResult<Map>> AddSkeletonStreatsMap([FromForm] string? heatherMap, [FromForm] string? accessTokenMap, IFormFile mapFile)
        {
            try
            {
                if (mapFile == null || mapFile.Length == 0)
                {
                    return BadRequest("Map file is required.");
                }

                string mapText;
                using (var stream = new StreamReader(mapFile.OpenReadStream()))
                {
                    mapText = await stream.ReadToEndAsync();
                }

                var map = new Map
                {
                    MapName = "SKStreats",
                    HeatherMap = heatherMap,
                    MapText = mapText,
                    AccessTokenMap = accessTokenMap
                };

                var addedMap = await _mapService.AddMapAsync(map);
                return CreatedAtAction(nameof(GetMapById), new { id = addedMap.MapId }, addedMap);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        
        [HttpPost]
        public async Task<ActionResult<Map>> AddMap([FromForm] string mapName, [FromForm] string? heatherMap, [FromForm] string? accessTokenMap, IFormFile mapFile)
        {
            try
            {
                if (mapFile == null || mapFile.Length == 0)
                {
                    return BadRequest("Map file is required.");
                }

                string mapText;
                using (var stream = new StreamReader(mapFile.OpenReadStream()))
                {
                    mapText = await stream.ReadToEndAsync();
                }

                var map = new Map
                {
                    MapName = mapName,
                    HeatherMap = heatherMap,
                    MapText = mapText,
                    AccessTokenMap = accessTokenMap
                };

                var addedMap = await _mapService.AddMapAsync(map);
                return CreatedAtAction(nameof(GetMapById), new { id = addedMap.MapId }, addedMap);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id:int}")]
        public async Task<ActionResult<Map>> UpdateMap(int id, [FromForm] string mapName, [FromForm] string? heatherMap, [FromForm] IFormFile? mapFile, [FromForm] string? accessTokenMap)
        {
            try
            {
              
                var existingMap = await _mapService.GetMapByIdAsync(id);
                if (existingMap == null)
                {
                    return NotFound("Map not found.");
                }

                existingMap.MapName = mapName;
                existingMap.HeatherMap = heatherMap;
                existingMap.AccessTokenMap = accessTokenMap;

                if (mapFile != null && mapFile.Length > 0)
                {
                    using (var stream = new StreamReader(mapFile.OpenReadStream()))
                    {
                        existingMap.MapText = await stream.ReadToEndAsync();
                    }
                }

                var updatedMap = await _mapService.UpdateMapAsync(existingMap);
                return Ok(updatedMap);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteMap(int id)
        {
            try
            {
                await _mapService.DeleteMapAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        
        [HttpGet("name/{mapName}")]
        public async Task<ActionResult<Map>> GetMapByName(string mapName)
        {
            try
            {
               
                if (!Request.Headers.ContainsKey("Accept"))
                {
                    return BadRequest("The 'Accept' header is missing.");
                }

                string header2 = Request.Headers["Accept"];

                
                Console.WriteLine($"Received 'Accept' header: {header2}, MapName: {mapName}");

                var result = await _mapService.GetMapByNameAsync(mapName, header2);

                return Ok(result);
            }
            catch (EntityNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }


        
        [HttpDelete("name/{mapName}")]
        public async Task<IActionResult> DeleteMap(string mapName)
        {
            try
            {
                var deletedMap = await _mapService.DeleteMapByNameAsync(mapName);
                return Ok(new { message = "Map deleted successfully.", map = deletedMap });
            }
            catch (EntityNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred.", error = ex.Message });
            }
        }

    }
}
