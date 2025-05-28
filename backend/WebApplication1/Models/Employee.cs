using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebApplication1.Models
{
    public class Employee
    {
        [Key]
        public int Id { get; set; } // Primary Key

        [Required]
        public string FullName { get; set; } = string.Empty;

        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Role { get; set; } = "Employee"; // 



        [ForeignKey("Company")]
        public int CompanyId { get; set; } // Foreign Key
        public Company? Company { get; set; } // Navigation Property

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        [Required]
        public string PhoneNumber { get; set; } = string.Empty;

        [Required]
        public string Position { get; set; } = string.Empty;

        public decimal Salary { get; set; }

        public int SickVacationDays { get; set; } = 14;

        public int AnnualVacationDays { get; set; } = 14;

        public int AbsenceDays { get; set; } = 3;

        public float Rating { get; set; } = 0;

        public int AttendanceStreak { get; set; } = 0;


        public bool IsEmailVerified { get; set; } = false;
        
        public string? ProfilePictureUrl { get; set; }

    }
}
