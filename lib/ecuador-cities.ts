export const ECUADOR_CITIES = [
  'Quito, Ecuador',
  'Guayaquil, Ecuador',
  'Cuenca, Ecuador',
  'Santo Domingo, Ecuador',
  'Machala, Ecuador',
  'Manta, Ecuador',
  'Portoviejo, Ecuador',
  'Ambato, Ecuador',
  'Riobamba, Ecuador',
  'Loja, Ecuador',
  'Quevedo, Ecuador',
  'Milagro, Ecuador',
  'Ibarra, Ecuador',
  'Esmeraldas, Ecuador',
  'Latacunga, Ecuador',
  'Tulcán, Ecuador',
  'Azogues, Ecuador',
  'Zamora, Ecuador',
  'Tena, Ecuador',
  'Puyo, Ecuador',
  'Macas, Ecuador',
  'Nueva Loja, Ecuador',
  'Babahoyo, Ecuador',
  'Chone, Ecuador',
  'Salinas, Ecuador',
  'Otavalo, Ecuador',
  'Cayambe, Ecuador',
  'Guaranda, Ecuador',
  'Bahía de Caráquez, Ecuador',
  'Atención virtual',
] as const;

export function filterCities(query: string, max = 8): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return ECUADOR_CITIES.slice(0, max);
  return ECUADOR_CITIES.filter((c) => c.toLowerCase().includes(q)).slice(0, max);
}
