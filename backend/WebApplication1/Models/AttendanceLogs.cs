using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace WebApplication1.Models;


public class AttendanceLog
{
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public DateTime ClockInTime { get; set; }
    public DateTime? ClockOutTime { get; set; }
    public double? WorkedHours { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }

    public string? Status { get; set; }


    public Employee? Employee { get; set; }
}
