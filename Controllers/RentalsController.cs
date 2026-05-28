using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Arkhaus.Data;
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
        public async Task<IActionResult> Create([FromBody] Rental rental)
        {
            _context.Rentals.Add(rental);
            await _context.SaveChangesAsync();
            return Ok(rental);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] Rental rental)
        {
            var existing = await _context.Rentals.FindAsync(id);
            if (existing == null) return NotFound();
            existing.Status = rental.Status;
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