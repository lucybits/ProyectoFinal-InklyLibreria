using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Arkhaus.Data;
using Arkhaus.Dtos;
using Arkhaus.Models;

namespace Arkhaus.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RentalsController : ControllerBase
    {
        private readonly ArkhausDbContext _context;

        public RentalsController(ArkhausDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var rentals = await _context.Rentals
                .Include(r => r.Customer)
                .Include(r => r.Comic)
                .Include(r => r.Book)
                .ToListAsync();
            return Ok(rentals);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var rental = await _context.Rentals
                .Include(r => r.Customer)
                .Include(r => r.Comic)
                .Include(r => r.Book)
                .FirstOrDefaultAsync(r => r.Id == id);
            if (rental == null) return NotFound();
            return Ok(rental);
        }

        [HttpGet("customer/{customerId}")]
        public async Task<IActionResult> GetByCustomer(int customerId)
        {
            var rentals = await _context.Rentals
                .Include(r => r.Comic)
                .Include(r => r.Book)
                .Where(r => r.CustomerId == customerId)
                .ToListAsync();
            return Ok(rentals);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] RentalDto request)
        {
            if (request.CustomerId <= 0)
                return BadRequest(new { message = "Cliente invalido para registrar la renta." });

            var customerExists = await _context.Customers.AnyAsync(c => c.Id == request.CustomerId);
            if (!customerExists)
                return BadRequest(new { message = "El cliente de la renta no existe." });

            var hasBook = request.BookId.HasValue;
            var hasComic = request.ComicId.HasValue;
            if (hasBook == hasComic)
                return BadRequest(new { message = "La renta debe ser de un libro o un comic, no ambos." });

            if (hasBook && !await _context.Books.AnyAsync(b => b.Id == request.BookId.GetValueOrDefault()))
                return BadRequest(new { message = "El libro de la renta no existe." });

            if (hasComic && !await _context.Comics.AnyAsync(c => c.Id == request.ComicId.GetValueOrDefault()))
                return BadRequest(new { message = "El comic de la renta no existe." });

            var rental = new Rental
            {
                CustomerId = request.CustomerId,
                BookId = request.BookId,
                ComicId = request.ComicId,
                EndDate = request.EndDate,
                Status = string.IsNullOrWhiteSpace(request.Status) ? "active" : request.Status,
                Price = request.Price
            };

            _context.Rentals.Add(rental);
            await _context.SaveChangesAsync();
            return Ok(new
            {
                rental.Id,
                rental.CustomerId,
                rental.BookId,
                rental.ComicId,
                rental.StartDate,
                rental.EndDate,
                rental.Status,
                rental.Price
            });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] RentalDto request)
        {
            var existing = await _context.Rentals.FindAsync(id);
            if (existing == null) return NotFound();
            existing.Status = request.Status;
            await _context.SaveChangesAsync();
            return Ok(existing);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var rental = await _context.Rentals.FindAsync(id);
            if (rental == null) return NotFound();
            _context.Rentals.Remove(rental);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Renta eliminada" });
        }
    }
}
