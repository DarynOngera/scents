import currencyData from '../data/currencies.json';

class LocationService {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours
  }

  /**
   * Get user's location and determine currency
   * @returns {Promise<{country: string, currency: string, detected: boolean}>}
   */
  async detectLocationAndCurrency() {
    try {
      // Check cache first
      const cached = this.getCachedLocation();
      if (cached) {
        return cached;
      }

      // Try multiple detection methods
      const location = await this.tryMultipleDetectionMethods();
      
      if (location) {
        const currency = this.getCurrencyForCountry(location.country);
        const result = {
          country: location.country,
          currency: currency,
          detected: true,
          method: location.method
        };
        
        // Cache the result
        this.cacheLocation(result);
        return result;
      }

      // Fallback to default currency
      return this.getFallbackCurrency();
    } catch (error) {
      console.warn('Location detection failed:', error);
      return this.getFallbackCurrency();
    }
  }

  /**
   * Try multiple methods to detect location
   */
  async tryMultipleDetectionMethods() {
    const methods = [
      () => this.detectViaIPAPI(),
      () => this.detectViaGeolocation(),
      () => this.detectViaTimezone(),
      () => this.detectViaLanguage()
    ];

    for (const method of methods) {
      try {
        const result = await method();
        if (result && result.country) {
          return result;
        }
      } catch (error) {
        console.warn('Detection method failed:', error);
        continue;
      }
    }

    return null;
  }

  /**
   * Detect location via IP geolocation API
   */
  async detectViaIPAPI() {
    try {
      const response = await fetch('https://ipapi.co/json/', {
        timeout: 5000
      });
      
      if (!response.ok) {
        throw new Error('IP API request failed');
      }
      
      const data = await response.json();
      
      if (data.country_code) {
        return {
          country: data.country_code.toUpperCase(),
          method: 'ip-api',
          city: data.city,
          region: data.region
        };
      }
    } catch (error) {
      // Try alternative IP service
      try {
        const response = await fetch('https://api.country.is/', {
          timeout: 5000
        });
        const data = await response.json();
        
        if (data.country) {
          return {
            country: data.country.toUpperCase(),
            method: 'country-is'
          };
        }
      } catch (altError) {
        throw new Error('All IP detection services failed');
      }
    }
  }

  /**
   * Detect location via browser geolocation API
   */
  async detectViaGeolocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Geolocation timeout'));
      }, 10000);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          clearTimeout(timeout);
          try {
            const { latitude, longitude } = position.coords;
            
            // Use reverse geocoding to get country
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            
            const data = await response.json();
            
            if (data.countryCode) {
              resolve({
                country: data.countryCode.toUpperCase(),
                method: 'geolocation',
                coordinates: { latitude, longitude }
              });
            } else {
              reject(new Error('Could not determine country from coordinates'));
            }
          } catch (error) {
            reject(error);
          }
        },
        (error) => {
          clearTimeout(timeout);
          reject(error);
        },
        {
          timeout: 10000,
          enableHighAccuracy: false,
          maximumAge: 600000 // 10 minutes
        }
      );
    });
  }

  /**
   * Detect location via timezone
   */
  async detectViaTimezone() {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      // Map common timezones to countries
      const timezoneCountryMap = {
        'America/New_York': 'US',
        'America/Los_Angeles': 'US',
        'America/Chicago': 'US',
        'America/Denver': 'US',
        'Europe/London': 'GB',
        'Europe/Paris': 'FR',
        'Europe/Berlin': 'DE',
        'Europe/Rome': 'IT',
        'Europe/Madrid': 'ES',
        'Asia/Tokyo': 'JP',
        'Asia/Shanghai': 'CN',
        'Asia/Kolkata': 'IN',
        'Australia/Sydney': 'AU',
        'Africa/Nairobi': 'KE',
        'Africa/Lagos': 'NG',
        'Africa/Cairo': 'EG',
        'Africa/Johannesburg': 'ZA'
      };

      const country = timezoneCountryMap[timezone];
      
      if (country) {
        return {
          country: country,
          method: 'timezone',
          timezone: timezone
        };
      }

      // Extract country from timezone string
      const parts = timezone.split('/');
      if (parts.length >= 2) {
        const region = parts[0];
        const city = parts[1];
        
        // Basic region to country mapping
        const regionCountryMap = {
          'America': 'US',
          'Europe': 'GB', // Default to UK for Europe
          'Asia': 'CN',   // Default to China for Asia
          'Africa': 'KE', // Default to Kenya for Africa
          'Australia': 'AU'
        };
        
        const countryGuess = regionCountryMap[region];
        if (countryGuess) {
          return {
            country: countryGuess,
            method: 'timezone-region',
            timezone: timezone
          };
        }
      }

      throw new Error('Could not determine country from timezone');
    } catch (error) {
      throw new Error('Timezone detection failed');
    }
  }

  /**
   * Detect location via browser language
   */
  async detectViaLanguage() {
    try {
      const languages = navigator.languages || [navigator.language];
      const primaryLanguage = languages[0];
      
      // Map language codes to likely countries
      const languageCountryMap = {
        'en-US': 'US',
        'en-GB': 'GB',
        'en-CA': 'CA',
        'en-AU': 'AU',
        'fr-FR': 'FR',
        'fr-CA': 'CA',
        'de-DE': 'DE',
        'es-ES': 'ES',
        'it-IT': 'IT',
        'ja-JP': 'JP',
        'zh-CN': 'CN',
        'hi-IN': 'IN',
        'sw-KE': 'KE',
        'ar-EG': 'EG'
      };

      const country = languageCountryMap[primaryLanguage];
      
      if (country) {
        return {
          country: country,
          method: 'language',
          language: primaryLanguage
        };
      }

      // Try base language without region
      const baseLanguage = primaryLanguage.split('-')[0];
      const baseLanguageMap = {
        'en': 'US',
        'fr': 'FR',
        'de': 'DE',
        'es': 'ES',
        'it': 'IT',
        'ja': 'JP',
        'zh': 'CN',
        'hi': 'IN',
        'sw': 'KE',
        'ar': 'EG'
      };

      const baseCountry = baseLanguageMap[baseLanguage];
      if (baseCountry) {
        return {
          country: baseCountry,
          method: 'base-language',
          language: primaryLanguage
        };
      }

      throw new Error('Could not determine country from language');
    } catch (error) {
      throw new Error('Language detection failed');
    }
  }

  /**
   * Get currency for a country code
   */
  getCurrencyForCountry(countryCode) {
    for (const [currencyCode, currencyInfo] of Object.entries(currencyData.currencies)) {
      if (currencyInfo.countries.includes(countryCode)) {
        return currencyCode;
      }
    }
    return currencyData.fallbackCurrency;
  }

  /**
   * Get fallback currency when detection fails
   */
  getFallbackCurrency() {
    return {
      country: 'US',
      currency: currencyData.fallbackCurrency,
      detected: false,
      method: 'fallback'
    };
  }

  /**
   * Cache location result
   */
  cacheLocation(result) {
    const cacheData = {
      ...result,
      timestamp: Date.now()
    };
    
    localStorage.setItem('kidida_location_cache', JSON.stringify(cacheData));
    this.cache.set('location', cacheData);
  }

  /**
   * Get cached location if valid
   */
  getCachedLocation() {
    try {
      // Check memory cache first
      const memoryCache = this.cache.get('location');
      if (memoryCache && (Date.now() - memoryCache.timestamp) < this.cacheExpiry) {
        return memoryCache;
      }

      // Check localStorage cache
      const cached = localStorage.getItem('kidida_location_cache');
      if (cached) {
        const data = JSON.parse(cached);
        if (data.timestamp && (Date.now() - data.timestamp) < this.cacheExpiry) {
          this.cache.set('location', data);
          return data;
        }
      }
    } catch (error) {
      console.warn('Cache retrieval failed:', error);
    }
    
    return null;
  }

  /**
   * Clear location cache
   */
  clearCache() {
    this.cache.clear();
    localStorage.removeItem('kidida_location_cache');
  }

  /**
   * Manually set currency (for user override)
   */
  setManualCurrency(currencyCode) {
    const result = {
      country: 'MANUAL',
      currency: currencyCode,
      detected: false,
      method: 'manual'
    };
    
    this.cacheLocation(result);
    return result;
  }
}

// Export singleton instance
export const locationService = new LocationService();
export default locationService;
