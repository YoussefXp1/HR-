using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Linq;
using System.Threading.Tasks;
using WebApplication1.DTOs;
using WebApplication1.Models;
using WebApplication1.Data;
using WebApplication1.Services;

[Route("api/company")]
[ApiController]
public class CompanyController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly EmailService _emailService;

    public CompanyController(ApplicationDbContext context, IConfiguration configuration, EmailService emailService)
    {
        _context = context;
        _configuration = configuration;
        _emailService = emailService;
    }

    //Company Registration (HR is created automatically)
    [HttpPost("register")]
    public async Task<IActionResult> RegisterCompany([FromBody] CompanyRegisterDto request)
    {
        try
        {
            if (request == null)
                return BadRequest(new { message = "Invalid request data" });

            if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 8)
                return BadRequest(new { message = "Password must be at least 8 characters long" });

            bool companyExists = await _context.Companies.AnyAsync(c => c.BusinessEmail == request.BusinessEmail);
            if (companyExists)
                return Conflict(new { message = "A company with this email already exists." });

            string hashedPassword = HashPassword(request.Password);

            var company = new Company
            {
                CompanyName = request.CompanyName,
                BusinessEmail = request.BusinessEmail,
                CompanyAddress = request.CompanyAddress,
                NumberOfEmployees = request.NumberOfEmployees,
                CompanyIdentifier = Guid.NewGuid().ToString(),
            };

            await _context.Companies.AddAsync(company);
            await _context.SaveChangesAsync();

            var hr = new HR
            {
                Email = request.BusinessEmail,
                PasswordHash = hashedPassword,
                Role = "HR",
                CompanyId = company.Id,
                IsEmailVerified = false
            };

            await _context.HRs.AddAsync(hr);
            await _context.SaveChangesAsync();

            var token = Guid.NewGuid().ToString();
            var emailVerification = new EmailVerification
            {
                Email = request.BusinessEmail,
                Token = token,
                ExpiryDate = DateTime.UtcNow.AddHours(24)
            };
            await _context.EmailVerifications.AddAsync(emailVerification);
            await _context.SaveChangesAsync();

            var verificationLink = $"{_configuration["AppUrl"]}/api/company/verify-email?token={token}";

            try
            {
                await _emailService.SendVerificationEmail(request.BusinessEmail, token);
            }
            catch (Exception emailEx)
            {
                Console.WriteLine($"Failed to send email: {emailEx.Message}");
                Console.WriteLine(emailEx.StackTrace);
                return StatusCode(500, new
                {
                    message = "Company registered successfully, but failed to send verification email.",
                    companyId = company.Id,
                    hrId = hr.Id,
                    emailError = emailEx.Message
                });
            }

            return Ok(new
            {
                message = "Company registered successfully! Please verify your email.",
                companyId = company.Id,
                hrId = hr.Id
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($" Registration Error: {ex.Message}");
            return StatusCode(500, new
            {
                message = "Internal Server Error",
                error = ex.Message,
                stackTrace = ex.StackTrace
            });
        }
    }

    //Verify Email Endpoint
    [HttpGet("verify-email")]
public async Task<IActionResult> VerifyEmail(string token)
{
    Console.WriteLine($" Received token: {token}");

    if (string.IsNullOrEmpty(token))
    {
        Console.WriteLine("Token is missing.");
        return BadRequest(new { message = "Token is required." });
    }

    var emailVerification = await _context.EmailVerifications.FirstOrDefaultAsync(e => e.Token == token);
    if (emailVerification == null)
    {
        Console.WriteLine("Token not found.");
        return BadRequest(new { message = "Invalid or expired token." });
    }

    if (emailVerification.ExpiryDate < DateTime.UtcNow)
    {
        Console.WriteLine("Token has expired.");
        _context.EmailVerifications.Remove(emailVerification);
        await _context.SaveChangesAsync();
        return BadRequest(new { message = "Token has expired. Please request a new verification email." });
    }

    Console.WriteLine($" Token found for email: {emailVerification.Email}");

    var hr = await _context.HRs.FirstOrDefaultAsync(h => h.Email == emailVerification.Email);
    if (hr == null)
    {
        Console.WriteLine(" HR not found.");
        return NotFound(new { message = "HR not found." });
    }

    Console.WriteLine($" HR found: {hr.Email}, Current IsEmailVerified: {hr.IsEmailVerified}");

    //Update HR as verified
    hr.IsEmailVerified = true;
    _context.Entry(hr).State = EntityState.Modified;
    await _context.SaveChangesAsync();

    Console.WriteLine($" IsEmailVerified updated for {hr.Email}");

    //Remove the token after successful verification
    _context.EmailVerifications.Remove(emailVerification);
    await _context.SaveChangesAsync();
    Console.WriteLine(" Token removed from database.");

    return Redirect($"{_configuration["FrontendUrl"]}/email-verified");

}



    //Test Email Sending Endpoint**
    [HttpGet("test-email")]
    public async Task<IActionResult> TestEmail(string email)
    {
        try
        {
            string testToken = "test-verification-token";
            await _emailService.SendVerificationEmail(email, testToken);
            return Ok(new { message = "Test email sent successfully!" });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Email Sending Failed: {ex.Message}");
            return StatusCode(500, new { message = "Email sending failed", error = ex.Message });
        }
    }

    private string HashPassword(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password);
    }
}
