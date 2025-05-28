using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebApplication1.Migrations
{
    /// <inheritdoc />
    public partial class UpdateEmployeeModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AbsenceDays",
                table: "Employees",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "AnnualVacationDays",
                table: "Employees",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "PhoneNumber",
                table: "Employees",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Position",
                table: "Employees",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<float>(
                name: "Rating",
                table: "Employees",
                type: "real",
                nullable: false,
                defaultValue: 0f);

            migrationBuilder.AddColumn<decimal>(
                name: "Salary",
                table: "Employees",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "SickVacationDays",
                table: "Employees",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AbsenceDays",
                table: "Employees");

            migrationBuilder.DropColumn(
                name: "AnnualVacationDays",
                table: "Employees");

            migrationBuilder.DropColumn(
                name: "PhoneNumber",
                table: "Employees");

            migrationBuilder.DropColumn(
                name: "Position",
                table: "Employees");

            migrationBuilder.DropColumn(
                name: "Rating",
                table: "Employees");

            migrationBuilder.DropColumn(
                name: "Salary",
                table: "Employees");

            migrationBuilder.DropColumn(
                name: "SickVacationDays",
                table: "Employees");
        }
    }
}
