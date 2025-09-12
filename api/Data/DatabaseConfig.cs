using Microsoft.EntityFrameworkCore;

namespace api.Data;

public static class DatabaseConfig {

    public static void ConfigDatabase(this WebApplicationBuilder builder)
    {
        var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
        
        builder.Services.AddDbContext<AppDbContex>(options => {
            options.UseSqlServer(connectionString);
        });
    }
}
