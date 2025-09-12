using Microsoft.EntityFrameworkCore;
using api.Models;

namespace api.Data;

public class AppDbContex : DbContext 
{
    public AppDbContex(DbContextOptions<AppDbContex> options) : base(options) {

    }

    public DbSet<User> Users { get;set; }
    public DbSet<Movie> Movies { get;set; }
}


