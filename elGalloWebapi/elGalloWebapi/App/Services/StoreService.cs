using elGalloWebapi.App.Etities;
using elGalloWebapi.App.Exceptions;
using elGalloWebapi.App.Repositories;
using elGalloWebapi.App.Repositories.specifics;
using elGalloWebapi.DTO;
using Newtonsoft.Json;

namespace elGalloWebapi.App.Services
{
    public class StoreService
    {
        private readonly IRepository<Store> _storeRepository;
        private CategoryService _categoryService;
        private const string STORE_NOT_FOUND_MESSAGE = "Store not found.";
        private const string STORE_REPOSITORY_CANNOT_BE_NULL = "Store repository cannot be null.";
        private const string ID_MUST_BE_GREATER_THAN_ZERO = "Id must be greater than zero.";
        private const string STORE_CANNOT_BE_NULL = "Store cannot be null.";

        public StoreService(IRepository<Store> storeRepository, CategoryService categoryService)
        {
            _storeRepository = storeRepository ?? throw new ArgumentNullException(nameof(storeRepository), STORE_REPOSITORY_CANNOT_BE_NULL);
            _categoryService = categoryService;
        }

        public async Task<IEnumerable<Store>> GetStoresAsync()
        {
            var stores = await _storeRepository.GetAllAsync();
            if (!stores.Any())
            {
                throw new EntityNotFoundException(STORE_NOT_FOUND_MESSAGE);
            }
            return stores;
        }

        public async Task<StoreDto> GetStoreByIdAsync(int id)
        {
            if (id <= 0)
            {
                throw new ArgumentOutOfRangeException(nameof(id), ID_MUST_BE_GREATER_THAN_ZERO);
            }

            var store = await _storeRepository.GetByIdAsync(id);

            if (store == null)
            {
                throw new EntityNotFoundException(STORE_NOT_FOUND_MESSAGE);
            }
            
            var storeDto = StoreDto.FromStore(store);
            var products = await ((StoreRepository)_storeRepository).GetProductsAsync(id);
            var productDtos = new List<ProductDto>();
            
            foreach (var product in products)
            {
                var category = await _categoryService.GetCategoryByIdAsync(product.CategoryId);
                var productDto = new ProductDto.Builder()
                    .SetProductId(product.ProductId)
                    .SetProductName(product.ProductName)
                    .SetDescription(product.Description)
                    .SetPrice(product.Price)
                    .SetCategoryName(category?.CategoryName ?? "Unknown")
                    .SetProductImage(product.ProductImage ?? "")
                    .Build();

                productDtos.Add(productDto);
            }
            storeDto.Products = productDtos;

            return storeDto;
        }


        public async Task<Store> AddStoreAsync(Store store)
        {
            
            if (store == null)
            {
                throw new ArgumentNullException(nameof(store), STORE_CANNOT_BE_NULL);
            }

            return await _storeRepository.AddAsync(store);
        }

        public async Task<Store> UpdateStoreAsync(Store store)
        {
            store.Location = GeoJsonService.ConvertToGeoJson(store.Location);
            if (store == null)
            {
                throw new ArgumentNullException(nameof(store), STORE_CANNOT_BE_NULL);
            }

            var existingStore = await _storeRepository.GetByIdAsync(store.StoreId);
            if (existingStore == null)
            {
                throw new EntityNotFoundException(STORE_NOT_FOUND_MESSAGE);
            }

            return await _storeRepository.UpdateAsync(store);
        }

        public async Task DeleteStoreAsync(int id)
        {
            if (id <= 0)
            {
                throw new ArgumentOutOfRangeException(nameof(id), ID_MUST_BE_GREATER_THAN_ZERO);
            }

            var store = await _storeRepository.GetByIdAsync(id);
            if (store == null)
            {
                throw new EntityNotFoundException(STORE_NOT_FOUND_MESSAGE);
            }

            await _storeRepository.DeleteAsync(id);
        }
        
        
        
        private List<List<List<double>>> ParseCoordinates(string locationJson)
        {
            var location = JsonConvert.DeserializeObject<dynamic>(locationJson);
            return location.geometry.coordinates.ToObject<List<List<List<double>>>>();
        }

        private List<double> CalculatePolygonCenter(List<List<List<double>>> coordinates)
        {
            var polygon = coordinates.First();
            double longitudeSum = 0, latitudeSum = 0;
            int count = polygon.Count;

            for (int i = 0; i < count; i++)
            {
                longitudeSum += polygon[i][0];
                latitudeSum += polygon[i][1];
            }

            return new List<double> { longitudeSum / count, latitudeSum / count };
        }

        public async Task<GeoJsonFeatureCollection> GetStoresGeoJson()
        {
            var stores = await _storeRepository.GetAllAsync();

            if (!stores.Any())
                throw new InvalidOperationException("No stores found.");

            var featureCollection = new GeoJsonFeatureCollection();
    
            foreach (var store in stores)
            {
                var coordinates = ParseCoordinates(store.Location);
                var center = CalculatePolygonCenter(coordinates);

                var feature = new GeoJsonFeature
                {
                    Geometry = new GeoJsonGeometry { Coordinates = coordinates },
                    Properties = new GeoJsonProperties
                    {
                        Store = new StoreInfo
                        {
                            StoreId = store.StoreId,
                            StoreName = store.StoreName,
                            Icon = store.Icon,
                            UserId = store.UserId,
                            Center = center
                        }
                    }
                };

                featureCollection.Features.Add(feature);
            }

            return featureCollection;
        }

        
    }
}
