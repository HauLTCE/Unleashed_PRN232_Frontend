// src/utils/formatters.js

/**
 * Formats a number as VND currency, removing the decimals if they are zero.
 * @param {number} value The number to format.
 * @returns {string} The formatted currency string.
 */
export const formatVND = (value) => {
  if (typeof value !== 'number') {
    return '0 ₫';
  }

  const formatter = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  // The default formatter might add ",00". We can remove it for whole numbers.
  return formatter.format(value).replace(',00', '');
};