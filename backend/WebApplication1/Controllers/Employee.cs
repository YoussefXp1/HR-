using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using WebApplication1.DTOs;
using WebApplication1.Models;
using WebApplication1.Data;

[Route("api/employee")]
[ApiController]
public class EmployeeController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public EmployeeController(ApplicationDbContext context)
    {
        _context = context;
    }

    //Login Employee
    [HttpPost("login")]
    public async Task<IActionResult> LoginEmployee([FromBody] EmployeeLoginDto request)
    {
        var employee = await _context.Employees.FirstOrDefaultAsync(e => e.EmployeeIdentifier == request.EmployeeIdentifier);

        if (employee == null || !VerifyPassword(request.Password, employee.PasswordHash))
            return Unauthorized("Invalid Employee ID or Password.");

        return Ok(new { message = "Login Successful", employeeId = employee.EmployeeIdentifier, role = employee.Role });
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
