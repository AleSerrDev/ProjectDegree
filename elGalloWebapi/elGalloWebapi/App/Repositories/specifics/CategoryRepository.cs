using elGalloWebapi.App.Etities;

namespace elGalloWebapi.App.Repositories.specifics
{
    public class CategoryRepository : Repository<Category>
    {
        public CategoryRepository(EcommerceContext context) : base(context) { }
    }

}
