using System.Security.Cryptography;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;

namespace api.Service;

public class PasswordService {
    
    public string GenerateSalt()
    {
        var salt = new byte[16];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(salt);
        return Convert.ToBase64String(salt);
    }

    public string HashPassword(string password, string salt)
    {
        var saltBytes = Convert.FromBase64String(salt);
        var hashed = KeyDerivation.Pbkdf2(
            password: password,
            salt: saltBytes,
            prf: KeyDerivationPrf.HMACSHA256,
            iterationCount: 10000,
            numBytesRequested: 32
        );
        return Convert.ToBase64String(hashed);
    }

    public bool VerifyPassword(string password, string hash, string salt)
    {
        var hashedAttempt = this.HashPassword(password, salt);
        return hashedAttempt == hash;
    }

    public bool WeakPassword(string password) {
        return (
            password.Length <= 6 ||
            !password.Any(char.IsDigit) || // not contains numbers
            !password.Any(c => !char.IsLetterOrDigit(c))   // not contains simbols 
        );
    }
}

