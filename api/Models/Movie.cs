using System.ComponentModel.DataAnnotations;

namespace api.Models;

public class Movie : BaseModel
{
    public string Title { get; set; } = string.Empty; 
    public string Director { get; set; } = string.Empty;
    public int Stock { get; set; }
    public string CoverSource { get; set; } = string.Empty;
    public string Source { get; set; } = string.Empty;
}

public class RecordMovie {
    [Required(ErrorMessage = "`Title` é um campo obrigatório")]
    [MinLength(6, ErrorMessage = "`Title` deve ter um tamanho mínimo de 6 caracteres")]
    public string Title { get; set; } = string.Empty;
    [Required(ErrorMessage = "`Director` é um campo obrigatório")]
    [MinLength(6, ErrorMessage = "`Director` deve ter um tamanho mínimo de 6 caracteres")]
    public string Director { get; set; } = string.Empty;
    [Required(ErrorMessage = "`Stock` é um campo obrigatório!")]
    [Range(1, int.MaxValue, ErrorMessage = "`Stock` deve ser maior que zero")]
    public int Stock { get; set; }
    [Url(ErrorMessage = "A url informada em `CoverSource` está inválida")]
    public string CoverSource { get; set; } = string.Empty;
    [Url(ErrorMessage = "A url informada em `Source` está inválida")]
    public string Source { get; set; } = string.Empty;
}

public class MovieSearch {
    [Required(ErrorMessage = "`SearchTerm` é um campo obrigatório")]
    [MinLength(3, ErrorMessage = "`SearchTerm` deve ter pelo menos 3 caracteres")]
    public string SearchTerm { get; set; } = string.Empty;
    [Range(1, int.MaxValue, ErrorMessage = "`Page` deve ser maior que zero")]
    public int Page { get; set; }
    [Range(1, int.MaxValue, ErrorMessage = "`ItemsPerPage` deve ser maior que zero")]
    public int ItemsPerPage { get; set; }
}


