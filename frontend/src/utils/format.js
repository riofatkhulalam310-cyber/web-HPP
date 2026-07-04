export const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(number || 0);
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
};

export const formatNumber = (number, decimals = 2) => {
  if (number === null || number === undefined) return '0';
  return Number(number).toLocaleString('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals
  });
};
