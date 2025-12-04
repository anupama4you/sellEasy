import axios from 'axios';
import { AIGeneratedContent } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OPENAI_API_KEY } from '@env';

const CHATGPT_API_KEY_STORAGE = '@selleasy:chatgpt_api_key';

export class ChatGPTService {
  private static apiKey: string | null = null;

  /**
   * Set the API key for ChatGPT
   */
  static async setApiKey(key: string): Promise<void> {
    this.apiKey = key;
    await AsyncStorage.setItem(CHATGPT_API_KEY_STORAGE, key);
  }

  /**
   * Get the stored API key
   * Priority: 1. User-configured key, 2. Environment variable, 3. null
   */
  static async getApiKey(): Promise<string | null> {
    // Check in-memory cache first
    if (this.apiKey) {
      return this.apiKey;
    }

    // Check user-configured key in AsyncStorage
    const storedKey = await AsyncStorage.getItem(CHATGPT_API_KEY_STORAGE);
    if (storedKey && storedKey.length > 0) {
      this.apiKey = storedKey;
      return this.apiKey;
    }

    // Fallback to environment variable
    if (OPENAI_API_KEY && OPENAI_API_KEY !== 'your_openai_api_key_here') {
      this.apiKey = OPENAI_API_KEY;
      return this.apiKey;
    }

    return null;
  }

  /**
   * Check if API key is configured
   */
  static async hasApiKey(): Promise<boolean> {
    const key = await this.getApiKey();
    return key !== null && key.length > 0;
  }

  /**
   * Get API key source (for debugging/display)
   */
  static async getApiKeySource(): Promise<'user' | 'env' | 'none'> {
    const storedKey = await AsyncStorage.getItem(CHATGPT_API_KEY_STORAGE);
    if (storedKey && storedKey.length > 0) {
      return 'user';
    }

    if (OPENAI_API_KEY && OPENAI_API_KEY !== 'your_openai_api_key_here') {
      return 'env';
    }

    return 'none';
  }

