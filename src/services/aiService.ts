import axios from 'axios';
import { AIGeneratedContent, DetectedObject } from '../types';

// This service generates product listing information using AI
// You'll need to add your own API key for OpenAI, Anthropic Claude, or another AI service

const AI_API_KEY = 'YOUR_AI_API_KEY_HERE'; // Replace with your actual API key
const AI_API_URL = 'https://api.openai.com/v1/chat/completions'; // Or use Claude API

export class AIService {
  /**
   * Generate comprehensive listing information based on detected object
   */
  static async generateListingContent(
    detectedObject: DetectedObject,
    imageBase64?: string
  ): Promise<AIGeneratedContent> {
    try {
      // For demo purposes, we'll use rule-based generation
      // In production, replace this with actual AI API calls
      const mockContent = this.getMockContent(detectedObject.class);

      // Uncomment below to use actual AI API (OpenAI example)
      /*
      const response = await axios.post(
        AI_API_URL,
        {
          model: 'gpt-4-vision-preview', // or 'gpt-4' for text-only
          messages: [
            {
              role: 'system',
              content: 'You are a marketplace listing expert. Generate compelling product listings.'
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Generate a Facebook Marketplace listing for a ${detectedObject.class}.
                         Provide: 1) catchy title, 2) detailed description, 3) suggested price in USD,
                         4) category, 5) estimated condition. Format as JSON.`
                },
                ...(imageBase64 ? [{
                  type: 'image_url',
                  image_url: { url: `data:image/jpeg;base64,${imageBase64}` }
                }] : [])
              ]
            }
          ],
          max_tokens: 500
        },
        {
          headers: {
            'Authorization': `Bearer ${AI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const aiResponse = JSON.parse(response.data.choices[0].message.content);
      return aiResponse;
      */

      return mockContent;
    } catch (error) {
      console.error('Error generating listing content:', error);
      // Fallback to basic generation
      return this.getMockContent(detectedObject.class);
    }
  }

  /**
   * Generate price suggestion based on object type and condition
   */
  static async suggestPrice(
    objectClass: string,
    condition: string
  ): Promise<number> {
    // In production, this would query a price database or use AI
    const basePrices: Record<string, number> = {
      laptop: 400,
      phone: 200,
      tablet: 150,
      book: 10,
      chair: 50,
      table: 100,
      television: 250,
      camera: 300,
      watch: 100,
      bicycle: 150,
      shoe: 40,
      backpack: 30,
      default: 25
    };

    const conditionMultiplier: Record<string, number> = {
      new: 1.0,
      'like-new': 0.85,
      good: 0.65,
      fair: 0.45,
      poor: 0.25
    };

    const basePrice = basePrices[objectClass.toLowerCase()] || basePrices.default;
    const multiplier = conditionMultiplier[condition] || 0.65;

    return Math.round(basePrice * multiplier);
  }

  /**
   * Mock content generator for demo purposes
   */
  private static getMockContent(objectClass: string): AIGeneratedContent {
    const templates: Record<string, Partial<AIGeneratedContent>> = {
      laptop: {
        title: 'High-Performance Laptop - Great Condition',
        description: 'Selling my reliable laptop in excellent working condition. Perfect for students or professionals. Comes with charger. No scratches on screen. Battery holds charge well. Smoke-free home.',
        category: 'Electronics',
        condition: 'good',
        suggestedPrice: 400,
        tags: ['laptop', 'computer', 'electronics', 'work from home']
      },
      phone: {
        title: 'Smartphone - Unlocked and Ready to Use',
        description: 'Well-maintained smartphone, unlocked and works with all carriers. Screen protector installed. Minimal wear. Includes original charger. Great for calls, texts, and apps.',
        category: 'Electronics',
        condition: 'good',
        suggestedPrice: 200,
        tags: ['phone', 'smartphone', 'mobile', 'unlocked']
      },
      book: {
        title: 'Book in Great Condition',
        description: 'Gently used book from smoke-free home. Pages are clean with no writing or highlighting. Perfect for reading or collecting.',
        category: 'Books & Media',
        condition: 'like-new',
        suggestedPrice: 10,
        tags: ['book', 'reading', 'literature']
      },
      chair: {
        title: 'Comfortable Chair - Home/Office Use',
        description: 'Sturdy and comfortable chair suitable for dining room, office, or bedroom. Clean and well-maintained. No rips or stains.',
        category: 'Furniture',
        condition: 'good',
        suggestedPrice: 50,
        tags: ['chair', 'furniture', 'seating', 'home']
      }
    };

    const template = templates[objectClass.toLowerCase()] || {
      title: `${this.capitalizeFirst(objectClass)} for Sale`,
      description: `Quality ${objectClass} in good condition. Well-maintained and ready for a new home. Priced to sell quickly. Pick up only. Cash preferred.`,
      category: 'General',
      condition: 'good',
      suggestedPrice: 25,
      tags: [objectClass.toLowerCase(), 'for sale']
    };

    return template as AIGeneratedContent;
  }

  private static capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
