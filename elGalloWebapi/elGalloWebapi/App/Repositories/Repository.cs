using elGalloWebapi.App.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace elGalloWebapi.App.Repositories
{
    public class Repository<T> : IRepository<T> where T : class
    {
        protected readonly EcommerceContext _context;
        private const string ENTITY_NOT_FOUND_MESSAGE = "The entity with the given id was not found.";
        private const string CONTEXT_CANNOT_BE_NULL = "Context cannot be null.";
        private const string ID_MUST_BE_GREATER_THAN_ZERO = "Id must be greater than zero.";
        private const string ENTITY_CANNOT_BE_NULL = "Entity cannot be null.";

        public Repository(EcommerceContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context), CONTEXT_CANNOT_BE_NULL);
        }

    
        private void ValidateEntity(object entity, string errorMessage = ENTITY_CANNOT_BE_NULL)
        {
            if (entity == null)
            {
                throw new ArgumentNullException(nameof(entity), errorMessage);
            }
        }

        public void ValidateId(int id)
        {
            if (id <= 0)
            {
                throw new ArgumentOutOfRangeException(nameof(id), ID_MUST_BE_GREATER_THAN_ZERO);
            }
        }

        private async Task<T> FindEntityByIdAsync(int id)
        {
            var entity = await _context.Set<T>().FindAsync(id);
            if (entity == null)
            {
                throw new EntityNotFoundException(ENTITY_NOT_FOUND_MESSAGE);
            }
            return entity;
        }

        public async Task<IEnumerable<T>> GetAllAsync()
        {
            var entities = await _context.Set<T>().ToListAsync();
            if (entities == null || !entities.Any())
            {
                throw new EntityNotFoundException(ENTITY_NOT_FOUND_MESSAGE);
            }
            return entities;
        }

        public async Task<T> GetByIdAsync(int id)
        {
            ValidateId(id);
            return await FindEntityByIdAsync(id);
        }

        public async Task<T> AddAsync(T entity)
        {
            ValidateEntity(entity);
            await _context.Set<T>().AddAsync(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public async Task<T> UpdateAsync(T entity)
        {
            ValidateEntity(entity);
            _context.Set<T>().Update(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public async Task DeleteAsync(int id)
        {
            var entity = await GetByIdAsync(id);
            _context.Set<T>().Remove(entity);
            await _context.SaveChangesAsync();
        }

        public IQueryable<T> Query()
        {
            return _context.Set<T>().AsQueryable();
        }
    }
}
