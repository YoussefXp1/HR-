using MailKit.Net.Smtp;
using MimeKit;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using System;
using System.Threading.Tasks;

namespace WebApplication1.Services
{
    public class EmailService
    {
        private readonly IConfiguration _configuration;

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task SendVerificationEmail(string recipientEmail, string token)
        {
            try
            {
                var senderEmail = _configuration["EmailSettings:SenderEmail"];
                var smtpPassword = _configuration["EmailSettings:Password"];
                var smtpServer = _configuration["EmailSettings:SmtpServer"];
                var smtpPort = _configuration["EmailSettings:Port"];

                Console.WriteLine($" SMTP Email: {senderEmail}");
                Console.WriteLine($" SMTP Password: {(string.IsNullOrEmpty(smtpPassword) ? "NULL" : "SET")}");
                Console.WriteLine($" SMTP Server: {smtpServer}");
                Console.WriteLine($" SMTP Port: {smtpPort}");

                if (string.IsNullOrEmpty(senderEmail) || string.IsNullOrEmpty(smtpPassword) || 
                    string.IsNullOrEmpty(smtpServer) || string.IsNullOrEmpty(smtpPort))
                {
                    throw new Exception("SMTP configuration is incomplete. Check your appsettings.json or environment variables.");
                }

                var email = new MimeMessage();
                email.From.Add(new MailboxAddress("HR Horizon", senderEmail));
                email.To.Add(new MailboxAddress("", recipientEmail));
                email.Subject = "Verify Your Email";

                //Set the body as HTML to make the link clickable
                email.Body = new TextPart("html")
                {
                     Text = $"<p>Click the link below to verify your email:</p> " +
                             $"<a href='{_configuration["AppUrl"]}/api/company/verify-email?token={token}' target='_blank' rel='noopener noreferrer'>Verify Email</a>"
                };


                using (var client = new SmtpClient())
                {
                    Console.WriteLine("🚀 Connecting to SMTP server...");

                    await client.ConnectAsync(smtpServer, int.Parse(smtpPort), SecureSocketOptions.StartTls);

                    Console.WriteLine("✅ SMTP server connected!");

                    await client.AuthenticateAsync(senderEmail, smtpPassword);

                    Console.WriteLine("✅ Authentication successful!");

                    await client.SendAsync(email);
                    await client.DisconnectAsync(true);

                    Console.WriteLine("📧 Email sent successfully!");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Failed to send email: {ex.Message}");
                throw;
            }
        }
    }
}
