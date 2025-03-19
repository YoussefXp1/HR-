using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace WebApplication1.Models;

public class Employee
{
    [Key]
    public int Id { get; set; } // Primary Key

    [Required]
    public string Name { get; set; } = string.Empty;

    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Role { get; set; } = string.Empty;//"HR" or "Employee"

    [Required]
    public string EmployeeIdentifier { get; set; } = string.Empty;//Unique Employee ID for login

    [ForeignKey("Company")]
    public int CompanyId { get; set; } //Foreign Key
    public Company? Company { get; set; }//Navigation Property

    [Required]
    public string PasswordHash { get; set; } = string.Empty;
}
