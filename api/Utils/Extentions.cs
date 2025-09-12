using api.Models;

namespace api.Extentios;

public static class Extention 
{
    public static UserDTO ToDto(this User user) 
    {
        return new UserDTO {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt,
            DeletedAt = user.DeletedAt
        };
    }

    public static UserDTO ToUserDto(this UpdateUserDTO user)
    {
        return new UserDTO {
            Name = user.Name,
            Email = user.Email
        };
    }
}
