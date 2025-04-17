using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace WebApplication1.Models;

public class PasswordReset
{
    public int Id {get; set;}
    public string? Email {get;set;}
    public string? Token {get; set;}
    public DateTime ExpiryDate {get; set;}
}