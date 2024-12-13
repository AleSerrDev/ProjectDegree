using elGalloWebapi.App.Etities;

namespace elGalloWebapi.App.Repositories.specifics
{
    public class CustomerRepository : Repository<Customer>
    {
        public CustomerRepository(EcommerceContext context) : base(context) { }
    }
}
