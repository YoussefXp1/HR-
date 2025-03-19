using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace WebApplication1.Models;


public class Company
{
    [Key]
    public int Id { get; set; } //Primary Key

    [Required, EmailAddress]
    public string BusinessEmail { get; set; } = string.Empty;//Used for login

    [Required]
    public string PasswordHash { get; set; } = string.Empty;//Hashed password for security

    [Required]
    public string CompanyName { get; set; } = string.Empty;

    [Required]
    public string CompanyAddress { get; set; } = string.Empty;

    public int NumberOfEmployees { get; set; }
    
    public bool IsEmailVerified { get; set; } = false; 


    [Required, MaxLength(36)]
    public string CompanyIdentifier { get; set; } = Guid.NewGuid().ToString();// Unique Company ID

    public ICollection<Employee> Employees { get; set; } = new List<Employee>(); // Relationship with Employees
}