  /**
   * Analyze image and generate listing content using ChatGPT Vision API
   */
  static async analyzeImage(imageUri: string): Promise<AIGeneratedContent> {
    const apiKey = await this.getApiKey();
    if (!apiKey) {
      throw new Error('ChatGPT API key not configured. Please add it in Settings.');
    }

    try {
      // Convert image to base64
      const base64Image = await this.convertImageToBase64(imageUri);

      // Call ChatGPT Vision API
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are an expert at analyzing product images and creating compelling marketplace listings. Provide detailed, accurate, and SEO-friendly descriptions.'
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Analyze this product image and provide:
1. A catchy, SEO-friendly title (max 80 characters)
2. A detailed description highlighting key features, condition, and benefits (150-300 words)
3. Estimated fair market price in AUD based on condition and features
4. Most appropriate category from: Electronics, Furniture, Clothing, Home & Garden, Toys & Games, Sports, Books, Automotive, Other
5. Condition assessment: new, like-new, good, fair, or poor
6. Relevant tags/keywords (5-10 tags)

Format your response as JSON:
{
  "title": "...",
  "description": "...",
  "suggestedPrice": 0,
  "category": "...",
  "condition": "...",
  "tags": ["tag1", "tag2", ...]
}`
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`
                  }
                }
              ]
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Parse the JSON response
      const content = response.data.choices[0].message.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        throw new Error('Failed to parse AI response');
      }

      const aiContent: AIGeneratedContent = JSON.parse(jsonMatch[0]);

      // Validate and sanitize the response
      return {
        title: aiContent.title || 'Product for Sale',
        description: aiContent.description || 'Quality item in good condition',
        suggestedPrice: Math.max(0, aiContent.suggestedPrice || 0),
        category: aiContent.category || 'Other',
        condition: this.validateCondition(aiContent.condition),
        tags: Array.isArray(aiContent.tags) ? aiContent.tags : []
      };

    } catch (error: any) {
      console.error('ChatGPT API Error:', error);

      if (error.response?.status === 401) {
        throw new Error('Invalid API key. Please check your ChatGPT API key in Settings.');
      }

      if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a few moments.');
      }

      throw new Error('Failed to analyze image. Please try again.');
    }
  }

  /**
   * Analyze multiple images and generate comprehensive listing
   */
  static async analyzeMultipleImages(imageUris: string[]): Promise<AIGeneratedContent> {
    const apiKey = await this.getApiKey();
    if (!apiKey) {
      throw new Error('ChatGPT API key not configured. Please add it in Settings.');
    }

    try {
      // Convert all images to base64
      const base64Images = await Promise.all(
        imageUris.map(uri => this.convertImageToBase64(uri))
      );

      // Build the content array with all images
      const imageContent = base64Images.map(base64 => ({
        type: 'image_url' as const,
        image_url: {
          url: `data:image/jpeg;base64,${base64}`
        }
      }));

      // Call ChatGPT Vision API with multiple images
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'You are an expert at analyzing product images and creating compelling marketplace listings. Analyze all provided images to create the most accurate and detailed listing.'
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Analyze these ${imageUris.length} product images and provide:
1. A catchy, SEO-friendly title that captures the main product (max 80 characters)
2. A comprehensive description highlighting all visible features, condition, and benefits. Mention details from all images. (200-400 words)
3. Estimated fair market price in AUD based on condition and features
4. Most appropriate category from: Electronics, Furniture, Clothing, Home & Garden, Toys & Games, Sports, Books, Automotive, Other
5. Overall condition assessment: new, like-new, good, fair, or poor
6. Relevant tags/keywords (7-15 tags)

Format your response as JSON:
{
  "title": "...",
  "description": "...",
  "suggestedPrice": 0,
  "category": "...",
  "condition": "...",
  "tags": ["tag1", "tag2", ...]
}`
                },
                ...imageContent
              ]
            }
          ],
          max_tokens: 1500,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Parse the JSON response
      const content = response.data.choices[0].message.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        throw new Error('Failed to parse AI response');
      }

      const aiContent: AIGeneratedContent = JSON.parse(jsonMatch[0]);

      return {
        title: aiContent.title || 'Product for Sale',
        description: aiContent.description || 'Quality item in good condition',
        suggestedPrice: Math.max(0, aiContent.suggestedPrice || 0),
        category: aiContent.category || 'Other',
        condition: this.validateCondition(aiContent.condition),
        tags: Array.isArray(aiContent.tags) ? aiContent.tags : []
      };

    } catch (error: any) {
      console.error('ChatGPT API Error:', error);

      if (error.response?.status === 401) {
        throw new Error('Invalid API key. Please check your ChatGPT API key in Settings.');
      }

      if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a few moments.');
      }

      throw new Error('Failed to analyze images. Please try again.');
    }
  }

  /**
   * Convert image URI to base64
   */
  private static async convertImageToBase64(imageUri: string): Promise<string> {
    try {
      // Fetch the image
      const response = await fetch(imageUri);
      const blob = await response.blob();

      // Convert to base64
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          // Remove the data:image/...;base64, prefix
          const base64Data = base64.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting image to base64:', error);
      throw new Error('Failed to process image');
    }
  }

  /**
   * Validate condition value
   */
  private static validateCondition(condition: string): 'new' | 'like-new' | 'good' | 'fair' | 'poor' {
    const validConditions = ['new', 'like-new', 'good', 'fair', 'poor'];
    const normalized = condition?.toLowerCase();

    if (validConditions.includes(normalized)) {
      return normalized as any;
    }

    return 'good'; // Default fallback
  }

  /**
   * Test API connection
   */
  static async testConnection(): Promise<boolean> {
    const apiKey = await this.getApiKey();
    if (!apiKey) {
      return false;
    }

    try {
      const response = await axios.get(
        'https://api.openai.com/v1/models',
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`
          },
          timeout: 5000
        }
      );

      return response.status === 200;
    } catch (error) {
      console.error('API connection test failed:', error);
      return false;
    }
  }
}
