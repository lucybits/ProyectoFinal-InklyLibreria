using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Arkhaus.Data;
using Arkhaus.Dtos;
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
        public async Task<IActionResult> Create([FromBody] OrderDto request)
        {
            if (request.CustomerId <= 0)
                return BadRequest(new { message = "Cliente invalido para registrar la orden." });

            var customerExists = await _context.Customers.AnyAsync(c => c.Id == request.CustomerId);
            if (!customerExists)
                return BadRequest(new { message = "El cliente de la orden no existe." });

            if (request.OrderDetails.Count == 0)
                return BadRequest(new { message = "La orden debe incluir al menos un producto." });

            foreach (var detail in request.OrderDetails)
            {
                if (detail.Quantity <= 0)
                    return BadRequest(new { message = "La cantidad de cada producto debe ser mayor a cero." });

                var hasBook = detail.BookId.HasValue;
                var hasComic = detail.ComicId.HasValue;
                if (hasBook == hasComic)
                    return BadRequest(new { message = "Cada detalle debe ser libro o comic, no ambos." });

                if (hasBook && !await _context.Books.AnyAsync(b => b.Id == detail.BookId.GetValueOrDefault()))
                    return BadRequest(new { message = "Uno de los libros de la orden no existe." });

                if (hasComic && !await _context.Comics.AnyAsync(c => c.Id == detail.ComicId.GetValueOrDefault()))
                    return BadRequest(new { message = "Uno de los comics de la orden no existe." });
            }

            var order = new Order
            {
                CustomerId = request.CustomerId,
                Type = string.IsNullOrWhiteSpace(request.Type) ? "purchase" : request.Type,
                Status = string.IsNullOrWhiteSpace(request.Status) ? "pending" : request.Status,
                Total = request.Total,
                OrderDetails = request.OrderDetails.Select(detail => new OrderDetail
                {
                    BookId = detail.BookId,
                    ComicId = detail.ComicId,
                    Quantity = detail.Quantity,
                    UnitPrice = detail.UnitPrice
                }).ToList()
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();
            return Ok(new
            {
                order.Id,
                order.CustomerId,
                order.Type,
                order.Status,
                order.Total,
                order.OrderDate,
                Items = order.OrderDetails.Select(detail => new
                {
                    detail.Id,
                    detail.BookId,
                    detail.ComicId,
                    detail.Quantity,
                    detail.UnitPrice
                })
            });
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
