using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using WebApplication1.Models;

public class DocumentRequest
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int CompanyId { get; set; }

    
    public int EmployeeId { get; set; }  // No navigation property

    [Required]
    public int HRId { get; set; }        // No navigation property

    public string? EmployeeEmail { get; set; }

    [Required]
    public string RequestedDocuments { get; set; }

    public string? AdditionalDetails { get; set; }

    public bool IsCompleted { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public string? UploadedDocumentPath { get; set; } // Or use byte[] if storing in DB


    
}


