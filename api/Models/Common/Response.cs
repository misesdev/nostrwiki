
namespace api.Models.Common;

public class Response<Entity> {
    public bool Success { get; set; } = true;
    public string Message { get; set; } = string.Empty;
    public Entity? Data { get; set; }

    public static Response<Entity> Ok(string message, Entity? entity) {
        return new Response<Entity> {
            Success = true,
            Message = message,
            Data = entity
        };
    }
    
    public static Response<Entity> Fail(string message) {
        return new Response<Entity> {
            Success = false,
            Message = message
        };
    }
}
