using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebApplication1.Models
{
    public class LeaveRequest
    {
        [Key]
        public int Id { get; set; }

        [ForeignKey("Employee")]
        public int EmployeeId { get; set; }

        [Required]
        public int CompanyId { get; set; }  

        [MaxLength(50)]
        public string? LeaveType { get; set; } //"Annual", "Sick", "Unpaid"

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        [MaxLength(500)]
        public string? Reason { get; set; }

        [MaxLength(20)]
        public string? Status { get; set; } //"Pending", "Approved", "Rejected"

        public DateTime RequestDate { get; set; } = DateTime.UtcNow;

        public Employee? Employee { get; set; }
    }
}
