namespace elGalloWebapi.DTO;

public class CategoryDto
{
    public int CategoryId { get; set; }
    public string CategoryName { get; set; }
    public List<ProductDto> Products { get; set; } = new List<ProductDto>();
}
