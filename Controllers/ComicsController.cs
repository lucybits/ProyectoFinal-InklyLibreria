using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Arkhaus.Data;
using Arkhaus.Dtos;
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
        public async Task<IActionResult> Create([FromBody] ComicDto request)
        {
            var comic = new Comic
            {
                Title = request.Title,
                Author = request.Author,
                Description = request.Description,
                Price = request.Price,
                RentalPrice = request.RentalPrice,
                Stock = request.Stock,
                ImageUrl = request.ImageUrl,
                IsAvailableForRental = request.IsAvailableForRental,
                CategoryId = request.CategoryId
            };

            _context.Comics.Add(comic);
            await _context.SaveChangesAsync();
            return Ok(comic);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] ComicDto request)
        {
            var existing = await _context.Comics.FindAsync(id);
            if (existing == null) return NotFound();
            existing.Title = request.Title;
            existing.Author = request.Author;
            existing.Description = request.Description;
            existing.Price = request.Price;
            existing.RentalPrice = request.RentalPrice;
            existing.Stock = request.Stock;
            existing.ImageUrl = request.ImageUrl;
            existing.IsAvailableForRental = request.IsAvailableForRental;
            existing.CategoryId = request.CategoryId;
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
