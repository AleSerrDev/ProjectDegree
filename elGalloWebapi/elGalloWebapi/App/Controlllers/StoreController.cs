using elGalloWebapi.App.Etities;
using elGalloWebapi.App.Exceptions;
using elGalloWebapi.App.Services;
using Microsoft.AspNetCore.Mvc;

namespace elGalloWebapi.App.Controlllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StoreController : ControllerBase
    {
        private readonly StoreService _storeService;

        public StoreController(StoreService storeService)
        {
            _storeService = storeService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllStores()
        {
            var stores = await _storeService.GetStoresAsync();
            return Ok(stores);
        }
        
        [HttpGet("StoreMap")]
        public async Task<IActionResult> GetStoresMap()
        {
            var stores = await _storeService.GetStoresGeoJson();
            return Ok(stores);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetStoreById(int id)
        {
            try
            {
                var store = await _storeService.GetStoreByIdAsync(id);
                return Ok(store);
            }
            catch (EntityNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (ArgumentOutOfRangeException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred.", error = ex.Message });
            }
        }


        [HttpPost]
        public async Task<IActionResult> AddStore([FromBody] Store store)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var createdStore = await _storeService.AddStoreAsync(store);
            return CreatedAtAction(nameof(GetStoreById), new { id = createdStore.StoreId }, createdStore);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateStore(int id, [FromBody] Store store)
        {
            if (id != store.StoreId || !ModelState.IsValid)
                return BadRequest(ModelState);

            await _storeService.UpdateStoreAsync(store);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteStore(int id)
        {
            await _storeService.DeleteStoreAsync(id);
            return NoContent();
        }
    }

}
