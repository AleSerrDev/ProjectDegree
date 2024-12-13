using elGalloWebapi.App.Etities;
using elGalloWebapi.App.Exceptions;
using elGalloWebapi.App.Repositories;

namespace elGalloWebapi.App.Services
{
    public class CustomerService
    {
        private readonly IRepository<Customer> _customerRepository;

        private const string CUSTOMER_NOT_FOUND_MESSAGE = "Customer not found.";
        private const string CUSTOMER_REPOSITORY_CANNOT_BE_NULL = "Customer repository cannot be null.";
        private const string ID_MUST_BE_GREATER_THAN_ZERO = "Id must be greater than zero.";
        private const string CUSTOMER_CANNOT_BE_NULL = "Customer cannot be null.";

        public CustomerService(IRepository<Customer> customerRepository)
        {
            _customerRepository = customerRepository ?? throw new ArgumentNullException(nameof(customerRepository), CUSTOMER_REPOSITORY_CANNOT_BE_NULL);
        }

        public async Task<IEnumerable<Customer>> GetCustomersAsync()
        {
            var customers = await _customerRepository.GetAllAsync();
            if (!customers.Any())
            {
                throw new EntityNotFoundException(CUSTOMER_NOT_FOUND_MESSAGE);
            }
            return customers;
        }

        public async Task<Customer> GetCustomerByIdAsync(int id)
        {
            if (id <= 0)
            {
                throw new ArgumentOutOfRangeException(nameof(id), ID_MUST_BE_GREATER_THAN_ZERO);
            }

            var customer = await _customerRepository.GetByIdAsync(id);
            if (customer == null)
            {
                throw new EntityNotFoundException(CUSTOMER_NOT_FOUND_MESSAGE);
            }

            return customer;
        }

        public async Task<Customer> AddCustomerAsync(Customer customer)
        {
            if (customer == null)
            {
                throw new ArgumentNullException(nameof(customer), CUSTOMER_CANNOT_BE_NULL);
            }

            return await _customerRepository.AddAsync(customer);
        }

        public async Task<Customer> UpdateCustomerAsync(Customer customer)
        {
            if (customer == null)
            {
                throw new ArgumentNullException(nameof(customer), CUSTOMER_CANNOT_BE_NULL);
            }

            var existingCustomer = await _customerRepository.GetByIdAsync(customer.CustomerId);
            if (existingCustomer == null)
            {
                throw new EntityNotFoundException(CUSTOMER_NOT_FOUND_MESSAGE);
            }

            return await _customerRepository.UpdateAsync(customer);
        }

        public async Task DeleteCustomerAsync(int id)
        {
            if (id <= 0)
            {
                throw new ArgumentOutOfRangeException(nameof(id), ID_MUST_BE_GREATER_THAN_ZERO);
            }

            var customer = await _customerRepository.GetByIdAsync(id);
            if (customer == null)
            {
                throw new EntityNotFoundException(CUSTOMER_NOT_FOUND_MESSAGE);
            }

            await _customerRepository.DeleteAsync(id);
        }
    }

}
