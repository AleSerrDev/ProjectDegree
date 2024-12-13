
using elGalloWebapi.App.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace elGalloWebapi.App.Repositories.specifics;
using elGalloWebapi.App.Etities;

    public class StoreRepository : Repository<Store>
    {
        public StoreRepository(EcommerceContext context) : base(context) { }
        
        public async Task<List<Product>> GetProductsAsync(int storeId)
        {
            ValidateId(storeId);

            var products = await _context.Products
                .Where(p => p.StoreId == storeId)
                .ToListAsync();

            if (products == null || !products.Any())
            {
                throw new EntityNotFoundException("No products found for the specified store.");
            }

            return products;
        }

    }

