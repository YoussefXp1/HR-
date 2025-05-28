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

        public async Task SendVerificationEmail(string recipientEmail, string verificationLink)
        {
            try
            {
                var senderEmail = _configuration["EmailSettings:SenderEmail"];
                var smtpPassword = _configuration["EmailSettings:Password"];
                var smtpServer = _configuration["EmailSettings:SmtpServer"];
                var smtpPort = _configuration["EmailSettings:Port"];

                //Console.WriteLine($" SMTP Email: {senderEmail}");
                //Console.WriteLine($" SMTP Password: {(string.IsNullOrEmpty(smtpPassword) ? "NULL" : "SET")}");
                //Console.WriteLine($" SMTP Server: {smtpServer}");
                //Console.WriteLine($" SMTP Port: {smtpPort}");

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
                     Text = $@"
                        <p>Thank you for registering with HR Horizon.</p>
                        <p>Click the link below to verify your email address:</p>
                        <a href='{verificationLink}' target='_blank' rel='noopener noreferrer'>Verify Email</a>
                        <p>This link will expire in 24 hours.</p>"
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
        public async Task SendDocumentRequestEmail(string recipientEmail, string employeeName, List<string> requestedDocuments, string additionalDetails)
        {
            var senderEmail = _configuration["EmailSettings:SenderEmail"];
            var smtpPassword = _configuration["EmailSettings:Password"];
            var smtpServer = _configuration["EmailSettings:SmtpServer"];
            var smtpPort = _configuration["EmailSettings:Port"];

            var email = new MimeMessage();
            email.From.Add(new MailboxAddress("HR Horizon", senderEmail));
            email.To.Add(new MailboxAddress(employeeName, recipientEmail));  // Assuming the employee's name is passed
            email.Subject = "Document Request from HR";

            // Create a string with the requested documents and additional details
            var documentsList = string.Join("<br/>", requestedDocuments);
            var emailBody = $@"
            <p>Dear {employeeName},</p>
            <p>The HR department has requested the following documents from you:</p>
            <ul>
                {documentsList}
            </ul>
            <p><strong>Additional Details:</strong> {additionalDetails}</p>
            <p>Please submit the requested documents as soon as possible.</p>
            <p>Thank you,</p>
            <p>HR Horizon</p>
        ";

        email.Body = new TextPart("html")
        {
            Text = emailBody
        };

        // Sending the email
        using var client = new SmtpClient();
        await client.ConnectAsync(smtpServer, int.Parse(smtpPort), SecureSocketOptions.StartTls);
        await client.AuthenticateAsync(senderEmail, smtpPassword);
        await client.SendAsync(email);
        await client.DisconnectAsync(true);
        }
    



        ///
        public async Task SendCustomEmail(string recipientEmail, string subject, string htmlContent)
        {
            var senderEmail = _configuration["EmailSettings:SenderEmail"];
            var smtpPassword = _configuration["EmailSettings:Password"];
            var smtpServer = _configuration["EmailSettings:SmtpServer"];
            var smtpPort = _configuration["EmailSettings:Port"];

            var email = new MimeMessage();
            email.From.Add(new MailboxAddress("HR Horizon", senderEmail));
            email.To.Add(MailboxAddress.Parse(recipientEmail));
            email.Subject = subject;

            email.Body = new TextPart("html") { Text = htmlContent };

            using var client = new SmtpClient();
            await client.ConnectAsync(smtpServer, int.Parse(smtpPort), SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(senderEmail, smtpPassword);
            await client.SendAsync(email);
            await client.DisconnectAsync(true);
        }




    }
}
