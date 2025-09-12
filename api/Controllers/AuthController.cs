using Microsoft.AspNetCore.Mvc;
using api.Service;
using api.Models;

namespace api.Controllers;

[ApiController]
[Route("auth")]
public class AuthController : ControllerBase 
{
    private readonly AuthService _service;
    public AuthController(AuthService service) 
    {
        this._service = service;
    }

    [HttpPost("signup")]
    public async Task<IResult> SignUp(RecordUser user)
    {
        var result = await _service.SignUp(user);

        if(!result.Success) 
            return Results.BadRequest(new { message = result.Message });

        return Results.Ok(result);
    } 

    [HttpPost("sign")]
    public async Task<IResult> Sign(SignUser model)
    {
        var result = await _service.Sigin(model);

        if(!result.Success)
            return Results.BadRequest(new { message = result.Message });

        return Results.Ok(result.Data);
    }
}
