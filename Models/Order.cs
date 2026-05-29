namespace Arkhaus.Models
{
    public class Order
    {
        public int Id { get; set; }
        public int CustomerId { get; set; }
        public Customer? Customer { get; set; }
        public DateTime OrderDate { get; set; } = DateTime.Now;
        public string Type { get; set; } = string.Empty; // "purchase" o "rental"
        public string Status { get; set; } = "pending";
        public decimal Total { get; set; }
        public List<OrderDetail> OrderDetails { get; set; } = new();
    }
}