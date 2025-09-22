// Constantes que devem estar definidas no seu contexto
const BITSET_SIZE = 1024; // exemplo, ajuste conforme necessidade
const HASH_PRIME = 31;
const HASH_SIZE = 65536;

// char_map pode ser um objeto com códigos mapeados
// Exemplo: const char_map: Record<number, number> = { 65: 97 } // A -> a
const char_map = new Array(256).fill(0);
/**
 * Calcula a similaridade entre dois textos com base em pares de caracteres.
 * Retorna um valor entre 0.0 e 1.0.
 */
export function textSimilarity(origin: string, compare: string): number {
    if(!origin || !compare) return 0
    const hashSet = new BigUint64Array(BITSET_SIZE);
    let intersection = 0;
    let sizePairs = 0;

    function getCharMapped(c: string) {
        const code = c.charCodeAt(0);
        return char_map[code] ? String.fromCharCode(char_map[code]) : c;
    }

    for (let i = 0; i < origin.length - 1; i++) {
        const a = getCharMapped(origin[i]);
        const b = getCharMapped(origin[i + 1]);
        const number = ((a.charCodeAt(0) * HASH_PRIME + b.charCodeAt(0)) % HASH_SIZE) >>> 0;
        const idx = Math.floor(number / 64);
        const bit = BigInt(1) << BigInt(number % 64);
        hashSet[idx] |= bit;
        sizePairs++;
    }

    for (let i = 0; i < compare.length - 1; i++) {
        const a = getCharMapped(compare[i]);
        const b = getCharMapped(compare[i + 1]);
        const number = ((a.charCodeAt(0) * HASH_PRIME + b.charCodeAt(0)) % HASH_SIZE) >>> 0;
        const idx = Math.floor(number / 64);
        const bit = BigInt(1) << BigInt(number % 64);
        if ((hashSet[idx] & bit) !== BigInt(0)) {
            intersection++;
        }
        sizePairs++;
    }

    return sizePairs > 0 ? (2.0 * intersection) / sizePairs : 0.0;}
