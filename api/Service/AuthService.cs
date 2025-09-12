using api.Data;
using api.Models;
using api.Models.Common;
using api.Extentios;

namespace api.Service;

public class AuthService : BaseService<User> 
{
    private readonly PasswordService _password;
    private readonly TokenService _token;

    public AuthService(AppDbContex context, PasswordService password, TokenService token) : base(context) {
        this._password = password;
        this._token = token;
    }

    public async Task<Response<UserDTO>> SignUp(RecordUser model) 
    {
        var exists = await base.Exists(u => u.Email == model.Email);

        if(exists)
            return Response<UserDTO>.Fail("E-mail já existente! (Jamais seria exibido em cenário real)!");

        var entity = new User {
            Name = model.Name,
            Email = model.Email,
            Salt = _password.GenerateSalt(),
        };

        entity.PasswordHash = _password.HashPassword(model.Password, entity.Salt);

        await base.AddAsync(entity);

        return Response<UserDTO>.Ok("Usuário cadastrado com sucesso!", entity.ToDto());
    }

    public async Task<Response<UserAuth>> Sigin(SignUser model) 
    {
        var user = await base.FindAsync(u => u.Email == model.Email);

        if(user == null) 
            return Response<UserAuth>.Fail("E-mail ou senha inválidos!");

        if(!_password.VerifyPassword(model.Password, user.PasswordHash, user.Salt))
            return Response<UserAuth>.Fail("E-mail ou senha inválidos!");
        
        return Response<UserAuth>.Ok("Usuário autenticado!", new UserAuth {
            Auth = true,
            User = user.ToDto(),
            Token = _token.GenerateToken(user)
        });
    }
}
