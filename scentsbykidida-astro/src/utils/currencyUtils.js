import currencyData from '../data/currencies.json';
import { locationService } from './locationService.js';

class CurrencyUtils {
  constructor() {
    this.currentCurrency = null;
    this.initialized = false;
  }

  /**
   * Initialize currency system
   */
  async initialize() {
    if (this.initialized) return;
    
    try {
      const locationData = await locationService.detectLocationAndCurrency();
      this.currentCurrency = locationData.currency;
      this.initialized = true;
      
      // Dispatch event for components to update
      window.dispatchEvent(new CustomEvent('currencyChanged', {
        detail: {
          currency: this.currentCurrency,
          locationData: locationData
        }
      }));
      
      return locationData;
    } catch (error) {
      console.error('Currency initialization failed:', error);
      this.currentCurrency = currencyData.fallbackCurrency;
      this.initialized = true;
      return null;
    }
  }

  /**
   * Convert price from base currency to target currency
   */
  convertPrice(basePrice, targetCurrency = null) {
    const currency = targetCurrency || this.currentCurrency || currencyData.fallbackCurrency;
    const currencyInfo = currencyData.currencies[currency];
    
    if (!currencyInfo) {
      console.warn(`Currency ${currency} not found, using fallback`);
      return basePrice;
    }

    // Convert from base currency (USD) to target currency
    return Math.round((basePrice * currencyInfo.rate) * 100) / 100;
  }

  /**
   * Format price with currency symbol and proper formatting
   */
  formatPrice(price, targetCurrency = null, options = {}) {
    const currency = targetCurrency || this.currentCurrency || currencyData.fallbackCurrency;
    const currencyInfo = currencyData.currencies[currency];
    
    if (!currencyInfo) {
      console.warn(`Currency ${currency} not found, using fallback`);
      return `$${price.toFixed(2)}`;
    }

    const convertedPrice = this.convertPrice(price, currency);
    
    // Default formatting options
    const defaultOptions = {
      showSymbol: true,
      showCode: false,
      decimals: 2,
      thousandsSeparator: ',',
      decimalSeparator: '.'
    };
    
    const formatOptions = { ...defaultOptions, ...options };
    
    // Format the number
    let formattedNumber = this.formatNumber(convertedPrice, formatOptions);
    
    // Add currency symbol/code
    if (formatOptions.showSymbol) {
      // Handle special positioning for some currencies
      if (currency === 'EUR') {
        return `${formattedNumber}${currencyInfo.symbol}`;
      } else {
        return `${currencyInfo.symbol}${formattedNumber}`;
      }
    } else if (formatOptions.showCode) {
      return `${formattedNumber} ${currency}`;
    }
    
    return formattedNumber;
  }

  /**
   * Format number with proper separators
   */
  formatNumber(number, options) {
    const { decimals, thousandsSeparator, decimalSeparator } = options;
    
    // Round to specified decimals
    const rounded = Math.round(number * Math.pow(10, decimals)) / Math.pow(10, decimals);
    
    // Split into integer and decimal parts
    const parts = rounded.toFixed(decimals).split('.');
    
    // Add thousands separators
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);
    
    // Join with decimal separator
    return parts.join(decimalSeparator);
  }

  /**
   * Get currency info
   */
  getCurrencyInfo(currencyCode = null) {
    const currency = currencyCode || this.currentCurrency || currencyData.fallbackCurrency;
    return currencyData.currencies[currency];
  }

  /**
   * Get all available currencies
   */
  getAvailableCurrencies() {
    return Object.entries(currencyData.currencies).map(([code, info]) => ({
      code,
      ...info
    }));
  }

  /**
   * Set currency manually
   */
  async setCurrency(currencyCode) {
    if (!currencyData.currencies[currencyCode]) {
      throw new Error(`Currency ${currencyCode} is not supported`);
    }
    
    this.currentCurrency = currencyCode;
    
    // Update location service cache
    locationService.setManualCurrency(currencyCode);
    
    // Dispatch event for components to update
    window.dispatchEvent(new CustomEvent('currencyChanged', {
      detail: {
        currency: currencyCode,
        manual: true
      }
    }));
    
    return currencyCode;
  }

  /**
   * Get current currency
   */
  getCurrentCurrency() {
    return this.currentCurrency || currencyData.fallbackCurrency;
  }

  /**
   * Check if currency system is initialized
   */
  isInitialized() {
    return this.initialized;
  }

  /**
   * Get price range for filtering
   */
  getPriceRange(prices, targetCurrency = null) {
    if (!prices || prices.length === 0) return { min: 0, max: 0 };
    
    const convertedPrices = prices.map(price => this.convertPrice(price, targetCurrency));
    
    return {
      min: Math.min(...convertedPrices),
      max: Math.max(...convertedPrices)
    };
  }

  /**
   * Create price comparison object
   */
  createPriceComparison(basePrice) {
    const comparison = {};
    
    Object.keys(currencyData.currencies).forEach(currency => {
      comparison[currency] = {
        price: this.convertPrice(basePrice, currency),
        formatted: this.formatPrice(basePrice, currency),
        symbol: currencyData.currencies[currency].symbol
      };
    });
    
    return comparison;
  }

  /**
   * Get exchange rate between currencies
   */
  getExchangeRate(fromCurrency, toCurrency) {
    const fromRate = currencyData.currencies[fromCurrency]?.rate || 1;
    const toRate = currencyData.currencies[toCurrency]?.rate || 1;
    
    return toRate / fromRate;
  }

  /**
   * Format price for display in product cards
   */
  formatProductPrice(product, options = {}) {
    const defaultOptions = {
      showOriginal: false,
      showSavings: false
    };
    
    const formatOptions = { ...defaultOptions, ...options };
    const currentPrice = this.formatPrice(product.price);
    
    let priceDisplay = currentPrice;
    
    // Add original price if different currency and requested
    if (formatOptions.showOriginal && this.currentCurrency !== currencyData.baseCurrency) {
      const originalPrice = this.formatPrice(product.price, currencyData.baseCurrency);
      priceDisplay += ` (${originalPrice})`;
    }
    
    return priceDisplay;
  }

  /**
   * Get localized currency name
   */
  getLocalizedCurrencyName(currencyCode, locale = 'en') {
    try {
      return new Intl.DisplayNames([locale], { type: 'currency' }).of(currencyCode);
    } catch (error) {
      return currencyData.currencies[currencyCode]?.name || currencyCode;
    }
  }
}

// Export singleton instance
export const currencyUtils = new CurrencyUtils();
export default currencyUtils;

// Auto-initialize when module loads
if (typeof window !== 'undefined') {
  // Initialize after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      currencyUtils.initialize();
    });
  } else {
    currencyUtils.initialize();
  }
}
