using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Arkhaus.Data;
using Arkhaus.Models;

namespace Arkhaus.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ComicsController : ControllerBase
    {
        private readonly ArkhausDbContext _context;

        public ComicsController(ArkhausDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var comics = await _context.Comics.Include(c => c.Category).ToListAsync();
            return Ok(comics);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var comic = await _context.Comics.Include(c => c.Category).FirstOrDefaultAsync(c => c.Id == id);
            if (comic == null) return NotFound();
            return Ok(comic);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Comic comic)
        {
            _context.Comics.Add(comic);
            await _context.SaveChangesAsync();
            return Ok(comic);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Comic comic)
        {
            var existing = await _context.Comics.FindAsync(id);
            if (existing == null) return NotFound();
            existing.Title = comic.Title;
            existing.Author = comic.Author;
            existing.Description = comic.Description;
            existing.Price = comic.Price;
            existing.RentalPrice = comic.RentalPrice;
            existing.Stock = comic.Stock;
            existing.ImageUrl = comic.ImageUrl;
            existing.IsAvailableForRental = comic.IsAvailableForRental;
            existing.CategoryId = comic.CategoryId;
            await _context.SaveChangesAsync();
            return Ok(existing);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var comic = await _context.Comics.FindAsync(id);
            if (comic == null) return NotFound();
            _context.Comics.Remove(comic);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Cómic eliminado" });
        }
    }
}