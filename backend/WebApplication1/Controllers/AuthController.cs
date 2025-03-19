using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using WebApplication1.Data;
using WebApplication1.Models;
using WebApplication1.DTOs;
using System.Net.Mail;
using System.Net;

namespace WebApplication1.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        //LOGIN API (Now checks email verification for HR)
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDTO loginDTO)
        {
            if (string.IsNullOrEmpty(loginDTO.Identifier) || string.IsNullOrEmpty(loginDTO.Password))
                return BadRequest(new { message = "Invalid credentials." });

            // Check if the user is an HR
            var hr = await _context.HRs.FirstOrDefaultAsync(h => h.Email == loginDTO.Identifier);
            if (hr != null)
            {
                if (!BCrypt.Net.BCrypt.Verify(loginDTO.Password, hr.PasswordHash))
                    return Unauthorized(new { message = "Invalid password." });

                //CHECK IF EMAIL IS VERIFIED
                if (!hr.IsEmailVerified)
                    return Unauthorized(new { message = "Email not verified. Please verify your email first." });

                var token = GenerateJwtToken(hr.Email, "HR");
                return Ok(new { Token = token, Role = "HR" });
            }

            // Check if the user is an Employee
            var employee = await _context.Employees.FirstOrDefaultAsync(e => e.EmployeeIdentifier == loginDTO.Identifier);
            if (employee != null)
            {
                if (!BCrypt.Net.BCrypt.Verify(loginDTO.Password, employee.PasswordHash))
                    return Unauthorized(new { message = "Invalid password." });

                var token = GenerateJwtToken(employee.EmployeeIdentifier, "Employee");
                return Ok(new { Token = token, Role = "Employee" });
            }

            return Unauthorized(new { message = "User not found." });
        }

        //FORGOT PASSWORD API
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDTO forgotPasswordDTO)
        {
            if (string.IsNullOrWhiteSpace(forgotPasswordDTO.Identifier))
                return BadRequest(new { message = "Identifier is required." });

            // Check if the identifier belongs to an HR (by email)
            var hr = await _context.HRs.FirstOrDefaultAsync(h => h.Email == forgotPasswordDTO.Identifier);
            if (hr != null)
            {
                string resetToken = GenerateResetToken(hr.Email);
                await SendPasswordResetEmail(hr.Email, resetToken);
                return Ok(new { message = "Password reset email sent successfully." });
            }

            // Check if the identifier belongs to an Employee (by Employee ID)
            var employee = await _context.Employees.FirstOrDefaultAsync(e => e.EmployeeIdentifier == forgotPasswordDTO.Identifier);
            if (employee != null)
            {
                string resetToken = GenerateResetToken(employee.EmployeeIdentifier);
                await SendPasswordResetEmail(employee.Email, resetToken);
                return Ok(new { message = "Password reset email sent successfully." });
            }

            return NotFound(new { message = "User not found." });
        }

        //RESEND VERIFICATION EMAIL API
        [HttpPost("resend-verification")]
        public async Task<IActionResult> ResendVerificationEmail([FromBody] ResendEmailDTO request)
        {
            var hr = await _context.HRs.FirstOrDefaultAsync(h => h.Email == request.Email);
            if (hr == null)
                return NotFound(new { message = "No account found with this email." });

            if (hr.IsEmailVerified)
                return BadRequest(new { message = "Email is already verified." });

            var token = Guid.NewGuid().ToString();
            var emailVerification = new EmailVerification
            {
                Email = hr.Email,
                Token = token,
                ExpiryDate = DateTime.UtcNow.AddHours(24)
            };

            await _context.EmailVerifications.AddAsync(emailVerification);
            await _context.SaveChangesAsync();

            await SendVerificationEmail(hr.Email, token);

            return Ok(new { message = "Verification email sent again. Please check your inbox." });
        }

        //Generates JWT Token
        private string GenerateJwtToken(string identifier, string role)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, identifier),
                new Claim(ClaimTypes.Role, role)
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(2),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        //Generates a Reset Token
        private string GenerateResetToken(string identifier)
        {
            return Convert.ToBase64String(Encoding.UTF8.GetBytes($"{identifier}-{DateTime.UtcNow.Ticks}"));
        }

        //Sends Password Reset Email
        private async Task SendPasswordResetEmail(string email, string resetToken)
        {
            string resetLink = $"{_configuration["AppUrl"]}/reset-password?token={resetToken}";

            using (var client = new SmtpClient("smtp.gmail.com", 587))
            {
                client.Credentials = new NetworkCredential(_configuration["Gmail:Email"], _configuration["Gmail:AppPassword"]);
                client.EnableSsl = true;

                var mailMessage = new MailMessage
                {
                    From = new MailAddress(_configuration["Gmail:Email"]),
                    Subject = "Password Reset Request",
                    Body = $"<p>Click <a href='{resetLink}'>here</a> to reset your password.</p>",
                    IsBodyHtml = true
                };
                mailMessage.To.Add(email);

                await client.SendMailAsync(mailMessage);
            }
        }

        //Sends Verification Email
        private async Task SendVerificationEmail(string email, string token)
        {
            string verificationLink = $"{_configuration["AppUrl"]}/api/company/verify-email?token={token}";

            using (var client = new SmtpClient("smtp.gmail.com", 587))
            {
                client.Credentials = new NetworkCredential(_configuration["Gmail:Email"], _configuration["Gmail:AppPassword"]);
                client.EnableSsl = true;

                var mailMessage = new MailMessage
                {
                    From = new MailAddress(_configuration["Gmail:Email"]),
                    Subject = "Verify Your Email",
                    Body = $"<p>Click <a href='{verificationLink}'>here</a> to verify your email.</p>",
                    IsBodyHtml = true
                };
                mailMessage.To.Add(email);

                await client.SendMailAsync(mailMessage);
            }
        }
    }
}
