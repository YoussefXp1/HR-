namespace WebApplication1.DTOs
{
public class DocumentRequestDTO
{
    public int? EmployeeId { get; set; }

    public string? EmployeeName{get; set;}
    public string? EmployeeEmail { get; set;}
    public List<string> Documents { get; set; } = new();
    public string? AdditionalDetails { get; set; }
    public bool IsCompleted { get; set; }

    public DateTime CreatedAt { get; set; }

}
}