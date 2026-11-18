// Formatea un número como pesos colombianos: 4500 -> $4.500
export const money = (n: number) => `$${Number(n).toLocaleString("es-CO")}`;
