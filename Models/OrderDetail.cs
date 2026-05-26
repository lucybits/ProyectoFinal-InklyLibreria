namespace Arkhaus.Models
{
    public class OrderDetail
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public Order? Order { get; set; }
        public int? ComicId { get; set; }
        public Comic? Comic { get; set; }
        public int? BookId { get; set; }
        public Book? Book { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
    }
}