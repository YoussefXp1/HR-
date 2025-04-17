using Microsoft.EntityFrameworkCore;
using WebApplication1.Models;

namespace WebApplication1.Data // Ensure this matches your project
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<Company> Companies { get; set; }
        public DbSet<Employee> Employees { get; set; }

        public DbSet<HR> HRs { get; set; }
        public DbSet<EmailVerification> EmailVerifications { get; set; }
        public DbSet<PasswordReset> PasswordResets { get; set; }



        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Company>()
                .HasIndex(c => c.CompanyIdentifier)
                .IsUnique(); //Ensure Company ID is unique

            modelBuilder.Entity<Employee>()
                .HasIndex(e => e.EmployeeIdentifier)
                .IsUnique(); // Ensure Employee ID is unique

            modelBuilder.Entity<Company>()
                .HasIndex(c => c.BusinessEmail)
                .IsUnique(); // Ensure email is unique

            base.OnModelCreating(modelBuilder);
        }
    }
}
