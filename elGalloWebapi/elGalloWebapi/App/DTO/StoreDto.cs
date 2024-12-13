using elGalloWebapi.App.Etities;

namespace elGalloWebapi.DTO;

public class StoreDto
{
    public int StoreId { get; set; }
    public string StoreName { get; set; }
    public string Location { get; set; }
    public string Icon { get; set; }
    public string? UserId { get; set; }
    public virtual ICollection<ProductDto> Products { get; set; } = new List<ProductDto>();

    // Builder interno para construir StoreDto
    public class Builder
    {
        private readonly StoreDto _storeDto;

        public Builder()
        {
            _storeDto = new StoreDto();
        }

        public Builder SetStoreId(int storeId)
        {
            _storeDto.StoreId = storeId;
            return this;
        }

        public Builder SetStoreName(string storeName)
        {
            _storeDto.StoreName = storeName;
            return this;
        }

        public Builder SetLocation(string location)
        {
            _storeDto.Location = location;
            return this;
        }

        public Builder SetIcon(string icon)
        {
            _storeDto.Icon = icon;
            return this;
        }

        public Builder SetUserId(string? userId)
        {
            _storeDto.UserId = userId;
            return this;
        }

        public Builder SetProducts(ICollection<ProductDto> products)
        {
            _storeDto.Products = products.ToList();
            return this;
        }

        public StoreDto Build()
        {
            return _storeDto;
        }
    }

    public static StoreDto FromStore(Store store)
    {
        if (store == null)
        {
            throw new ArgumentNullException(nameof(store), "Store cannot be null.");
        }

        return new Builder()
            .SetStoreId(store.StoreId)
            .SetStoreName(store.StoreName)
            .SetLocation(store.Location)
            .SetIcon(store.Icon)
            .SetUserId(store.UserId)
            .Build();
    }
}
