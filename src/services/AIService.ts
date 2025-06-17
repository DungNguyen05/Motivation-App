// Import API key from environment
import { MotivationCategory } from '../types';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'YOUR_FIXED_API_KEY_HERE';

export interface MotivationAnalysis {
  motivations: {
    message: string;
    scheduledTime: Date;
    category: MotivationCategory;
  }[];
  totalMotivations: number;
  strategy: string;
}

export class AIService {
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

  constructor() {
    // No need for API key parameter, using fixed key
  }

  private async queryGemini(prompt: string): Promise<any> {
    try {
      const requestBody = {
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      };

      console.log('🚀 Sending request to Google Gemini 2.0...');

      const response = await fetch(`${this.baseUrl}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.log('❌ Error Response:', JSON.stringify(errorData, null, 2));
        
        if (response.status === 400) {
          if (errorData.error?.message?.includes('API_KEY_INVALID')) {
            throw new Error('API key không hợp lệ. Vui lòng kiểm tra cấu hình.');
          } else if (errorData.error?.message?.includes('quota')) {
            throw new Error('Đã vượt quá giới hạn API. Vui lòng thử lại sau.');
          } else {
            throw new Error(`Lỗi API: ${errorData.error?.message || 'Yêu cầu không hợp lệ'}`);
          }
        } else if (response.status === 429) {
          throw new Error('Quá nhiều yêu cầu. Vui lòng thử lại sau.');
        } else {
          throw new Error(`Yêu cầu Gemini API thất bại: ${response.status} ${response.statusText}`);
        }
      }

      const result = await response.json();
      console.log('✅ Gemini Response received');
      
      if (result.candidates && result.candidates.length > 0 && result.candidates[0].content) {
        const content = result.candidates[0].content.parts[0].text;
        console.log('✅ Extracted Content:', content);
        return content;
      }
      
      console.log('❌ No valid content in response');
      throw new Error('Không nhận được phản hồi từ Gemini');
    } catch (error) {
      console.error('❌ Error calling Gemini API:', error);
      throw error;
    }
  }

  private parseTimeframe(timeframe: string): { days: number } {
    const lower = timeframe.toLowerCase();
    
    if (lower.includes('week') || lower.includes('tuần')) {
      const weeks = parseInt(lower.match(/\d+/)?.[0] || '1');
      return { days: weeks * 7 };
    } else if (lower.includes('month') || lower.includes('tháng')) {
      const months = parseInt(lower.match(/\d+/)?.[0] || '1');
      return { days: months * 30 };
    } else if (lower.includes('year') || lower.includes('năm')) {
      const years = parseInt(lower.match(/\d+/)?.[0] || '1');
      return { days: years * 365 };
    } else {
      return { days: 30 }; // Default to 1 month
    }
  }

  async analyzeGoal(goal: string, timeframe: string): Promise<MotivationAnalysis> {
    try {
      const prompt = `Tạo kế hoạch động lực cho mục tiêu này: "${goal}" trong thời gian ${timeframe}.

Trả lời CHÍNH XÁC theo định dạng JSON này (không có văn bản khác):

{
  "strategy": "Chiến lược của bạn ở đây (100-200 từ bằng tiếng Việt)",
  "motivations": [
    {
      "message": "Lời nhắc động lực cụ thể bằng tiếng Việt",
      "days_from_now": 1,
      "category": "Start"
    },
    {
      "message": "Lời nhắc động lực khác",
      "days_from_now": 7,
      "category": "Daily"
    }
  ]
}

Tạo 8-15 lời nhắc động lực. Sử dụng các danh mục: Start, Daily, Weekly Review, Motivation, Completion.
Mỗi lời nhắc phải cụ thể, truyền cảm hứng và phù hợp với mục tiêu "${goal}".
Viết tất cả bằng tiếng Việt, tích cực và động lực.`;

      console.log('🎯 Analyzing Goal with Gemini 2.0:', goal);
      
      const aiResponse = await this.queryGemini(prompt);

      // Try to parse JSON response
      let parsedResponse;
      try {
        // Look for JSON in the response
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const cleanResponse = jsonMatch[0];
          console.log('🧹 Cleaned JSON:', cleanResponse);
          parsedResponse = JSON.parse(cleanResponse);
        } else {
          console.log('❌ No JSON found in response');
          throw new Error('Không tìm thấy JSON trong phản hồi AI');
        }
      } catch (parseError) {
        console.log('❌ Failed to parse JSON:', parseError);
        
        // Fallback: create motivations from text response
        return this.createFallbackMotivations(goal, timeframe);
      }

      // Validate response
      if (!parsedResponse.strategy || !parsedResponse.motivations || !Array.isArray(parsedResponse.motivations)) {
        console.log('❌ Invalid response structure:', parsedResponse);
        return this.createFallbackMotivations(goal, timeframe);
      }

      // Convert to our format
      const now = new Date();
      const motivations = parsedResponse.motivations.map((motivation: any) => {
        const daysFromNow = parseInt(motivation.days_from_now) || 1;
        const scheduledTime = new Date(now.getTime() + daysFromNow * 24 * 60 * 60 * 1000);
        
        // Set times based on category
        switch (motivation.category) {
          case 'Start':
            scheduledTime.setHours(9, 0, 0, 0);
            break;
          case 'Daily':
            scheduledTime.setHours(8, 0, 0, 0);
            break;
          case 'Weekly Review':
            scheduledTime.setHours(10, 0, 0, 0);
            break;
          case 'Motivation':
            scheduledTime.setHours(20, 0, 0, 0);
            break;
          case 'Completion':
            scheduledTime.setHours(18, 0, 0, 0);
            break;
          default:
            scheduledTime.setHours(12, 0, 0, 0);
        }

        return {
          message: motivation.message || `Hãy làm việc cho mục tiêu: ${goal}`,
          scheduledTime,
          category: (motivation.category || 'Motivation') as MotivationCategory
        };
      });

      console.log('✅ Successfully parsed AI response:', {
        strategy: parsedResponse.strategy.substring(0, 50) + '...',
        motivationCount: motivations.length
      });

      return {
        motivations,
        totalMotivations: motivations.length,
        strategy: parsedResponse.strategy,
      };

    } catch (error) {
      console.error('❌ Error in analyzeGoal:', error);
      
      // Fallback to basic motivations if AI fails
      return this.createFallbackMotivations(goal, timeframe);
    }
  }

  private createFallbackMotivations(goal: string, timeframe: string): MotivationAnalysis {
    console.log('🔄 Creating fallback motivations for:', goal);
    
    const now = new Date();
    const { days } = this.parseTimeframe(timeframe);
    
    const motivationTemplates = [
      { message: `🚀 Bắt đầu hành trình chinh phục mục tiêu: ${goal}!`, days: 0, category: 'Start' as MotivationCategory, hour: 9 },
      { message: `💪 Hôm nay là ngày tuyệt vời để tiến gần hơn đến mục tiêu: ${goal}`, days: 1, category: 'Daily' as MotivationCategory, hour: 8 },
      { message: `⭐ Bạn đang làm rất tốt! Tiếp tục phấn đấu cho ${goal}`, days: 3, category: 'Motivation' as MotivationCategory, hour: 20 },
      { message: `📊 Đã 1 tuần rồi! Hãy đánh giá tiến độ mục tiêu: ${goal}`, days: 7, category: 'Weekly Review' as MotivationCategory, hour: 10 },
      { message: `🔥 Đừng bỏ cuộc! ${goal} đang chờ bạn chinh phục`, days: 10, category: 'Motivation' as MotivationCategory, hour: 19 },
      { message: `🌟 Mỗi bước nhỏ đều quan trọng cho mục tiêu: ${goal}`, days: 14, category: 'Daily' as MotivationCategory, hour: 8 },
      { message: `💎 Bạn đã tiến bộ rất nhiều rồi! Tiếp tục cho ${goal}`, days: 21, category: 'Motivation' as MotivationCategory, hour: 20 },
      { message: `🏆 Sắp hoàn thành rồi! ${goal} đang rất gần`, days: Math.floor(days * 0.8), category: 'Completion' as MotivationCategory, hour: 18 },
    ];

    const motivations = motivationTemplates
      .filter(template => template.days <= days)
      .map(template => {
        const scheduledTime = new Date(now.getTime() + template.days * 24 * 60 * 60 * 1000);
        scheduledTime.setHours(template.hour, 0, 0, 0);
        
        return {
          message: template.message,
          scheduledTime,
          category: template.category
        };
      });

    return {
      motivations,
      totalMotivations: motivations.length,
      strategy: `Kế hoạch động lực cho mục tiêu "${goal}" trong ${timeframe}. Bạn sẽ nhận được những lời nhắc tích cực để duy trì động lực và theo dõi tiến độ hàng ngày.`,
    };
  }

  // Test Gemini connection (no longer needed for users, but kept for debugging)
  async testConnection(): Promise<boolean> {
    try {
      console.log('🧪 Testing Gemini 2.0 API connection...');
      
      const result = await this.queryGemini('Xin chào, vui lòng trả lời "Kết nối thành công" để kiểm tra API.');
      console.log('🧪 Test result:', result);
      
      const isSuccessful = result && result.length > 0;
      console.log('🧪 Connection test:', isSuccessful ? '✅ PASSED' : '❌ FAILED');
      
      return isSuccessful;
    } catch (error) {
      console.error('🧪 API test failed:', error);
      return false;
    }
  }
}