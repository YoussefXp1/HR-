using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebApplication1.Models
{
    public class CompanyEvent
{
    public int Id { get; set; }
    public string? Title { get; set; }
    public string? Date { get; set; }
    public string? Time { get; set; }
    public string? Location { get; set; }
    public string? Description { get; set; }
    public string? Tags { get; set; } // Comma-separated
    public string? Category { get; set; }
    public string? ImageUrl { get; set; }
    public int CompanyId { get; set; }
}



}