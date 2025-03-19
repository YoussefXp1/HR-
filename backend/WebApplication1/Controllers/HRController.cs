using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using WebApplication1.Data;
using WebApplication1.DTOs;
using WebApplication1.Models;

[Route("api/hr")]
[ApiController]
public class HRController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public HRController(ApplicationDbContext context)
    {
        _context = context;
    }

    //Remove HR Registration Logic (HR is created in CompanyController)

    //HR Login
    [HttpPost("login")]
    public async Task<IActionResult> LoginHr([FromBody] HRLoginDto request)
    {
        var hr = await _context.HRs.FirstOrDefaultAsync(e => e.Email == request.Email);
        
        if (hr == null)
        {
            Console.WriteLine($"HR not found with email: {request.Email}");
            return Unauthorized(new { message = "Invalid email or password." });
        }

        Console.WriteLine($"Stored Hash in DB: {hr.PasswordHash}");
        Console.WriteLine($"Entered Password: {request.Password}");

        if (!VerifyPassword(request.Password, hr.PasswordHash))
        {
            Console.WriteLine("Password verification failed.");
            return Unauthorized(new { message = "Invalid email or password." });
        }

        return Ok(new { message = "Login Successful", hrId = hr.Id });
    }

    //HR Updates Their Profile
    [HttpPut("update-profile/{hrId}")]
    public async Task<IActionResult> UpdateHRProfile(int hrId, [FromBody] HRUpdateDto request)
    {
        var hr = await _context.HRs.FindAsync(hrId);
        if (hr == null)
            return NotFound(new { message = "HR not found!" });

        hr.FullName = request.FullName;
        hr.PhoneNumber = request.PhoneNumber;

        await _context.SaveChangesAsync();
        return Ok(new { message = "Profile updated successfully!" });
    }

    //Keep only VerifyPassword method
    private bool VerifyPassword(string enteredPassword, string storedHash)
    {
        return BCrypt.Net.BCrypt.Verify(enteredPassword, storedHash);
    }
}
