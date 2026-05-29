namespace Arkhaus.Dtos
{
    public class OrderDto
    {
        public int CustomerId { get; set; }
        public string Type { get; set; } = string.Empty;
        public string Status { get; set; } = "pending";
        public decimal Total { get; set; }
        public List<OrderDetailDto> OrderDetails { get; set; } = new();
    }

    public class OrderDetailDto
    {
        public int? ComicId { get; set; }
        public int? BookId { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
    }
}
