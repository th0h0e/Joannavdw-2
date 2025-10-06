import PocketBase from 'pocketbase';

// PocketBase client configuration
const pb = new PocketBase('https://admin.kontext.site');

export default pb;

// Cache configuration - Long duration for better performance (7 days)
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

// Cache version key for invalidation
const CACHE_VERSION_KEY = 'pocketbase_cache_version';

// Cache storage interface
interface CacheEntry {
  data: any;
  timestamp: number;
  version: number;
}

// Get current cache version
const getCacheVersion = (): number => {
  try {
    const version = localStorage.getItem(CACHE_VERSION_KEY);
    return version ? parseInt(version, 10) : 1;
  } catch {
    return 1;
  }
};

// Increment cache version (called when admin updates data)
const incrementCacheVersion = (): void => {
  try {
    const currentVersion = getCacheVersion();
    localStorage.setItem(CACHE_VERSION_KEY, String(currentVersion + 1));
    console.log(`Cache version updated to ${currentVersion + 1}`);
  } catch (error) {
    console.warn('Cache version update error:', error);
  }
};

// Cache storage using localStorage
const getCacheKey = (collection: string) => `pocketbase_cache_${collection}`;

const isValidCache = (timestamp: number, version: number): boolean => {
  const notExpired = Date.now() - timestamp < CACHE_DURATION;
  const versionMatches = version === getCacheVersion();
  return notExpired && versionMatches;
};

export const getCachedData = <T>(collection: string): T | null => {
  try {
    const cached = localStorage.getItem(getCacheKey(collection));
    if (!cached) return null;

    const entry: CacheEntry = JSON.parse(cached);
    if (isValidCache(entry.timestamp, entry.version)) {
      console.log(`Using cached data for ${collection} (age: ${Math.round((Date.now() - entry.timestamp) / 1000 / 60)} minutes, version: ${entry.version})`);
      return entry.data;
    } else {
      // Clean up expired or outdated cache
      localStorage.removeItem(getCacheKey(collection));
      console.log(`Cache invalidated for ${collection} (expired or version mismatch)`);
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
      timestamp: Date.now(),
      version: getCacheVersion()
    };
    localStorage.setItem(getCacheKey(collection), JSON.stringify(entry));
    console.log(`Cached data for ${collection} with version ${entry.version}`);
  } catch (error) {
    console.warn('Cache write error:', error);
  }
};

export const clearCache = (collection?: string): void => {
  try {
    if (collection) {
      // Increment version to invalidate all caches
      incrementCacheVersion();
      // Also remove specific collection cache immediately
      localStorage.removeItem(getCacheKey(collection));
      console.log(`Cleared cache for ${collection} and incremented cache version`);
    } else {
      // Clear all PocketBase caches and increment version
      incrementCacheVersion();
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('pocketbase_cache_')) {
          localStorage.removeItem(key);
        }
      });
      console.log('Cleared all PocketBase caches and incremented cache version');
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
  Responsibility_json: string[] | null;
  collectionId: string;
  collectionName: string;
  created: string;
  updated: string;
}

// Homepage interface matching your PocketBase collection
export interface Homepage {
  id: string;
  Hero_Image: string;
  Hero_Image_Mobile: string;
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
  Client_List_Json: string[] | null;
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
  favicon?: string;
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