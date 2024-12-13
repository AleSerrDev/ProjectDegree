using elGalloWebapi.App.Etities;
using elGalloWebapi.App.Exceptions;
using elGalloWebapi.App.Repositories;
using Microsoft.EntityFrameworkCore;

namespace elGalloWebapi.App.Services
{
    public class ProductService
    {
        private readonly IRepository<Product> _productRepository;

        private const string PRODUCT_NOT_FOUND_MESSAGE = "Product not found.";
        private const string PRODUCT_REPOSITORY_CANNOT_BE_NULL = "Product repository cannot be null.";
        private const string ID_MUST_BE_GREATER_THAN_ZERO = "Id must be greater than zero.";
        private const string PRODUCT_CANNOT_BE_NULL = "Product cannot be null.";

        public ProductService(IRepository<Product> productRepository)
        {
            _productRepository = productRepository ?? throw new ArgumentNullException(nameof(productRepository), PRODUCT_REPOSITORY_CANNOT_BE_NULL);
        }

        public async Task<IEnumerable<Product>> GetProductsAsync()
        {
            var products =  await _productRepository
            .Query()
            .ToListAsync();
            if (!products.Any())
            {
                throw new EntityNotFoundException(PRODUCT_NOT_FOUND_MESSAGE);
            }
            return products;
        }

        public async Task<Product> GetProductByIdAsync(int id)
        {
            if (id <= 0)
            {
                throw new ArgumentOutOfRangeException(nameof(id), ID_MUST_BE_GREATER_THAN_ZERO);
            }

            var product = await _productRepository.GetByIdAsync(id);
            if (product == null)
            {
                throw new EntityNotFoundException(PRODUCT_NOT_FOUND_MESSAGE);
            }

            return product;
        }

        public async Task<Product> AddProductAsync(Product product)
        {
            if (product == null)
            {
                throw new ArgumentNullException(nameof(product), PRODUCT_CANNOT_BE_NULL);
            }

            return await _productRepository.AddAsync(product);
        }

        public async Task<Product> UpdateProductAsync(Product product)
        {
            if (product == null)
            {
                throw new ArgumentNullException(nameof(product), PRODUCT_CANNOT_BE_NULL);
            }

            var existingProduct = await _productRepository.GetByIdAsync(product.ProductId);
            if (existingProduct == null)
            {
                throw new EntityNotFoundException(PRODUCT_NOT_FOUND_MESSAGE);
            }

            return await _productRepository.UpdateAsync(product);
        }

        public async Task DeleteProductAsync(int id)
        {
            if (id <= 0)
            {
                throw new ArgumentOutOfRangeException(nameof(id), ID_MUST_BE_GREATER_THAN_ZERO);
            }

            var product = await _productRepository.GetByIdAsync(id);
            if (product == null)
            {
                throw new EntityNotFoundException(PRODUCT_NOT_FOUND_MESSAGE);
            }

            await _productRepository.DeleteAsync(id);
        }
    }

}
