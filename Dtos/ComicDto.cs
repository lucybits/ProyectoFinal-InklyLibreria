namespace Arkhaus.Dtos
{
    public class ComicDto
    {
        public string Title { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public decimal RentalPrice { get; set; }
        public int Stock { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public bool IsAvailableForRental { get; set; } = true;
        public int CategoryId { get; set; }
    }
}
