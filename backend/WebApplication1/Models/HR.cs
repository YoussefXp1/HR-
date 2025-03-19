using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using WebApplication1.Models;
public class HR
{
    public int Id { get; set; }
    public string Email { get; set; }= string.Empty; // Inherited from signup
    public string PasswordHash { get; set; }= string.Empty; // Inherited from signup
    public string FullName { get; set; }= string.Empty; // HR can update after login
    public string PhoneNumber { get; set; } = string.Empty;// Optional, added later
    public int CompanyId { get; set; } // Foreign key linking to Companies table
    public string Role { get;  set; } = "HR"; //Always set to "HR"
    public Company? Company { get; set; } // Navigation property
    public bool IsEmailVerified { get; set; } = false; 

}
