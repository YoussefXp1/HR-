using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using WebApplication1.Data;
using WebApplication1.DTOs;
using WebApplication1.Models;
using WebApplication1.Hubs;
using Microsoft.AspNetCore.SignalR;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ChatController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IHubContext<ChatHub> _hubContext;
    private readonly TimeZoneInfo _riyadhTimeZone;

    public ChatController(ApplicationDbContext context, IHubContext<ChatHub> hubContext)
    {
        _context = context;
        _hubContext = hubContext;

        // Use "Asia/Riyadh" for Linux/macOS; use "Arab Standard Time" for Windows
        _riyadhTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Asia/Riyadh");
    }

    [HttpGet("search-employees")]
    public async Task<IActionResult> SearchEmployees(string query = "")
    {
        int companyId = int.Parse(User.FindFirst("CompanyId")?.Value ?? "0");

        var employees = await _context.Employees
            .Where(e => e.CompanyId == companyId && e.FullName.Contains(query))
            .Select(e => new { e.Id, e.FullName, e.ProfilePictureUrl, e.Position })
            .ToListAsync();

        return Ok(employees);
    }

    [Authorize(Roles = "HR")]
    [HttpGet("conversations/{employeeId}")]
    public async Task<IActionResult> GetConversation(int employeeId)
    {
        int companyId = int.Parse(User.FindFirst("companyId")?.Value ?? "0");
        int hrId = int.Parse(User.FindFirst("HrId")?.Value ?? "0");

        if (hrId == 0 || companyId == 0)
            return Unauthorized();

        var messages = await _context.Messages
            .Where(m =>
                m.CompanyId == companyId &&
                ((m.SenderId == hrId && m.ReceiverId == employeeId && m.SenderRole == "HR") ||
                 (m.SenderId == employeeId && m.ReceiverId == hrId && m.SenderRole == "Employee")))
            .OrderBy(m => m.Timestamp)
            .Select(m => new
            {
                m.Id,
                m.SenderId,
                m.ReceiverId,
                m.Content,
                Timestamp = TimeZoneInfo.ConvertTimeFromUtc(m.Timestamp, _riyadhTimeZone).ToString("o"),
                m.SenderRole
            })
            .ToListAsync();

        return Ok(messages);
    }

    [HttpPost("hr-send")]
    [Authorize(Roles = "HR")]
    public IActionResult SendFromHr([FromBody] SendMessageRequest dto)
    {
        var companyId = int.Parse(User.FindFirst("companyId")!.Value);
        var hrId = int.Parse(User.FindFirst("HrId")!.Value);

        var utcNow = DateTime.UtcNow;

        var message = new Message
        {
            SenderId = hrId,
            ReceiverId = dto.ReceiverId,
            SenderRole = "HR",
            ReceiverRole = "Employee",
            Content = dto.Content,
            Timestamp = utcNow, // Store as UTC
            CompanyId = companyId,
            IsSeen = false
        };

        _context.Messages.Add(message);
        _context.SaveChanges();

        return Ok();
    }

    [Authorize(Roles = "Employee")]
    [HttpPost("employee-send")]
    public IActionResult SendFromEmployee([FromBody] SendMessageRequest dto)
    {
        var companyId = int.Parse(User.FindFirst("companyId")!.Value);
        var employeeId = int.Parse(User.FindFirst("EmployeeId")!.Value);

        var hr = _context.HRs.FirstOrDefault(hr => hr.CompanyId == companyId);
        if (hr == null) return NotFound("HR not found for this company.");

        var utcNow = DateTime.UtcNow;

        var message = new Message
        {
            SenderId = employeeId,
            ReceiverId = hr.Id,
            SenderRole = "Employee",
            ReceiverRole = "HR",
            Content = dto.Content,
            Timestamp = utcNow, // Store as UTC
            CompanyId = companyId,
            IsSeen = false
        };

        _context.Messages.Add(message);
        _context.SaveChanges();

        return Ok();
    }

    [Authorize(Roles = "Employee")]
    [HttpGet("conversation-with-hr")]
    public async Task<IActionResult> GetConversationWithHr()
    {
        var employeeId = int.Parse(User.FindFirst("EmployeeId")?.Value ?? "0");
        var companyId = int.Parse(User.FindFirst("companyId")?.Value ?? "0");

        if (employeeId == 0 || companyId == 0)
            return Unauthorized();

        var hr = await _context.HRs.FirstOrDefaultAsync(h => h.CompanyId == companyId);
        if (hr == null)
            return NotFound("No HR found for this company.");

        var messages = await _context.Messages
            .Where(m =>
                m.CompanyId == companyId &&
                (
                    (m.SenderId == employeeId && m.ReceiverId == hr.Id && m.SenderRole == "Employee" && m.ReceiverRole == "HR") ||
                    (m.SenderId == hr.Id && m.ReceiverId == employeeId && m.SenderRole == "HR" && m.ReceiverRole == "Employee")
                )
            )
            .OrderBy(m => m.Timestamp)
            .Select(m => new MessageDto
            {
                SenderId = m.SenderId,
                ReceiverId = m.ReceiverId,
                Content = m.Content ?? "",
                SenderRole = m.SenderRole ?? "",
                ReceiverRole = m.ReceiverRole ?? "",
                Timestamp = TimeZoneInfo.ConvertTimeFromUtc(m.Timestamp, _riyadhTimeZone)
            })
            .ToListAsync();

        return Ok(messages);
    }



    //If the message is unseen 
    [HttpGet("unseen-messages")]
    public async Task<IActionResult> GetUnseenMessages()
    {
        var companyId = int.Parse(User.FindFirst("companyId")?.Value ?? "0");

        var hrIdClaim = User.FindFirst("hrId");
        var employeeIdClaim = User.FindFirst("employeeId");

        List<Message> unseenMessages;

        if (hrIdClaim != null)
        {
            int hrId = int.Parse(hrIdClaim.Value);
            unseenMessages = await _context.Messages
                .Where(m => m.ReceiverId == hrId && m.ReceiverRole == "HR" && !m.IsSeen && m.CompanyId == companyId)
                .ToListAsync();
        }
        else if (employeeIdClaim != null)
        {
            int employeeId = int.Parse(employeeIdClaim.Value);
            unseenMessages = await _context.Messages
                .Where(m => m.ReceiverId == employeeId && m.ReceiverRole == "Employee" && !m.IsSeen && m.CompanyId == companyId)
                .ToListAsync();
        }
        else
        {
            return Unauthorized();
        }

        return Ok(unseenMessages.Select(m => new
        {
            m.Id,
            m.SenderId,
            m.SenderRole,
            m.Content,
            Timestamp = TimeZoneInfo.ConvertTimeFromUtc(m.Timestamp, _riyadhTimeZone).ToString("g")
        }));
    }


    [HttpPost("mark-seen")]
public async Task<IActionResult> MarkMessagesAsSeen()
{
    var companyId = int.Parse(User.FindFirst("companyId")?.Value ?? "0");

    var hrId = User.FindFirst("hrId")?.Value;
    var employeeId = User.FindFirst("employeeId")?.Value;

    if (hrId == null && employeeId == null)
        return Unauthorized();

    var userId = hrId ?? employeeId;
    var role = hrId != null ? "HR" : "Employee";

    var messages = await _context.Messages
        .Where(m => m.CompanyId == companyId &&
                    m.ReceiverId.ToString() == userId &&
                    m.ReceiverRole == role &&
                    !m.IsSeen)
        .ToListAsync();

    foreach (var message in messages)
    {
        message.IsSeen = true;
    }

    await _context.SaveChangesAsync();

    return Ok();
}


}
