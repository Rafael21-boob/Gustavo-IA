/**
 * Formata um valor numérico para a moeda brasileira (BRL / R$).
 * Exemplo: 125000 -> "R$ 125.000,00"
 */
export function formatCurrency(value) {
  const number = Number(value);
  if (isNaN(number)) return 'R$ 0,00';

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(number);
}

/**
 * Formata data em formato legível pt-BR
 */
export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}
