using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using WebApplication1.Data;
using WebApplication1.Models;
using WebApplication1.DTOs; 

[ApiController]
[Route("api/leaderboard")]
public class Leaderboard : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public Leaderboard(ApplicationDbContext context)
    {
        _context = context;
    }

    //Leaderboard
    [HttpGet("view")]
    public async Task<IActionResult> GetLeaderboard()
    {
    var companyId = int.Parse(User.FindFirst("CompanyId")?.Value);

    var employees = await _context.Employees
        .Where(e => e.CompanyId == companyId)
        .ToListAsync();

    var leaderboard = new List<object>();

    foreach (var emp in employees)
    {
        var lastLog = await _context.AttendanceLogs
            .Where(l => l.EmployeeId == emp.Id)
            .OrderByDescending(l => l.ClockInTime)
            .FirstOrDefaultAsync();

        // Streak calculation (basic: consecutive attendance days from today)
        int streak = 0;
        DateTime checkDate = DateTime.UtcNow.Date;
        while (await _context.AttendanceLogs.AnyAsync(l => l.EmployeeId == emp.Id && l.ClockInTime.Date == checkDate))
        {
            streak++;
            checkDate = checkDate.AddDays(-1);
        }

        leaderboard.Add(new
        {
            id = emp.Id,
            fullName = emp.FullName,
            position = emp.Position,
            points = emp.Rating,
            perfectStreak = streak,
            lastClockIn = lastLog?.ClockInTime,
            lastClockOut = lastLog?.ClockOutTime
        });
    }

    var sortedLeaderboard = leaderboard.OrderByDescending(e => ((dynamic)e).points).ToList();

    return Ok(sortedLeaderboard);
    }



    


}
