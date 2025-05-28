using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using WebApplication1.Data;
using WebApplication1.Models;
using WebApplication1.DTOs;

[ApiController]
[Route("api/attendance")]
public class AttendanceController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public AttendanceController(ApplicationDbContext context)
    {
        _context = context;
    }

    // Updated Helper method to get correct Riyadh time
    private DateTime GetRiyadhTime()
    {
        var utcNow = DateTime.UtcNow;
        try
        {
            TimeZoneInfo riyadhZone;
#if WINDOWS
            riyadhZone = TimeZoneInfo.FindSystemTimeZoneById("Arabian Standard Time");
#else
            riyadhZone = TimeZoneInfo.FindSystemTimeZoneById("Asia/Riyadh");
#endif
            return TimeZoneInfo.ConvertTimeFromUtc(utcNow, riyadhZone);
        }
        catch
        {
            // Fallback to UTC+3 (Riyadh does not use DST)
            return utcNow.AddHours(3);
        }
    }

    // Employee Clock In
    [Authorize(Roles = "Employee")]
    [HttpPost("clock-in")]
    public async Task<IActionResult> ClockIn([FromBody] GeoLocationDto location)
    {
        var employeeId = int.Parse(User.FindFirst("employeeId").Value);
        var today = GetRiyadhTime().Date;

        var alreadyClockedIn = await _context.AttendanceLogs
            .AnyAsync(log => log.EmployeeId == employeeId
                             && log.ClockInTime.Date == today);

        if (alreadyClockedIn)
        {
            return BadRequest("You have already clocked in today.");
        }

        var log = new AttendanceLog
        {
            EmployeeId = employeeId,
            ClockInTime = GetRiyadhTime(),

            Latitude = location.Latitude,
            Longitude = location.Longitude,
            Status = "clocked-in"
        };

        _context.AttendanceLogs.Add(log);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Clock-in successful" });
    }

    // Employee Clock Out
    [Authorize(Roles = "Employee")]
    [HttpPost("clock-out")]
    public async Task<IActionResult> ClockOut([FromBody] GeoLocationDto location)
    {
        var employeeIdClaim = User.FindFirst("EmployeeId")?.Value;
        if (employeeIdClaim == null) return BadRequest("Missing claim");

        int employeeId = int.Parse(employeeIdClaim);
        var today = GetRiyadhTime().Date;

        var log = await _context.AttendanceLogs
            .Where(l => l.EmployeeId == employeeId && l.ClockInTime.Date == today && l.ClockOutTime == null)
            .OrderByDescending(l => l.ClockInTime)
            .FirstOrDefaultAsync();

        if (log == null)
            return NotFound("No active clock-in found.");

        log.ClockOutTime = GetRiyadhTime();
        log.WorkedHours = (log.ClockOutTime - log.ClockInTime)?.TotalHours;
        log.Status = "clocked-out";

        // === POINTS LOGIC ===
        int points = 0;

        bool clockInOnTime = log.ClockInTime.TimeOfDay <= new TimeSpan(9, 0, 0);
        bool clockOutOnTime = log.ClockOutTime.Value.TimeOfDay >= new TimeSpan(17, 0, 0);

        if (clockInOnTime)
            points += 5;
        else
            points -= 5;

        if (clockOutOnTime)
            points += 5;
        else
            points -= 5;

        var employee = await _context.Employees.FindAsync(employeeId);
        if (employee == null) return NotFound("Employee not found.");

        // Calculate streak logic
        var yesterday = today.AddDays(-1);
        bool yesterdayPerfect = false;

        // Check yesterday's attendance log for perfect attendance
        var yesterdayLog = await _context.AttendanceLogs
            .Where(l => l.EmployeeId == employeeId && l.ClockInTime.Date == yesterday)
            .OrderByDescending(l => l.ClockInTime)
            .FirstOrDefaultAsync();

        if (yesterdayLog != null && yesterdayLog.ClockInTime.TimeOfDay <= new TimeSpan(9, 0, 0)
            && yesterdayLog.ClockOutTime.HasValue
            && yesterdayLog.ClockOutTime.Value.TimeOfDay >= new TimeSpan(17, 0, 0))
        {
            yesterdayPerfect = true;
        }

        // Check if today is perfect attendance
        bool todayPerfect = clockInOnTime && clockOutOnTime;

        if (todayPerfect)
        {
            if (yesterdayPerfect)
            {
                employee.AttendanceStreak += 1;
            }
            else
            {
                employee.AttendanceStreak = 1; // reset streak to 1 today
            }

            // Add daily attendance points
            employee.Rating += points;

            // Add bonus points for every 5-day streak milestone
            if (employee.AttendanceStreak % 5 == 0)
            {
                employee.Rating += 10; // example bonus points
            }
        }
        else
        {
            // Reset streak if today not perfect attendance
            employee.AttendanceStreak = 0;

            // Still add points (which may be negative from penalties)
            employee.Rating += points;
        }

        await _context.SaveChangesAsync();

        return Ok("Clocked out successfully.");
    }

    [Authorize(Roles = "Employee")]
    [HttpGet("today-log")]
    public async Task<IActionResult> GetTodayLog()
    {
        var employeeId = int.Parse(User.FindFirst("EmployeeId").Value);
        var today = GetRiyadhTime().Date;

        var log = await _context.AttendanceLogs
            .Where(l => l.EmployeeId == employeeId && l.ClockInTime.Date == today)
            .OrderByDescending(l => l.ClockInTime)
            .FirstOrDefaultAsync();

        if (log == null)
            return NotFound();

        return Ok(new
        {
            status = log.Status,
            clockInTime = log.ClockInTime,
            clockOutTime = log.ClockOutTime
        });
    }

    // HR View Attendance by Employee Email or ID
    [Authorize(Roles = "HR")]
    [HttpGet("attendance/{search}")]
    public async Task<IActionResult> GetAttendanceBySearch(string search)
    {
        var hrCompanyId = int.Parse(User.FindFirst("CompanyId").Value);

        var employee = await _context.Employees
            .Where(e => e.CompanyId == hrCompanyId &&
                        (e.Email == search || e.Id.ToString() == search))
            .FirstOrDefaultAsync();

        if (employee == null)
            return NotFound("Employee not found in your company.");

        var logs = await _context.AttendanceLogs
            .Where(l => l.EmployeeId == employee.Id)
            .OrderByDescending(l => l.ClockInTime)
            .ToListAsync();

        return Ok(logs);
    }

    [Authorize(Roles = "HR")]
    [HttpGet("today-log/{employeeId}")]
    public async Task<IActionResult> GetTodayLogForEmployee(int employeeId)
    {
        var today = GetRiyadhTime().Date;

        var log = await _context.AttendanceLogs
            .Where(l => l.EmployeeId == employeeId && l.ClockInTime.Date == today)
            .OrderByDescending(l => l.ClockInTime)
            .FirstOrDefaultAsync();

        if (log == null)
            return NotFound();

        return Ok(new
        {
            status = log.Status,
            clockInTime = log.ClockInTime,
            clockOutTime = log.ClockOutTime
        });
    }

    [Authorize(Roles = "Employee")]
    [HttpGet("my-attendance")]
    public async Task<IActionResult> GetMyAttendance()
    {
        var employeeIdClaim = User.FindFirst("employeeId");
        if (employeeIdClaim == null)
        {
            return Unauthorized("Employee ID not found in token.");
        }

        var employeeId = int.Parse(employeeIdClaim.Value);

        var logs = await _context.AttendanceLogs
            .Where(log => log.EmployeeId == employeeId)
            .OrderBy(log => log.ClockInTime)
            .ToListAsync();

        if (logs == null || logs.Count == 0)
        {
            return NotFound("No attendance logs found for this employee.");
        }

        var result = logs.Select(log => new
        {
            status = log.Status,
            clockInTime = log.ClockInTime,
            clockOutTime = log.ClockOutTime
        });

        return Ok(result);
    }

    [Authorize(Roles = "HR")]
    [HttpPost("process-absences")]
    public async Task<IActionResult> ProcessAbsences()
    {
        var yesterday = GetRiyadhTime().Date.AddDays(-1);

        var allEmployees = await _context.Employees.ToListAsync();

        foreach (var emp in allEmployees)
        {
            // Skip if they already have an attendance log for yesterday
            bool hasLog = await _context.AttendanceLogs.AnyAsync(log =>
                log.EmployeeId == emp.Id && log.ClockInTime.Date == yesterday);

            // Skip if they had approved leave (sick or other) on that date
            bool hasApprovedLeave = await _context.LeaveRequests.AnyAsync(l =>
                l.EmployeeId == emp.Id &&
                l.Status == "Approved" &&
                l.StartDate.Date <= yesterday && l.EndDate.Date >= yesterday);

            if (!hasLog && !hasApprovedLeave)
            {
                // Apply absence penalties
                emp.AbsenceDays = Math.Max(0, emp.AbsenceDays - 1);
                emp.AttendanceStreak = 0;
                emp.Rating -= 10;

                // Log absence entry
                _context.AttendanceLogs.Add(new AttendanceLog
                {
                    EmployeeId = emp.Id,
                    ClockInTime = yesterday,
                    ClockOutTime = null,
                    WorkedHours = 0,
                    Status = "absent"
                });
            }
        }

        await _context.SaveChangesAsync();

    return Ok("Absence check completed.");
    }
}
