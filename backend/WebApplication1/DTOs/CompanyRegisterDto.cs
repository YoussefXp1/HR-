namespace WebApplication1.DTOs
{
    public class CompanyRegisterDto
    {
        public string BusinessEmail { get; set; } = string.Empty;
        public string Password { get; set; }= string.Empty;
        public string CompanyName { get; set; }= string.Empty;
        public string CompanyAddress{ get; set; } = string.Empty;
        public int NumberOfEmployees{ get; set; } = 0;

        
        

    }
}
