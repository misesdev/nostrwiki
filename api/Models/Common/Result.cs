
namespace api.Models.Common;

public class Result<Entity> {
    public int Page { get; set; }
    public int TotalPages { get; set; }
    public int TotalItems { get; set; }
    public int ItemsPerPage { get; set; }
    public List<Entity> Items { get; set; } = new List<Entity>();
}
