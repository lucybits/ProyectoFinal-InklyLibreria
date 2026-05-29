using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Arkhaus.Data;
using Arkhaus.Dtos;
using Arkhaus.Models;

namespace Arkhaus.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BooksController : ControllerBase
    {
        private readonly ArkhausDbContext _context;

        public BooksController(ArkhausDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var books = await _context.Books.Include(b => b.Category).ToListAsync();
            return Ok(books);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var book = await _context.Books.Include(b => b.Category).FirstOrDefaultAsync(b => b.Id == id);
            if (book == null) return NotFound();
            return Ok(book);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] BookDto request)
        {
            var book = new Book
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

            _context.Books.Add(book);
            await _context.SaveChangesAsync();
            return Ok(book);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] BookDto request)
        {
            var existing = await _context.Books.FindAsync(id);
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
            var book = await _context.Books.FindAsync(id);
            if (book == null) return NotFound();
            _context.Books.Remove(book);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Libro eliminado" });
        }
    }
}
