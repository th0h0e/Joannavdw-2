import PocketBase from 'pocketbase';

// PocketBase client configuration
const pb = new PocketBase('https://admin.kontext.site');

export default pb;

// Cache configuration - 4 times per day (every 6 hours)
const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

// Cache storage interface
interface CacheEntry {
  data: any;
  timestamp: number;
}

// Cache storage using localStorage
const getCacheKey = (collection: string) => `pocketbase_cache_${collection}`;

const isValidCache = (timestamp: number): boolean => {
  return Date.now() - timestamp < CACHE_DURATION;
};

export const getCachedData = <T>(collection: string): T | null => {
  try {
    const cached = localStorage.getItem(getCacheKey(collection));
    if (!cached) return null;
    
    const entry: CacheEntry = JSON.parse(cached);
    if (isValidCache(entry.timestamp)) {
      console.log(`Using cached data for ${collection} (age: ${Math.round((Date.now() - entry.timestamp) / 1000 / 60)} minutes)`);
      return entry.data;
    } else {
      // Clean up expired cache
      localStorage.removeItem(getCacheKey(collection));
      console.log(`Cache expired for ${collection}, will fetch fresh data`);
      return null;
    }
  } catch (error) {
    console.warn('Cache read error:', error);
    return null;
  }
};

export const setCachedData = (collection: string, data: any): void => {
  try {
    const entry: CacheEntry = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(getCacheKey(collection), JSON.stringify(entry));
    console.log(`Cached data for ${collection}`);
  } catch (error) {
    console.warn('Cache write error:', error);
  }
};

export const clearCache = (collection?: string): void => {
  try {
    if (collection) {
      localStorage.removeItem(getCacheKey(collection));
      console.log(`Cleared cache for ${collection}`);
    } else {
      // Clear all PocketBase caches
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('pocketbase_cache_')) {
          localStorage.removeItem(key);
        }
      });
      console.log('Cleared all PocketBase caches');
    }
  } catch (error) {
    console.warn('Cache clear error:', error);
  }
};

// Helper function to get image URLs
export const getImageUrl = (record: any, filename: string) => {
  return pb.files.getURL(record, filename);
};

// Helper function to generate dynamic project title styles
export const getProjectTitleStyle = (settings: Settings | null) => {
  const mobileFontSize = settings?.Mobile_Font_Size ?? 1.25;

  return {
    fontFamily: 'EnduroWeb, sans-serif',
    letterSpacing: '0.03em',
    fontSize: `${mobileFontSize}rem`,
    // We'll handle responsive sizes in the component CSS-in-JS or media queries
  };
};

// Helper to get responsive font size classes (for CSS-in-JS)
export const getResponsiveFontSizes = (settings: Settings | null) => {
  return {
    mobile: settings?.Mobile_Font_Size ?? 1.25,
    tablet: settings?.Tablet_Font_Size ?? 1.875,
    desktop: settings?.Desktop_Font_Size ?? 2.25,
    largeDesktop: settings?.Large_Desktop_Font_Size ?? 3,
  };
};

// Portfolio Project interface matching your PocketBase collection
export interface PortfolioProject {
  id: string;
  Title: string;
  Description: string;
  Images: string[];
  Order: number;
  Responsibility: string[];
  collectionId: string;
  collectionName: string;
  created: string;
  updated: string;
}

// Homepage interface matching your PocketBase collection
export interface Homepage {
  id: string;
  Hero_Image: string;
  Hero_Title: string;
  Is_Active: boolean;
  collectionId: string;
  collectionName: string;
  created: string;
  updated: string;
}

// About interface matching your PocketBase collection
export interface About {
  id: string;
  About_Description: string;
  Client_List: string[];
  Contact_Email: string;
  Contact_Message: string;
  Expertise_Description: string;
  Expertise_Title: string;
  Is_Active: boolean;
  Portfolio_Title: string;
  Selected_Clients_Title: string;
  collectionId: string;
  collectionName: string;
  created: string;
  updated: string;
}

// Settings interface matching your PocketBase collection
export interface Settings {
  id: string;
  Show_Top_Progress_Bar: boolean;
  Desktop_Font_Size: number;
  Large_Desktop_Font_Size: number;
  Mobile_Font_Size: number;
  Tablet_Font_Size: number;
  collectionId: string;
  collectionName: string;
  created: string;
  updated: string;
}

// API response interfaces
export interface PortfolioProjectsResponse {
  items: PortfolioProject[];
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
}

export interface HomepageResponse {
  items: Homepage[];
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
}

export interface AboutResponse {
  items: About[];
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
}

export interface SettingsResponse {
  items: Settings[];
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
}