namespace elGalloWebapi.DTO
{
    public class ProductDto
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
        public string CategoryName { get; set; }
        public string ProductImage { get; set; }

        public class Builder
        {
            private readonly ProductDto _productDto;

            public Builder()
            {
                _productDto = new ProductDto();
            }

            public Builder SetProductId(int productId)
            {
                _productDto.ProductId = productId;
                return this;
            }

            public Builder SetProductName(string productName)
            {
                _productDto.ProductName = productName;
                return this;
            }

            public Builder SetDescription(string description)
            {
                _productDto.Description = description;
                return this;
            }

            public Builder SetPrice(decimal price)
            {
                _productDto.Price = price;
                return this;
            }

            public Builder SetCategoryName(string categoryName)
            {
                _productDto.CategoryName = categoryName;
                return this;
            }

            public Builder SetProductImage(string productImage)
            {
                _productDto.ProductImage = productImage;
                return this;
            }

            public ProductDto Build()
            {
                return _productDto;
            }
        }

        public static ProductDto FromProduct(App.Etities.Product product)
        {
            if (product == null)
            {
                throw new ArgumentNullException(nameof(product), "Product cannot be null.");
            }

            return new Builder()
                .SetProductId(product.ProductId)
                .SetProductName(product.ProductName)
                .SetDescription(product.Description)
                .SetPrice(product.Price)
                .SetProductImage(product.ProductImage)
                .Build();
        }
    }
}
