using elGalloWebapi.App.Etities;
using elGalloWebapi.App.Exceptions;
using elGalloWebapi.App.Repositories;

namespace elGalloWebapi.App.Services
{
    public class CategoryService
    {
        private readonly IRepository<Category> _categoryRepository;

        private const string CATEGORY_NOT_FOUND_MESSAGE = "Category not found.";
        private const string CATEGORY_REPOSITORY_CANNOT_BE_NULL = "Category repository cannot be null.";
        private const string ID_MUST_BE_GREATER_THAN_ZERO = "Id must be greater than zero.";
        private const string CATEGORY_CANNOT_BE_NULL = "Category cannot be null.";

        public CategoryService(IRepository<Category> categoryRepository)
        {
            _categoryRepository = categoryRepository ?? throw new ArgumentNullException(nameof(categoryRepository), CATEGORY_REPOSITORY_CANNOT_BE_NULL);
        }

        public async Task<IEnumerable<Category>> GetCategoriesAsync()
        {
            var categories = await _categoryRepository.GetAllAsync();
            if (!categories.Any())
            {
                throw new EntityNotFoundException(CATEGORY_NOT_FOUND_MESSAGE);
            }
            return categories;
        }

        public async Task<Category> GetCategoryByIdAsync(int id)
        {
            if (id <= 0)
            {
                throw new ArgumentOutOfRangeException(nameof(id), ID_MUST_BE_GREATER_THAN_ZERO);
            }

            var category = await _categoryRepository.GetByIdAsync(id);
            if (category == null)
            {
                throw new EntityNotFoundException(CATEGORY_NOT_FOUND_MESSAGE);
            }

            return category;
        }

        public async Task<Category> AddCategoryAsync(Category category)
        {
            if (category == null)
            {
                throw new ArgumentNullException(nameof(category), CATEGORY_CANNOT_BE_NULL);
            }

            return await _categoryRepository.AddAsync(category);
        }

        public async Task<Category> UpdateCategoryAsync(Category category)
        {
            if (category == null)
            {
                throw new ArgumentNullException(nameof(category), CATEGORY_CANNOT_BE_NULL);
            }

            var existingCategory = await _categoryRepository.GetByIdAsync(category.CategoryId);
            if (existingCategory == null)
            {
                throw new EntityNotFoundException(CATEGORY_NOT_FOUND_MESSAGE);
            }

            return await _categoryRepository.UpdateAsync(category);
        }

        public async Task DeleteCategoryAsync(int id)
        {
            if (id <= 0)
            {
                throw new ArgumentOutOfRangeException(nameof(id), ID_MUST_BE_GREATER_THAN_ZERO);
            }

            var category = await _categoryRepository.GetByIdAsync(id);
            if (category == null)
            {
                throw new EntityNotFoundException(CATEGORY_NOT_FOUND_MESSAGE);
            }

            await _categoryRepository.DeleteAsync(id);
        }
    }

}
