namespace WebApplication1.DTOs

{
    public class MessageDto
    {   
    public int SenderId { get; set; }
    public int ReceiverId { get; set; }
    public string Content { get; set; } = string.Empty;
    public string SenderRole { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    public string ReceiverRole { get; set; } = string.Empty;
    }


}