using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebApplication1.Migrations
{
    /// <inheritdoc />
    public partial class vacationsss : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Employees_EmployeeIdentifier",
                table: "Employees");

            migrationBuilder.DropColumn(
                name: "EmployeeIdentifier",
                table: "Employees");

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "AttendanceLogs",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "EmployeeIdentifier",
                table: "Employees",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "AttendanceLogs",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Employees_EmployeeIdentifier",
                table: "Employees",
                column: "EmployeeIdentifier",
                unique: true);
        }
    }
}
