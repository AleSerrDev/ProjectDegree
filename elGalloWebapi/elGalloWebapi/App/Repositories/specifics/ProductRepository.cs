using elGalloWebapi.App.Etities;

namespace elGalloWebapi.App.Repositories.specifics
{
    public class ProductRepository : Repository<Product>
    {
        public ProductRepository(EcommerceContext context) : base(context) { }
    }

}
