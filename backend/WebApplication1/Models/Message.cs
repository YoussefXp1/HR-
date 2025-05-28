using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using WebApplication1.Models;
public class Message
{
    public int Id { get; set; }
    public int SenderId { get; set; }
    public int ReceiverId { get; set; }
    public string? SenderRole { get; set; } // "HR" or "Employee"
    public string? ReceiverRole { get; set; }
    public string? Content { get; set; }
    public DateTime Timestamp { get; set; }
    public int CompanyId { get; set; }

    public bool IsSeen { get; set; } = false; // new property for read receipt

}
