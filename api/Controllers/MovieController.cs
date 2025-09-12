using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using api.Service;
using api.Models;

namespace api.Controllers;

[ApiController]
[Route("movies")]
[Authorize]
public class MovieController : ControllerBase 
{
    private readonly MovieService _service;
    public MovieController(MovieService service) 
    {
        this._service = service;
    }

    [HttpGet("movie/{id:guid}")]
    public async Task<IResult> Get(Guid id)
    {
        var result = await _service.GetById(id);

        if(!result.Success)
            return Results.BadRequest(result.Message);

        return Results.Ok(result.Data);
    }

    [HttpPost("new")]
    public async Task<IResult> Add(RecordMovie model)
    {
        var result = await _service.AddAsync(model);

        if(!result.Success)
            return Results.BadRequest(result.Message);

        return Results.Ok(result.Data);
    }

    [HttpPost("search")]
    public async Task<IResult> Search(MovieSearch model)
    {
        var result = await _service.SearchByTitle(model);

        if(!result.Success)
            return Results.BadRequest(result.Message);

        return Results.Ok(result.Data);
    }

    [HttpGet("rent/{id:guid}")]
    public async Task<IResult> Rent(Guid id) 
    {
        var result = await _service.RentMovie(id);

        if(!result.Success)
            return Results.Forbid();

        return Results.Ok(result.Data);
    }
}
