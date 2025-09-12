using System.ComponentModel.DataAnnotations;
using api.Models.Validations;

namespace api.Models;

public class User : BaseModel 
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Salt { get; set; } = string.Empty;
}

public class UserDTO : BaseModel {
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}

public class UserAuth {
    public bool Auth { get; set; }
    public UserDTO? User { get; set; }
    public string Token { get; set; } = string.Empty;
}

public class RecordUser {
    [Required(ErrorMessage = "`name` é um campo obrigatório`")]
    [StringLength(50, MinimumLength = 3, ErrorMessage = "`name` de entre 3 e 50 caracteres")]
    public string Name { get; set; } = string.Empty;
    [Required(ErrorMessage = "`email` é um campo obrigatório")]
    [EmailAddress(ErrorMessage = "O e-mail fornecido está inválido")]
    [StringLength(50, MinimumLength = 5, ErrorMessage = "`email` deve ter entre 5 e 50 caracteres")]
    public string Email { get; set; } = string.Empty;
    [Required(ErrorMessage = "`password` é um campo obriogatório")]
    [PasswordAttribute]
    public string Password { get; set; } = string.Empty;
}

public class SignUser {
    [Required(ErrorMessage = "`email` ém campo obrigatório")]
    [EmailAddress(ErrorMessage = "O e-mail fornecido está inválido")]
    [StringLength(50, MinimumLength = 5, ErrorMessage = "`email` deve ter entre 5 e 50 caracteres")]
    public string Email { get; set; } = string.Empty;
    [Required(ErrorMessage = "`password` é um campo obriogatório")]
    [PasswordAttribute]
    public string Password { get; set; } = string.Empty;
}

public class UpdateUserDTO {
    [Required(ErrorMessage = "`name` é um campo obrigatório`")]
    [StringLength(50, MinimumLength = 3, ErrorMessage = "`name` de entre 3 e 50 caracteres")]
    public string Name { get; set; } = string.Empty;
    [Required(ErrorMessage = "`email` é um campo obrigatório")]
    [EmailAddress(ErrorMessage = "O e-mail fornecido está inválido")]
    [StringLength(50, MinimumLength = 5, ErrorMessage = "`email` deve ter entre 5 e 50 caracteres")]
    public string Email { get; set; } = string.Empty;
}

