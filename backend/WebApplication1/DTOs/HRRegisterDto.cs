namespace WebApplication1.DTOs
{

    public class HRRegisterDto
    {
        public string BusinessEmail { get; set; } = string.Empty; //HR inherits this from company signup
        public string Password { get; set; } = string.Empty; //Inherited password
        public int CompanyId { get; set; } //Links HR to the correct company
    }
}