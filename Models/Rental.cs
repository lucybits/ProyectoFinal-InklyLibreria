namespace Arkhaus.Models
{
    public class Rental
    {
        public int Id { get; set; }
        public int CustomerId { get; set; }
        public Customer? Customer { get; set; }
        public int? ComicId { get; set; }
        public Comic? Comic { get; set; }
        public int? BookId { get; set; }
        public Book? Book { get; set; }
        public DateTime StartDate { get; set; } = DateTime.Now;
        public DateTime EndDate { get; set; }
        public string Status { get; set; } = "active";
        public decimal Price { get; set; }
    }
}