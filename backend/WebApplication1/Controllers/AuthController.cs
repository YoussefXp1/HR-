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
using Microsoft.AspNetCore.Authorization;

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
        [Authorize]
        [HttpGet("protected")]
        public IActionResult ProtectedRoute()
        {
            return Ok (new {message = "You have access to this protected route !!"});
        }
        [HttpGet("verify-token")]
        public IActionResult VerifyUser()
        {

        //var token = Request.Cookies["jwt"]; //Getting the token from the Cookies
        if (!Request.Cookies.TryGetValue("jwt", out var token))   
        {
            Console.WriteLine("No Token found in cookies ❌");
            return Unauthorized(new { message = "Token missing, please log in again" });
        }

            //Console.WriteLine($"Received token: {token}");

        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]);
        try 
        {
            var claimsPrincipal = tokenHandler.ValidateToken(token, new TokenValidationParameters
            {
                
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ClockSkew = TimeSpan.Zero
            }, out SecurityToken validatedToken);

            Console.WriteLine("Token is vaild ✅");
            return Ok (new {message = "User is authenticated"});
        }
        catch (SecurityTokenException)
        {
            Console.WriteLine("Token has expired ❌");
            return Unauthorized(new {message = "Session expired. please log in again"});
        }catch (Exception ex)
        {
            Console.WriteLine($"Token validation failed: {ex.Message} ❌");
            return Unauthorized(new{message = "Invalid or expired token"});
        }
        }


        [HttpPost("logout")]
        public IActionResult Logout()
        {
            // Remove the JWT cookie
            Response.Cookies.Delete("jwt");
            return Ok(new { message = "Logged out successfully." });
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

                var token = GenerateJwtToken(hr.Id, hr.Email, "HR");
                Console.WriteLine("Generated HR Token: " + token);
                //i added this now 
                Response.Cookies.Append("jwt", token, new CookieOptions
                {
                    HttpOnly= true,
                    Secure = false,
                    SameSite = SameSiteMode.Lax,
                    Expires = DateTime.UtcNow.AddHours(2)
                });
                return Ok(new { Role = "HR" }); // no need to return the token
            }

            // Check if the user is an Employee
            var employee = await _context.Employees.FirstOrDefaultAsync(e => e.EmployeeIdentifier == loginDTO.Identifier);
            if (employee != null)
            {
                if (!BCrypt.Net.BCrypt.Verify(loginDTO.Password, employee.PasswordHash))
                {
                    return Unauthorized(new { message = "Invalid password." });
                }
                var token = GenerateJwtToken(employee.Id, employee.EmployeeIdentifier, "Employee");
                // added this code now
                Response.Cookies.Append("jwt", token, new CookieOptions
                {
                    HttpOnly = true, // this will revent from benig accessed by javascript 
                    Secure = false,
                    SameSite = SameSiteMode.Lax,
                    Expires = DateTime.UtcNow.AddHours(2)
                });

                return Ok(new {  Role = "Employee" }); // removed the token no need to return the token
            }

            return Unauthorized(new { message = "User not found." });
        }

        //FORGOT PASSWORD API
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDTO forgotPasswordDTO)
        {

            if (string.IsNullOrWhiteSpace(forgotPasswordDTO.Email))
                return BadRequest(new { message = "Email is required." });


            // Check if the identifier belongs to an HR (by email)
            var hr = await _context.HRs.FirstOrDefaultAsync(h => h.Email == forgotPasswordDTO.Email);
            if (hr != null)
            {
                string resetToken = Guid.NewGuid().ToString(); //This will generate a secure token
                //store the token in the database
                var resetRequest = new PasswordReset 
                {
                    Email = hr.Email,
                    Token = resetToken,
                    ExpiryDate =DateTime.UtcNow.AddHours(1) //The token will expire in 1H
                };
                await _context.PasswordResets.AddAsync(resetRequest);
                await _context.SaveChangesAsync();
                if (!string.IsNullOrEmpty(hr.Email))
                {
                    
                    await SendPasswordResetEmail(hr.Email, resetToken);
                    return Ok(new { message ="Password reset email sent successfully"});
                }
                else
                {
                    return BadRequest(new{message ="Invalid email address"});
                }
                
            }

            // Check if the identifier belongs to an Employee (by Employee ID)
            var employee = await _context.Employees.FirstOrDefaultAsync(e => e.Email == forgotPasswordDTO.Email);
            if (employee != null)
            {
                string resetToken = Guid.NewGuid().ToString();

                var resetRequest = new PasswordReset
                {
                    Email = employee.Email,
                    Token = resetToken,
                    ExpiryDate =DateTime.UtcNow.AddHours(1)
                };
                await _context.PasswordResets.AddAsync(resetRequest);
                await _context.SaveChangesAsync();
                if (!string.IsNullOrEmpty(employee.Email))
                {
                    await SendPasswordResetEmail(employee.Email, resetToken);
                    return Ok(new {message = "Password rest email sent successfully"});
                }
                else
                {
                    return BadRequest(new {message = "Invlid email address"});
                }
            }

            return NotFound(new { message = "User not found." });
        }
        //RESET PASSWORD API
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDTO request)
        {
            if (string.IsNullOrWhiteSpace(request.Token) || string.IsNullOrWhiteSpace(request.NewPassword))
                return BadRequest(new { message = "Invalid request." });

            var resetRequest = await _context.PasswordResets.FirstOrDefaultAsync(r => r.Token == request.Token);
            if (resetRequest == null || resetRequest.ExpiryDate < DateTime.UtcNow)
            return BadRequest(new { message = "Invalid or expired token." });

            var hr = await _context.HRs.FirstOrDefaultAsync(h => h.Email == resetRequest.Email);
            if (hr != null)
            {
                hr.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
                _context.HRs.Update(hr);
            }
            else
            {
                var employee = await _context.Employees.FirstOrDefaultAsync(e => e.Email == resetRequest.Email);
                if (employee == null)
                    return NotFound(new { message = "User not found." });

                employee.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
                _context.Employees.Update(employee);
            }

            // Remove reset request after use
            _context.PasswordResets.Remove(resetRequest);
             await _context.SaveChangesAsync();

             return Ok(new { message = "Password reset successfully!" });
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
        private string GenerateJwtToken(int hrId, string identifier, string role)
        {
            
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key is missing")));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        // Ensure Issuer & Audience are not null
            var issuer = _configuration["Jwt:Issuer"] ?? throw new InvalidOperationException("JWT Issuer is missing");
            var audience = _configuration["Jwt:Audience"] ?? throw new InvalidOperationException("JWT Audience is missing");

            var expirationTime = DateTime.UtcNow.AddHours(2);
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, identifier), // Store email or unique identifier here
                new Claim(ClaimTypes.Role, role),
                new Claim("hrId", hrId.ToString()), // HR ID claim
            };

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: expirationTime,
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
        private async Task SendPasswordResetEmail(string? email, string resetToken)
        {
            string senderEmail = _configuration["Gmail:Email"];
            string senderPassword = _configuration["Gmail:AppPassword"];

            if (string.IsNullOrWhiteSpace(senderEmail))
            {
                throw new ArgumentException("Sender email is missing in configuration. Check appsettings.json.", nameof(senderEmail));
            }
            if (string.IsNullOrWhiteSpace(senderPassword))
            {
                throw new ArgumentException("Sender email password is missing in configuration. Check appsettings.json.", nameof(senderPassword));
            }
            if (string.IsNullOrWhiteSpace(email))
            {
                throw new ArgumentException("Recipient email cannot be null or empty.", nameof(email));
            }
        
            string resetLink = $"{_configuration["FrontendUrl"]}/reset-password?token={resetToken}";

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

                try
                {
                mailMessage.To.Add(email);
                await client.SendMailAsync(mailMessage);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Failed to send email: {ex.Message}");
                    throw; // Rethrow the exception for debugging
                }
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
