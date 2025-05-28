using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using WebApplication1.DTOs;
using WebApplication1.Models;
using WebApplication1.Data;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using WebApplication1.Services;

[Route("api/employee")]
[ApiController]
public class EmployeeController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly EmailService _emailService;

    public EmployeeController(ApplicationDbContext context, IConfiguration configuration, EmailService emailService)
    {
        _context = context;
        _configuration = configuration;
        _emailService = emailService;
    }

    //Login Employee
    
    [Authorize(Roles = "Employee")]
    [HttpGet("Profile")]
    public async Task<IActionResult> GetEmployeeProfile(int employeeId, [FromHeader] string Authorization)
    {
        var identity = HttpContext.User.Identity as ClaimsIdentity;
        var email = identity?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(email))
            return Unauthorized("Token missing Employee ID");

        var employee = await _context.Employees.FirstOrDefaultAsync(e => e.Email == email);

        if (employee == null)
            return NotFound("Employee not found");

        return Ok(new
        {
            employeeId = employee.Id,
            employee.FullName,
            employee.Email,
            employee.PhoneNumber,
            employee.Position,
            //employee.ProfilePictureUrl

        });
    }

    [Authorize(Roles = "Employee")]
    [HttpPut("update-profile")]
public async Task<IActionResult> UpdateEmployeeProfile([FromBody] EmployeeUpdateDto EmployeeUpdateDto)
{
    var identity = HttpContext.User.Identity as ClaimsIdentity;
    var employeeIdClaim = identity?.FindFirst("employeeId")?.Value;

    if (!int.TryParse(employeeIdClaim, out var employeeId))
        return Unauthorized("Token missing or invalid Employee ID");

    var employee = await _context.Employees.FindAsync(employeeId);
    if (employee == null)
        return NotFound("Employee not found");

    bool isEmailChanged = !string.Equals(employee.Email, EmployeeUpdateDto.Email, StringComparison.OrdinalIgnoreCase);

    // Update Email and Phone Number
    employee.Email = EmployeeUpdateDto.Email;
    employee.PhoneNumber = EmployeeUpdateDto.PhoneNumber;

    _context.Employees.Update(employee);
    await _context.SaveChangesAsync();

    if (isEmailChanged)
    {
            employee.IsEmailVerified = false;
        // Generate token and save it to the verification table
            var token = Guid.NewGuid().ToString();
        var expiry = DateTime.UtcNow.AddHours(24);

        var emailVerification = new EmailVerification
        {
            Email = employee.Email,
            Token = token,
            ExpiryDate = expiry
        };

        _context.EmailVerifications.Add(emailVerification);
        await _context.SaveChangesAsync();

        var verificationLink = $"{_configuration["FrontendUrl"]}/email-verified?token={token}";
        await _emailService.SendVerificationEmail(employee.Email, verificationLink);

        return Ok(new { message = "Profile updated successfully! Please verify your new email." });
        }

    return Ok(new { message = "Profile updated successfully." });
    }



    //Employee Search 
    [Authorize(Roles = "HR")]
    [HttpGet("search/{id}")]
    public async Task<IActionResult> SearchEmployeeById(int id)
    {
    var employee = await _context.Employees.FirstOrDefaultAsync(e => e.Id == id);

    if (employee == null)
        return NotFound("Employee not found.");

    return Ok(new
    {
        employee.Id,
        employee.FullName,
        employee.Email,
        employee.PhoneNumber,
        employee.Position
    });
    }

    //Employee Updating position
    [Authorize(Roles = "HR")]
    [HttpPut("update-position/{id}")]
    public async Task<IActionResult> UpdateEmployeePosition(int id, [FromBody] UpdatePositionDto dto)
    {
    var employee = await _context.Employees.FindAsync(id);

    if (employee == null)
        return NotFound("Employee not found.");

    employee.Position = dto.NewPosition;
    _context.Employees.Update(employee);
    await _context.SaveChangesAsync();

    return Ok(new { message = "Employee position updated successfully." });
    }

    //Deleting an employee by ID 
    [Authorize(Roles = "HR")]
