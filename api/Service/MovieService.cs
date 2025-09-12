using api.Data;
using api.Models;
using api.Models.Common;

namespace api.Service;

public class MovieService : BaseService<Movie> 
{
    public MovieService(AppDbContex context) : base(context) { }

    public async Task<Response<Movie>> AddAsync(RecordMovie model) 
    {
        var movie = await base.AddAsync(new Movie {
            Title = model.Title,
            Director = model.Director,
            Stock = model.Stock,
            CoverSource = model.CoverSource,
            Source = model.Source
        });

        return Response<Movie>.Ok("Filme adicionado com sucesso!", movie);
    }

    public async Task<Response<Movie>> GetById(Guid id)
    {
        var movie = await base.GetByIdAsync(id);

        if(movie == null)
            return Response<Movie>.Fail("Filme não encontrado!");

        return Response<Movie>.Ok("", movie);
    }

    public async Task<Response<Result<Movie>>> SearchByTitle(MovieSearch model) 
    {
        var lista = await base.FilterAsync(m => m.Title.Contains(model.SearchTerm));

        var items = lista?.Skip((model.Page - 1) * model.ItemsPerPage)
            .Take(model.ItemsPerPage)
            .ToList();

        var pages = (lista?.Count > model.ItemsPerPage) ?
               (int) Math.Ceiling((float)lista.Count / model.ItemsPerPage) : 1;

        var results = new Result<Movie> {
            Page = model.Page,
            ItemsPerPage = model.ItemsPerPage,
            Items = items ?? new List<Movie>(),
            TotalItems = lista?.Count ?? 0,
            TotalPages = pages
        };

        return Response<Result<Movie>>.Ok("", results);
    }

    public async Task<Response<Movie>> RentMovie(Guid id)
    {
        var movie = await base.GetByIdAsync(id);

        if(movie == null)
            return Response<Movie>.Fail("Filme não encontrado!");

        if(movie.Stock <= 0)
            return Response<Movie>.Fail("Filme indisponível em estoque!");

        return Response<Movie>.Ok("", movie);
    }
}

