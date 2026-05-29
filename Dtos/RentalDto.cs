namespace Arkhaus.Dtos
{
    public class RentalDto
    {
        public int CustomerId { get; set; }
        public int? ComicId { get; set; }
        public int? BookId { get; set; }
        public DateTime EndDate { get; set; }
        public string Status { get; set; } = "active";
        public decimal Price { get; set; }
    }
}
