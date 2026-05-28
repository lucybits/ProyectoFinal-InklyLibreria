using Microsoft.EntityFrameworkCore;
using Arkhaus.Models;

namespace Arkhaus.Data
{
    public class ArkhausDbContext : DbContext
    {
        public ArkhausDbContext(DbContextOptions<ArkhausDbContext> options) : base(options)
        {
        }

        public DbSet<Customer> Customers { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Comic> Comics { get; set; }
        public DbSet<Book> Books { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderDetail> OrderDetails { get; set; }
        public DbSet<Rental> Rentals { get; set; }
    }
}