[HttpDelete("delete/{id}")]
public async Task<IActionResult> DeleteEmployee(int id)
{
    var employee = await _context.Employees.FindAsync(id);
    if (employee == null)
        return NotFound(new { message = "Employee not found." });

    // Delete leave requests
    var leaveRequests = _context.LeaveRequests.Where(lr => lr.EmployeeId == id);
    _context.LeaveRequests.RemoveRange(leaveRequests);

    // Delete attendance logs
    var attendanceLogs = _context.AttendanceLogs.Where(al => al.EmployeeId == id);
    _context.AttendanceLogs.RemoveRange(attendanceLogs);

    _context.Employees.Remove(employee);
    await _context.SaveChangesAsync();

    return Ok(new { message = "Employee and related data deleted." });
}


    [Authorize(Roles = "Employee")]
    [HttpGet("my-document-requests")]
    public async Task<IActionResult> GetMyDocumentRequests()
    {
    var employeeIdClaim = User.FindFirst("employeeId")?.Value;
    if (!int.TryParse(employeeIdClaim, out int employeeId))
        return Unauthorized();

    TimeZoneInfo riyadhZone = TimeZoneInfo.FindSystemTimeZoneById("Arab Standard Time");

    var requests = await _context.DocumentRequests
        .Where(r => r.EmployeeId == employeeId && !r.IsCompleted)
        .Select(r => new
        {
            r.Id,
            RequestedDocuments = r.RequestedDocuments,
            r.AdditionalDetails,
            RequestedAt = TimeZoneInfo.ConvertTimeFromUtc(r.CreatedAt, riyadhZone),
            Status =r.IsCompleted ? "Completed" : "Pending"
        })
        .ToListAsync();

    return Ok(requests);
    }

    //Uploading DOCS
    [Authorize(Roles = "Employee")]
    [HttpPost("upload-document/{requestId}")]
    public async Task<IActionResult> UploadDocument(int requestId, IFormFile file)  
    {
    if (file == null || file.Length == 0)
        return BadRequest("No file uploaded.");

    var request = await _context.DocumentRequests.FindAsync(requestId);
    if (request == null)
        return NotFound("Document request not found.");

    var employeeIdClaim = User.FindFirst("employeeId")?.Value;
    if (!int.TryParse(employeeIdClaim, out int employeeId) || request.EmployeeId != employeeId)
        return Unauthorized();

    // Save file
    var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "UploadedDocuments");
    Directory.CreateDirectory(uploadsFolder);
    var filePath = Path.Combine(uploadsFolder, $"{Guid.NewGuid()}_{file.FileName}");

    using (var stream = new FileStream(filePath, FileMode.Create))
    {
        await file.CopyToAsync(stream);
    }

    request.UploadedDocumentPath = filePath;
    request.IsCompleted = true;

    await _context.SaveChangesAsync();

    return Ok("File uploaded successfully.");
    }

    //Request To Leave/Vacation
    [HttpPost("request-leave")]
    public async Task<IActionResult> RequestLeave([FromBody] LeaveRequestDto request)
    {
    var employeeId = int.Parse(User.FindFirst("employeeId").Value);
    var companyId = int.Parse(User.FindFirst("companyId")?.Value);

    var employee = await _context.Employees.FindAsync(employeeId);
    if (employee == null)
        return NotFound("Employee not found.");

    var duration = (request.EndDate - request.StartDate).Days + 1;

    // Balance checks
    if (request.LeaveType == "Annual")
    {
        if (employee.AnnualVacationDays == 0)
            return BadRequest("You have no annual vacation days left.");
        if (employee.AnnualVacationDays < duration)
            return BadRequest($"Insufficient annual vacation days. You have {employee.AnnualVacationDays} day(s) left.");
    }
    else if (request.LeaveType == "Sick")
    {
        if (employee.SickVacationDays == 0)
            return BadRequest("You have no sick vacation days left.");
        if (employee.SickVacationDays < duration)
            return BadRequest($"Insufficient sick vacation days. You have {employee.SickVacationDays} day(s) left.");
    }

    var leaveRequest = new LeaveRequest
    {
        EmployeeId = employeeId,
        CompanyId = companyId,
        LeaveType = request.LeaveType,
        StartDate = request.StartDate,
        EndDate = request.EndDate,
        Reason = request.Reason,
        Status = "Pending",
        RequestDate = DateTime.UtcNow
    };

    _context.LeaveRequests.Add(leaveRequest);
    await _context.SaveChangesAsync();

    return Ok(new { message = "Leave request submitted successfully." });
    }


    [Authorize(Roles = "Employee")]
    [HttpPost("upload-profile-picture")]
public async Task<IActionResult> UploadProfilePicture(IFormFile file)
{
    var identity = HttpContext.User.Identity as ClaimsIdentity;
    var employeeIdClaim = identity?.FindFirst("employeeId")?.Value;

    if (!int.TryParse(employeeIdClaim, out var employeeId))
        return Unauthorized("Token missing or invalid Employee ID");

    var employee = await _context.Employees.FindAsync(employeeId);
    if (employee == null)
        return NotFound("Employee not found");

    if (file == null || file.Length == 0)
        return BadRequest("No file uploaded");

    // Optional: validate file type and size
    var allowedExtensions = new[] { ".jpg", ".jpeg", ".png" };
    var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

    if (!allowedExtensions.Contains(extension))
        return BadRequest("Unsupported file type");

    var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "employee_pictures");
    if (!Directory.Exists(uploadsFolder))
        Directory.CreateDirectory(uploadsFolder);

    var fileName = $"{employeeId}_{Guid.NewGuid()}{extension}";
    var filePath = Path.Combine(uploadsFolder, fileName);

    using (var stream = new FileStream(filePath, FileMode.Create))
    {
        await file.CopyToAsync(stream);
    }

    // Save the relative path or URL to employee record
    employee.ProfilePictureUrl = $"/uploads/employee_pictures/{fileName}";

    _context.Employees.Update(employee);
    await _context.SaveChangesAsync();

    return Ok(new { message = "Profile picture uploaded successfully.", profilePictureUrl = employee.ProfilePictureUrl });
}












    //Get Employees for a Specific Company
    [HttpGet("{companyId}/employees")]
    public async Task<IActionResult> GetEmployees(int companyId)
    {
        var employees = await _context.Employees.Where(e => e.CompanyId == companyId).ToListAsync();
        return Ok(employees);
    }

    //Hash Password
    private string HashPassword(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password);
    }

    //Verify Password
    private bool VerifyPassword(string enteredPassword, string storedHash)
    {
        return BCrypt.Net.BCrypt.Verify(enteredPassword, storedHash);
    }
}
