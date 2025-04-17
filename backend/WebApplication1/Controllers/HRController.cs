using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Threading.Tasks;
using WebApplication1.Data;
using WebApplication1.DTOs;
using WebApplication1.Models;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

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
        
        if (hr == null || !VerifyPassword(request.Password, hr.PasswordHash))
        {
            return Unauthorized(new { message = "Invalid email or password." });
        }
        
        return Ok(new 
        { message = "Login Successful", 
        hrId = hr.Id,
        role ="HR",
        });
    }
    [Authorize(Roles = "HR")]
    [HttpGet("profile")]
    public async Task<IActionResult> GetHRProfile(int hrId, [FromHeader] string Authorization)
    {
        var identity = HttpContext.User.Identity as ClaimsIdentity;
        var email = identity?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if(string.IsNullOrEmpty(email))
            return Unauthorized(new{message = "Invaild token."});

        var hr = await _context.HRs.FirstOrDefaultAsync(h => h.Email == email);
        if (hr == null)
            return NotFound(new {message ="HR Not Found"});

        return Ok(new{
            hrId = hr.Id,
            fullName = hr.FullName,
            email = hr.Email,
            phoneNumber = hr.PhoneNumber,
            position = "HR Manager" // Static for now
        });
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
