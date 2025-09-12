using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;

namespace api.Models.Validations;

public class PasswordAttribute : ValidationAttribute
{
    public int MinimumLength { get; set; } = 6;
    public int MaximumLength { get; set; } = 50;
    public bool RequireUppercase { get; set; } = true;
    public bool RequireLowercase { get; set; } = true;
    public bool RequireDigit { get; set; } = true;
    public bool RequireSpecialCharacter { get; set; } = false;

    public PasswordAttribute() 
    {
        ErrorMessage = "A senha não atende aos critérios de segurança.";
    }

    protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
    {
        var password = value as string ?? string.Empty;

        if (password.Length < MinimumLength || password.Length > MaximumLength)
            return new ValidationResult($"A senha deve ter entre {MinimumLength} e {MaximumLength} caracteres.");

        if (RequireUppercase && !Regex.IsMatch(password, "[A-Z]"))
            return new ValidationResult("A senha deve conter pelo menos uma letra maiúscula.");

        if (RequireLowercase && !Regex.IsMatch(password, "[a-z]"))
            return new ValidationResult("A senha deve conter pelo menos uma letra minúscula.");

        if (RequireDigit && !Regex.IsMatch(password, "[0-9]"))
            return new ValidationResult("A senha deve conter pelo menos um número.");

        if (RequireSpecialCharacter && !Regex.IsMatch(password, "[^a-zA-Z0-9]"))
            return new ValidationResult("A senha deve conter pelo menos um caractere especial.");

        return ValidationResult.Success;
    }
}
