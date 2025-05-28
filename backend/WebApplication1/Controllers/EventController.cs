using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Threading.Tasks;
using WebApplication1.Data;
using WebApplication1.DTOs;
using WebApplication1.Models;
using System.Security.Claims;
using WebApplication1.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;


[ApiController]
[Route("api/[controller]")]
public class EventController : ControllerBase
{
    private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _environment;


    public EventController(ApplicationDbContext context, IWebHostEnvironment environment)
    {
        _environment = environment;
        _context = context;
    }

    [Authorize(Roles = "HR")]
    [HttpPost("post")]
    public async Task<IActionResult> PostEvent([FromForm] EventDto dto)
    {
    if (dto.Image == null || dto.Image.Length == 0)
        return BadRequest("Image is required.");

    try {
    var rootPath = _environment.WebRootPath ?? Path.Combine(_environment.ContentRootPath, "wwwroot");
    var uploadsFolder = Path.Combine(rootPath, "event-images");
    Directory.CreateDirectory(uploadsFolder);

    var fileName = Guid.NewGuid().ToString() + Path.GetExtension(dto.Image.FileName);
    var filePath = Path.Combine(uploadsFolder, fileName);

    using (var stream = new FileStream(filePath, FileMode.Create))
    {
        await dto.Image.CopyToAsync(stream);
    }

    var imageUrl = $"/event-images/{fileName}";
    
    var newEvent = new CompanyEvent
    {
        Title = dto.Title,
        Date = dto.Date,
        Time = dto.Time,
        Location = dto.Location,
        Description = dto.Description,
        Tags = dto.Tags != null ? string.Join(",", dto.Tags.Split(',').Select(t => t.Trim())) : "",
        Category = dto.Category,
        ImageUrl = imageUrl,
        CompanyId = GetCompanyIdFromToken() // Assume you extract this from the JWT
    };

    _context.Events.Add(newEvent);
    await _context.SaveChangesAsync();

    return Ok(new { message = "Event posted successfully." });
    }
    catch (Exception ex)
    {
        return StatusCode(500, $"Internal server error : {ex.Message}");
    }
    }


    [Authorize(Roles = "Employee")]
    [HttpGet("my-events")]
    public async Task<IActionResult> GetEmployeeEvents()
    {
        var companyId = int.Parse(User.FindFirst("companyId").Value);

        
        var timeZone = TimeZoneInfo.FindSystemTimeZoneById("Asia/Riyadh"); // Windows ID for Asia/Riyadh
        var currentDateTimeRiyadh = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, timeZone);
        var todayRiyadh = currentDateTimeRiyadh.Date; // Only date part


        var events = await _context.Events
        .Where(e => e.CompanyId == companyId)
        .ToListAsync();
        
        var upcomingEvents = events
            .Where(e => DateTime.TryParse(e.Date, out DateTime eventDate) && eventDate.Date >= todayRiyadh)
            .ToList();

        return Ok(upcomingEvents);
    }
    
    private int GetCompanyIdFromToken()
    {
    var companyIdClaim = User.Claims.FirstOrDefault(c => c.Type == "companyId");
    if (companyIdClaim == null || !int.TryParse(companyIdClaim.Value, out int companyId))
    {
        throw new UnauthorizedAccessException("Company ID not found in token.");
    }

    return companyId;
    }

}
