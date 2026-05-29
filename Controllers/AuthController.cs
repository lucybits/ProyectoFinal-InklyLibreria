using Microsoft.AspNetCore.Mvc;
using Arkhaus.Data;
using Arkhaus.Models;

namespace Arkhaus.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ArkhausDbContext _context;

        public AuthController(ArkhausDbContext context)
        {
            _context = context;
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            var customer = _context.Customers
                .FirstOrDefault(c => c.Email == request.Email && c.Password == request.Password);

            if (customer == null)
                return Unauthorized(new { message = "Correo o contraseña incorrectos" });

            if (customer.Email.Equals("admin@gmail.com", StringComparison.OrdinalIgnoreCase) && !customer.IsAdmin)
            {
                customer.IsAdmin = true;
                _context.SaveChanges();
            }

            return Ok(new
            {
                id = customer.Id,
                name = customer.Name,
                email = customer.Email,
                phone = customer.Phone,
                address = customer.Address,
                isAdmin = customer.IsAdmin || customer.Email.Equals("admin@gmail.com", StringComparison.OrdinalIgnoreCase)
            });
        }

        [HttpPost("register")]
        public IActionResult Register([FromBody] Customer customer)
        {
            var exists = _context.Customers.Any(c => c.Email == customer.Email);
            if (exists)
                return BadRequest(new { message = "El correo ya está registrado" });

            customer.IsAdmin = customer.Email.Equals("admin@gmail.com", StringComparison.OrdinalIgnoreCase);

            _context.Customers.Add(customer);
            _context.SaveChanges();

            return Ok(new { message = "Cliente registrado correctamente" });
        }
    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
