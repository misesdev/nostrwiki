using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using api.Service;
using api.Models;
using api.Extentios;

namespace api.Controllers;

[ApiController]
[Route("users")]
[Authorize]
public class UserController : ControllerBase 
{
    private readonly UserService _service;
    
    public UserController(UserService service) 
    {
        this._service = service;
    }

    [HttpGet("user/{id:guid}")]
    public async Task<IResult> Get(Guid id) 
    {
        var result = await _service.GetUser(id); 
        
        if(!result.Success)
            return Results.NotFound(result.Message);

        return Results.Ok(result.Data);
    }

    [HttpPost("update")]
    public async Task<IResult> Update(UpdateUserDTO user)
    {
        var model = user.ToUserDto();

        model.Id = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var result = await _service.UpdateAsync(model);

        if(!result.Success)
            return Results.BadRequest(new { message = result.Message });

        return Results.Ok(result.Data);
    }
}
