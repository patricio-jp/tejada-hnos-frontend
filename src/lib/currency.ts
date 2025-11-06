export const formatCurrency = (value: number) => {
    try {
      return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
    } catch {
      return `$ ${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ".").replace('.', ',')}`;
    }
  };
