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

[Route("api/hr")]
[ApiController]
public class HRController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly EmailService _emailService;

    public HRController(ApplicationDbContext context, EmailService emailService)
    {
        _context = context;
        _emailService = emailService;
    }

    //Remove HR Registration Logic (HR is created in CompanyController)

    //HR Login
    
    [Authorize(Roles = "HR")]
    [HttpGet("profile")]
    public async Task<IActionResult> GetHRProfile(int hrId, [FromHeader] string Authorization)
    {
        var identity = HttpContext.User.Identity as ClaimsIdentity;
        var email = identity?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(email))
            return Unauthorized(new { message = "Invaild token." });

        var hr = await _context.HRs.FirstOrDefaultAsync(h => h.Email == email);
        if (hr == null)
            return NotFound(new { message = "HR Not Found" });

        return Ok(new
        {
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

    [Authorize(Roles = "HR")]
    [HttpPost("add-employee")]
    public async Task<IActionResult> AddEmployee([FromBody] AddingEmployeeDto AddingEmployeeDto)
    {
        var hrId = int.Parse(User.FindFirst("hrId")?.Value ?? "0");
        var hr = await _context.HRs.Include(h => h.Company).FirstOrDefaultAsync(h => h.Id == hrId);
        if (hr == null || hr.Company == null)
            return BadRequest("Hr or Company not found");

        //Generate and Hash Password
        var password = GenerateRandomPassword();
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(password);

        //Saving the new employee to the database

        var newEmployee = new Employee
        {
            FullName = AddingEmployeeDto.FullName,
            Position = AddingEmployeeDto.Position,
            Email = AddingEmployeeDto.Email.ToLower(),
            PhoneNumber = AddingEmployeeDto.Phone,
            PasswordHash = passwordHash,
            CompanyId = hr.Company.Id,
            IsEmailVerified = true,
            ProfilePictureUrl = null

            
        };
        Console.WriteLine("Password: " + password);
        Console.WriteLine("Hash: " + passwordHash);

        //Saving the Employee in the Database
        _context.Employees.Add(newEmployee);
        await _context.SaveChangesAsync();

        var emailContent = $@"
        <p>Welcome to HR Horizon!</p>
        <p>Your login credentials are:</p>
        <ul>
            <li><strong>Email:</strong> {newEmployee.Email}</li>
            <li><strong>Password:</strong> {password}</li>
        </ul>
        <p>Please login and change your password immediately.</p>";

        await _emailService.SendCustomEmail(newEmployee.Email, "Welcome to HR Horizon", emailContent);

        return Ok(new { message = "Employee Added" });
    }

    [Authorize(Roles = "HR")]
    [HttpGet("search-employee")]
    public async Task<IActionResult> SearchEmployee([FromQuery] SearchEmployeeDTO searchEmployeeDTO)
    {
        // Validate input: Either Employee ID or Email should be provided.
        if ((searchEmployeeDTO.EmployeeId == null || searchEmployeeDTO.EmployeeId == 0)
        && string.IsNullOrEmpty(searchEmployeeDTO.EmployeeEmail))
        {
            return BadRequest("Employee ID or Email is required.");
        }

        // Get the CompanyId from the logged-in HR user (from the JWT claim)
        var companyIdClaim = User.FindFirst("companyId")?.Value;
        if (companyIdClaim == null || !int.TryParse(companyIdClaim, out int companyId))
        {
            return Unauthorized("Company ID is missing or invalid.");
        }

        // Check if the employee exists and belongs to the same company
        var employee = await _context.Employees
            .FirstOrDefaultAsync(e =>
                (e.Id == searchEmployeeDTO.EmployeeId || e.Email == searchEmployeeDTO.EmployeeEmail) &&
                e.CompanyId == companyId); // Only employees in the same company as HR

        // If no employee is found, return an error
        if (employee == null)
        {
            return NotFound(new { message = "Employee not found or does not belong to your company." });
        }

        return Ok(new { message = "Employee found." });
    }






    //Requesting  Documents
    [Authorize(Roles = "HR")]
    [HttpPost("request-documents")]
    public async Task<IActionResult> RequestDocuments([FromBody] DocumentRequestDTO documentRequestDTO)
    {
        // 1. Validate input
        if ((documentRequestDTO.EmployeeId == null || documentRequestDTO.EmployeeId == 0)
            && string.IsNullOrEmpty(documentRequestDTO.EmployeeEmail))
        {
            return BadRequest(new { message = "Employee ID or Email is required." });
        }

        // 2. Get HR's CompanyId from JWT
        var companyIdClaim = User.FindFirst("companyId")?.Value;
        if (string.IsNullOrEmpty(companyIdClaim) || !int.TryParse(companyIdClaim, out int companyId))
        {
            return Unauthorized(new { message = "Company information is missing or invalid." });
        }

        // 3. Search for the employee
        var employee = await _context.Employees.FirstOrDefaultAsync(e =>
            (e.Id == documentRequestDTO.EmployeeId || e.Email == documentRequestDTO.EmployeeEmail) &&
            e.CompanyId == companyId);

        if (employee == null)
        {
            return NotFound(new { message = "Employee not found or does not belong to your company." });
        }
        var employeeName =employee.FullName;
        var employeeEmail =employee.Email;


        // 4. Create the document request
        var documentRequest = new DocumentRequest
        {
            CompanyId = companyId,
            EmployeeId = employee.Id, // Always use the real employee ID
            EmployeeEmail = employee.Email, // Always use real employee email
            RequestedDocuments = string.Join(", ", documentRequestDTO.Documents),
            AdditionalDetails = documentRequestDTO.AdditionalDetails,
            CreatedAt = DateTime.UtcNow,
            IsCompleted = false
        };



        // 5. Save to database
        _context.DocumentRequests.Add(documentRequest);
        await _context.SaveChangesAsync();

        await _emailService.SendDocumentRequestEmail(employeeEmail, employeeName, documentRequestDTO.Documents, documentRequestDTO.AdditionalDetails);


        return Ok(new { message = "Document request sent successfully." });
    }

    //Latest request 
    [Authorize(Roles = "HR")]
    [HttpGet("latest-requests")]
    public async Task<IActionResult> GetLatestDocumentRequests()
    {
    var companyIdClaim = User.FindFirst("companyId")?.Value;
    if (string.IsNullOrEmpty(companyIdClaim))
    {
        return Unauthorized("Company information is missing.");
    }

    if (!int.TryParse(companyIdClaim, out int companyId))
    {
        return BadRequest("Invalid company ID.");
    }
    TimeZoneInfo riyadhZone = TimeZoneInfo.FindSystemTimeZoneById("Arab Standard Time");
    var latestRequests = await _context.DocumentRequests
        .Where(r => r.CompanyId == companyId)
        .OrderByDescending(r => r.CreatedAt)
        .Take(5) // Fetch the last 5 requests or as needed
        .Select(r => new 
        {
            r.Id,
            r.EmployeeEmail,
            //r.EmployeeName, // Assuming this exists
            CreatedAt = TimeZoneInfo.ConvertTimeFromUtc(r.CreatedAt, riyadhZone),
            UploadedDocumentPath = r.UploadedDocumentPath,
            r.IsCompleted
        })
        .ToListAsync();

    return Ok(latestRequests);
    }

    //Cancle Request
    [Authorize(Roles = "HR")]
    [HttpDelete("cancel-request/{id}")]
    public async Task<IActionResult> CancelDocumentRequest(int id)
    {
    var request = await _context.DocumentRequests.FindAsync(id);
    if (request == null)
    {
        return NotFound("Document request not found.");
    }

    // Check if the request belongs to the HR's company
    var companyIdClaim = User.FindFirst("companyId")?.Value;
    if (string.IsNullOrEmpty(companyIdClaim) || !int.TryParse(companyIdClaim, out int companyId) || request.CompanyId != companyId)
    {
        return Unauthorized("You cannot cancel this request.");
    }

    //Fetch employee details (especially email)
    var employee = await _context.Employees.FirstOrDefaultAsync(e => e.Id == request.EmployeeId);
    if (employee == null)
    {
        return BadRequest("Employee not found.");
    }

    //Compose and send cancellation email
    var subject = "Document Request Canceled";
    var body = $@"
        <p>Dear {employee.FullName},</p>
        <p>We would like to inform you that your document request has been <strong>canceled</strong> by HR.</p>
        <ul>
            <li><strong>Requested Documents:</strong> {request.RequestedDocuments}</li>
        </ul>
        <p>If you have any questions, please contact your HR representative.</p>";

    await _emailService.SendCustomEmail(employee.Email, subject, body);

    _context.DocumentRequests.Remove(request);
    await _context.SaveChangesAsync();

    
    return Ok("Document request canceled successfully.");
    }
    //Download Documents

    [Authorize(Roles = "HR")]
    [HttpGet("download-document/{requestId}")]
    public async Task<IActionResult> DownloadDocument(int requestId)
    {
    var request = await _context.DocumentRequests.FindAsync(requestId);
    if (request == null || string.IsNullOrEmpty(request.UploadedDocumentPath))
        return NotFound("File not found.");

    var filePath = request.UploadedDocumentPath;
    if (!System.IO.File.Exists(filePath))
        return NotFound("File does not exist on disk.");

    var fileName = Path.GetFileName(filePath);
    var contentType = "application/octet-stream";

    var memory = new MemoryStream();
    using (var stream = new FileStream(filePath, FileMode.Open, FileAccess.Read))
    {
        await stream.CopyToAsync(memory);
    }

    memory.Position = 0;
    return File(memory, contentType, fileName);
    }



    //Leave Requests
    [HttpGet("leave-requests")]
    public async Task<IActionResult> GetLeaveRequests()
    {
    var companyId = int.Parse(User.FindFirst("companyId").Value);

    var requests = await _context.LeaveRequests
        .Where(r => r.CompanyId == companyId)
        .Include(r => r.Employee)
        .OrderByDescending(r => r.RequestDate)
        .Select(r => new
        {
            r.Id,
            EmployeeName = r.Employee.FullName,
            r.LeaveType,
            r.StartDate,
            r.EndDate,
            r.Reason,
            r.Status,
            r.RequestDate
        })
        .ToListAsync();

    return Ok(requests);
    }

    //Approving Leave Requests
    [HttpPost("approve-leave/{requestId}")]
    public async Task<IActionResult> ApproveLeave(int requestId)
    {
        var request = await _context.LeaveRequests
            .Include(r => r.Employee)
            .FirstOrDefaultAsync(r => r.Id == requestId);

        if (request == null || request.Status != "Pending")
            return NotFound("Invalid or already handled request.");

        var duration = (request.EndDate - request.StartDate).Days + 1;

        if (request.LeaveType == "Sick" && request.Employee.SickVacationDays >= duration)
            request.Employee.SickVacationDays -= duration;
        else if (request.LeaveType == "Annual" && request.Employee.AnnualVacationDays >= duration)
            request.Employee.AnnualVacationDays -= duration;
        else if (request.LeaveType == "Unpaid") { /* No balance update */ }
        else
            return BadRequest("Insufficient leave balance.");

        request.Status = "Approved";
        await _context.SaveChangesAsync();

        string subject = "Leave Request Approved";
        string body = $@"
        Dear {request.Employee.FullName},

        We are pleased to inform you that your leave request from {request.StartDate:yyyy-MM-dd} to {request.EndDate:yyyy-MM-dd} has been approved.

        Please ensure that all responsibilities are appropriately delegated or managed during your absence. Should there be any changes to your plans, kindly notify the HR department at your earliest convenience.

        Wishing you a restful and productive time away.

        Best regards,
        HR Department
        ";

        await _emailService.SendCustomEmail(request.Employee.Email, subject, body);


        return Ok("Leave request approved.");
    }

    //Declining Leave Requests
    [HttpPost("reject-leave/{requestId}")]
public async Task<IActionResult> RejectLeave(int requestId)
{
    var request = await _context.LeaveRequests
        .Include(r => r.Employee)
        .FirstOrDefaultAsync(r => r.Id == requestId);

    if (request == null || request.Status != "Pending")
        return NotFound("Invalid or already handled request.");

    if (request.Employee == null)
        return BadRequest("Employee information is missing for this leave request.");

    request.Status = "Rejected";
    await _context.SaveChangesAsync();

    string subject = "Leave Request Rejected";
    string body = $@"
    Dear {request.Employee.FullName},

    We are pleased to inform you that your leave request from {request.StartDate:yyyy-MM-dd} to {request.EndDate:yyyy-MM-dd} has been rejected.

    Please ensure that all responsibilities are appropriately delegated or managed during your absence. Should there be any changes to your plans, kindly notify the HR department at your earliest convenience.

    Wishing you a restful and productive time away.

    Best regards,
    HR Department
    ";

    await _emailService.SendCustomEmail(request.Employee.Email, subject, body);

    return Ok("Leave request rejected.");
}




    //Searching Employee Requests
    [HttpGet("search-leave-requests")]
    public async Task<IActionResult> SearchLeaveRequests(string query)
    {
    var requests = await _context.LeaveRequests
        .Include(r => r.Employee)
        .Where(r => r.Employee.FullName.Contains(query) || r.EmployeeId.ToString() == query)
        .Select(r => new {
            r.Id,
            EmployeeName = r.Employee.FullName,
            r.LeaveType,
            r.StartDate,
            r.EndDate,
            r.Reason,
            r.Status,
            r.RequestDate
        })
        .ToListAsync();

    return Ok(requests);
    }












    //Employee Genrated Password
    private string GenerateRandomPassword()
    {
        return Path.GetRandomFileName().Replace(".", "").Substring(0, 10); // Generates a random 10 character password
    }




}
