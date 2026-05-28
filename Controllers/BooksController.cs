using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Arkhaus.Data;
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
        public async Task<IActionResult> Create([FromBody] Book book)
        {
            _context.Books.Add(book);
            await _context.SaveChangesAsync();
            return Ok(book);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Book book)
        {
            var existing = await _context.Books.FindAsync(id);
            if (existing == null) return NotFound();
            existing.Title = book.Title;
            existing.Author = book.Author;
            existing.Description = book.Description;
            existing.Price = book.Price;
            existing.RentalPrice = book.RentalPrice;
            existing.Stock = book.Stock;
            existing.ImageUrl = book.ImageUrl;
            existing.IsAvailableForRental = book.IsAvailableForRental;
            existing.CategoryId = book.CategoryId;
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