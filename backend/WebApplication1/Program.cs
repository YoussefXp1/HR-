using WebApplication1.Data;
using WebApplication1.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;
using WebApplication1.Hubs;

var builder = WebApplication.CreateBuilder(args);

// 1. Add Database Context
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// 2. Add CORS Policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy =>
        {
            policy.WithOrigins("http://localhost:5173")
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials()
                  .SetIsOriginAllowed(_ => true); // Helps prevent CORS issues
        });
});

// 3. Add Authentication & JWT Configuration
var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException("JWT Key is missing from configuration");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {   
        options.RequireHttpsMetadata = true;
        options.SaveToken = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            RoleClaimType = ClaimTypes.Role,
        };
    });

// 4. Add Authorization
builder.Services.AddAuthorization();

// 5. Add Email Service
builder.Services.AddScoped<EmailService>();

// 6. Add Controllers & Swagger
builder.Services.AddControllers();
builder.Services.AddSignalR();  // Add this line
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// 7. Enable CORS (Place before authentication & authorization)
app.UseCors("AllowReactApp");

// Middleware to extract JWT from cookies and attach it to Authorization header
app.Use(async (context, next) =>
{
    var token = context.Request.Cookies["jwt"];
    if (!string.IsNullOrEmpty(token))
    {
        context.Request.Headers.Authorization = "Bearer " + token;
    }
    await next();
});

// 8. Enable Authentication & Authorization Middleware
app.UseHttpsRedirection();
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();
app.UseDeveloperExceptionPage();
app.UseStaticFiles();


app.MapControllers();
app.MapHub<ChatHub>("/chathub");

app.Run();
