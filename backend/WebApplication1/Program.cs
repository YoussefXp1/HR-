using WebApplication1.Data;
using WebApplication1.Services; // ✅ Add this for EmailService
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

//1.Add Database Context
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

//2.Add CORS Policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy =>
        {
            policy.WithOrigins("http://localhost:5173") //React app URL
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials(); //Allow credentials (important for authentication)
        });
});

//3.Add Authentication & JWT Configuration
var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException("JWT Key is missing from configuration");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

//4. Add Authorization
builder.Services.AddAuthorization();

//5 Add Email Service (Register EmailService)
builder.Services.AddScoped<EmailService>();

//6.Add Controllers & Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// 7.Enable CORS (Place before authentication & authorization)
app.UseCors("AllowReactApp");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

//8. Enable Authentication & Authorization Middleware
app.UseHttpsRedirection();
app.UseAuthentication(); //Authentication Middleware
app.UseAuthorization();  // Authorization Middleware
app.UseDeveloperExceptionPage();

app.MapControllers();
app.Run();
