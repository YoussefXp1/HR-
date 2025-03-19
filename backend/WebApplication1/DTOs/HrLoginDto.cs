namespace WebApplication1.DTOs
{

    public class HRLoginDto
    {
        public string Email { get; set; } = string.Empty; //HR uses their company email to log in
        public string Password { get; set; } = string.Empty; //Entered password for authentication
    }
}