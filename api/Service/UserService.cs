using api.Data;
using api.Models;
using api.Models.Common;
using api.Extentios;

namespace api.Service;

public class UserService : BaseService<User> 
{
    private readonly PasswordService _password;
    
    public UserService(AppDbContex context, PasswordService password) : base(context) {
        this._password = password;
    }

    public async Task<Response<UserDTO>> GetUser(Guid id) 
    {
        var user = await base.GetByIdAsync(id);
        
        if(user == null)
            return Response<UserDTO>.Fail("Usuário não encontrado!");

        return Response<UserDTO>.Ok("", user.ToDto());
    }

    public async Task<Response<UserDTO>> UpdateAsync(UserDTO model)
    {
        var user = await base.GetByIdAsync(model.Id);

        if(user == null)
            return Response<UserDTO>.Fail("Usuário inexistente!");

        if(await Exists(u => u.Email == model.Email && u.Id != model.Id))
            return Response<UserDTO>.Fail("E-mail já em uso por outro usuário");

        user.Name = model.Name;
        user.Email = model.Email;
        user.UpdatedAt = DateTime.Now;

        await _dbContext.SaveChangesAsync();
        
        return Response<UserDTO>.Ok("Usuário atualizado com sucesso!", user.ToDto());
    }
}
