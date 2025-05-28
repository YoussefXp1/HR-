namespace WebApplication1.DTOs
{
    public class EventDto
{
    public string? Title { get; set; }
    public string? Date { get; set; }
    public string? Time { get; set; }
    public string? Location { get; set; }
    public string? Description { get; set; }
    public string? Tags { get; set; } // Comma-separated
    public string? Category { get; set; }
    public IFormFile? Image { get; set; }
}



}