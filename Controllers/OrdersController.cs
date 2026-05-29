using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Arkhaus.Data;
using Arkhaus.Models;

namespace Arkhaus.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly ArkhausDbContext _context;

        public OrdersController(ArkhausDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var orders = await _context.Orders
                .Include(o => o.Customer)
                .Include(o => o.OrderDetails)
                .ToListAsync();
            return Ok(orders);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var order = await _context.Orders
                .Include(o => o.Customer)
                .Include(o => o.OrderDetails)
                .FirstOrDefaultAsync(o => o.Id == id);
            if (order == null) return NotFound();
            return Ok(order);
        }

        [HttpGet("customer/{customerId}")]
        public async Task<IActionResult> GetByCustomer(int customerId)
        {
            var orders = await _context.Orders
                .Include(o => o.OrderDetails)
                .Where(o => o.CustomerId == customerId)
                .ToListAsync();
            return Ok(orders);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Order order)
        {
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();
            return Ok(order);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] Order order)
        {
            var existing = await _context.Orders.FindAsync(id);
            if (existing == null) return NotFound();
            existing.Status = order.Status;
            await _context.SaveChangesAsync();
            return Ok(existing);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null) return NotFound();
            _context.Orders.Remove(order);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Orden eliminada" });
        }
    }
}