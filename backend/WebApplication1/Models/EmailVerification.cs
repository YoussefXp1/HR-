using System;

namespace WebApplication1.Models
{
    public class EmailVerification
    {
        public int Id { get; set; }
        public string? Email { get; set; }
        public string? Token { get; set; }
        public DateTime Expiration { get; set; }
        public bool IsVerified { get; set; } = false;
        public DateTime ExpiryDate { get; set; }

    }
}
