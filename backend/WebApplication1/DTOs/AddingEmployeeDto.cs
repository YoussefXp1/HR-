namespace WebApplication1.DTOs
{
    

public class AddingEmployeeDto
{
    public string FullName { get; set; } = string.Empty;

    public string Position { get; set; } = string.Empty;
    public string Email { get; set; }  = string.Empty;
    public string? Phone { get; set; }
}
}