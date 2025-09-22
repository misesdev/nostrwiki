
export function filterMediaLinks(content: string) {
    // Regex para capturar URLs (http/https)
    const urlRegex = /(https?:\/\/[^\s]+)/gi;
    // Extensões de mídia suportadas
    const mediaExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.mp4', '.mov', '.webm', '.mkv'];

    let firstMedia = '';
    let match;

    while ((match = urlRegex.exec(content)) !== null) {
        const url = match[0];
        // Extrair parte antes de ? ou &
        const urlPath = url.split(/[?&]/)[0].toLowerCase();
        // Checar se termina com extensão de mídia
        if (mediaExtensions.some(ext => urlPath.endsWith(ext))) {
            firstMedia = url;
            break;
        }
    }

    if (!firstMedia) return content; // Nenhuma mídia encontrada

    // Remover todas as mídias exceto a primeira
    const result = content.replace(urlRegex, (url) => {
        const urlPath = url.split(/[?&]/)[0].toLowerCase();
        if (mediaExtensions.some(ext => urlPath.endsWith(ext))) {
            return url === firstMedia ? url : '';
        }
        return url; // não mídia, manter
    });

    // Limpar espaços extras
    return result.replace(/\s{2,}/g, ' ').trim();
}


export function removeMediaLinks(content: string): string {
    // Regex para pegar URLs (simples, suporta query params)
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    return content.replace(urlRegex, (url) => {
        // Verifica extensão de imagem ou vídeo
        if (url.match(/\.(jpe?g|png|gif|webp|mp4|mov|webm|avi|mkv)(\?.*)?$/i)) {
            return ''; // remove link
        }
        return url; // mantém outros links
    });
}

export const hashtagsFromContent = (content: string): string[] => {
    // Regex: Search for a #word that:
    // - is NOT at the beginning of the line followed by a space (# Heading)
    // - is NOT ## or ### (Markdown headings)
    // - We allow letters, numbers, underscores, and hyphens in the hashtag
    const regex = /(^|\s)#(?!#)([\p{L}\p{N}_-]+)/gu;
    const matches: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = regex.exec(content)) !== null) {
        matches.push(match[2].toLowerCase());
    }

    return matches;
}

export const stripMarkdownLinks = (content: string): string => {
  return content
    // remove images ![alt](url) → url
    .replace(/!\[.*?\]\((https?:\/\/[^\s)]+)\)/g, "$1")
    // remove links [text](url) → url
    .replace(/\[.*?\]\((https?:\/\/[^\s)]+)\)/g, "$1")
}

export const isStandaloneLink = (text: string, link: string): boolean => {
      const regex = new RegExp(`(^|\\n)\\s*${link}\\s*($|\\n)`)
      return regex.test(text)
}
