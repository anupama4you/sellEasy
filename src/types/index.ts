export interface DetectedObject {
  class: string;
  confidence: number;
}

export interface ProductListing {
  id?: string;
  title: string;
  description: string;
  price: number;
  suggestedPrice?: number;
  category: string;
  condition: 'new' | 'like-new' | 'good' | 'fair' | 'poor';
  imageUri: string;
  detectedObject?: DetectedObject;
  location?: string;
  createdAt?: Date;
}

export interface AIGeneratedContent {
  title: string;
  description: string;
  suggestedPrice: number;
  category: string;
  condition: 'new' | 'like-new' | 'good' | 'fair' | 'poor';
  tags: string[];
}

export interface FacebookMarketplaceConfig {
  accessToken: string;
  pageId: string;
}

export type RootStackParamList = {
  Home: undefined;
  Camera: undefined;
  Preview: { listing: ProductListing };
  Settings: undefined;
};
