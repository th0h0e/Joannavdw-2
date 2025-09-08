import PocketBase from 'pocketbase';

// PocketBase client configuration
const pb = new PocketBase('https://admin.kontext.site');

export default pb;

// Helper function to get image URLs
export const getImageUrl = (record: any, filename: string) => {
  return pb.files.getURL(record, filename);
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