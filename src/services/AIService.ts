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

      console.log('Sending request to Google Gemini...');

      const response = await fetch(`${this.baseUrl}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.log('Error Response:', JSON.stringify(errorData, null, 2));
        
        if (response.status === 400) {
          if (errorData.error?.message?.includes('API_KEY_INVALID')) {
            throw new Error('API key không hợp lệ. Vui lòng kiểm tra cấu hình trong file .env');
          } else if (errorData.error?.message?.includes('quota')) {
            throw new Error('Đã vượt quá giới hạn API hôm nay. Vui lòng thử lại vào ngày mai.');
          } else {
            throw new Error(`Lỗi API: ${errorData.error?.message || 'Yêu cầu không hợp lệ'}`);
          }
        } else if (response.status === 429) {
          throw new Error('Quá nhiều yêu cầu. Vui lòng đợi vài phút và thử lại.');
        } else if (response.status === 403) {
          throw new Error('API key không có quyền truy cập. Vui lòng kiểm tra cấu hình API key.');
        } else {
          throw new Error(`Không thể kết nối với AI: ${response.status} ${response.statusText}`);
        }
      }

      const result = await response.json();
      console.log('Gemini Response received');
      
      if (result.candidates && result.candidates.length > 0 && result.candidates[0].content) {
        const content = result.candidates[0].content.parts[0].text;
        console.log('Extracted Content:', content);
        return content;
      }
      
      console.log('No valid content in response');
      throw new Error('AI không trả về nội dung hợp lệ. Vui lòng thử lại.');
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('Không thể kết nối với AI. Vui lòng kiểm tra kết nối internet và thử lại.');
      }
    }
  }

  async generateGreeting(timeOfDay: string): Promise<string> {
    const prompt = `Generate a meaningful, friendly greeting in English for ${timeOfDay} time.

Requirements:
- Must be a proper, meaningful greeting (not nonsense like "night night")
- Should be warm and welcoming
- Maximum 3 words
- Examples:
  * Morning: "Good morning", "Rise and shine", "Morning sunshine"
  * Afternoon: "Good afternoon", "Pleasant afternoon", "Lovely afternoon" 
  * Evening: "Good evening", "Evening greetings", "Wonderful evening"
  * Night: "Good night", "Sweet dreams", "Peaceful night"
- Do not include punctuation
Return ONLY the greeting text, no quotes or extra words.`;

    const response = await this.queryGemini(prompt);
    
    const greeting = response.trim().replace(/['"]/g, '').split('\n')[0];
    
    if (greeting && greeting.length > 0 && greeting.length < 20) {
      return greeting;
    }
    
    throw new Error('Invalid greeting generated');
  }

  async analyzeGoal(goal: string, timeframe?: string): Promise<MotivationAnalysis> {
    try {
      if (!goal || !goal.trim()) {
        throw new Error('Vui lòng nhập mục tiêu của bạn.');
      }

      const timeframeText = timeframe 
        ? `trong thời gian ${timeframe}` 
        : `(hãy tự động đề xuất thời gian phù hợp dựa trên mục tiêu)`;

      const prompt = `Tạo kế hoạch động lực cho mục tiêu này: "${goal}" ${timeframeText}.

Trả lời CHÍNH XÁC theo định dạng JSON này (không có văn bản khác):

{
  "strategy": "Chiến lược của bạn ở đây (100-200 từ bằng tiếng Việt)",
  "recommended_timeframe": "${timeframe || 'thời gian AI đề xuất (ví dụ: 3 months)'}",
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

${timeframe ? 
  `Tạo 8-15 lời nhắc động lực phù hợp với thời gian ${timeframe}.` :
  `Tự động đề xuất thời gian phù hợp cho mục tiêu "${goal}" và tạo 8-15 lời nhắc động lực.`
}

Sử dụng các danh mục: Start, Daily, Weekly Review, Motivation, Completion.
Mỗi lời nhắc phải cụ thể, truyền cảm hứng và phù hợp với mục tiêu "${goal}".
Viết tất cả bằng tiếng Việt, tích cực và động lực. KHÔNG thêm markdown hay định dạng khác.`;

      console.log('Analyzing Goal with Gemini:', goal, timeframe ? `(${timeframe})` : '(auto timeframe)');
      
      const aiResponse = await this.queryGemini(prompt);

      let parsedResponse;
      try {
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const cleanResponse = jsonMatch[0];
          console.log('Cleaned JSON:', cleanResponse);
          parsedResponse = JSON.parse(cleanResponse);
        } else {
          console.log('No JSON found in response');
          throw new Error('AI không trả về định dạng đúng. Vui lòng thử lại.');
        }
      } catch (parseError) {
        console.log('Failed to parse JSON:', parseError);
        throw new Error('AI trả về định dạng không hợp lệ. Vui lòng thử lại với mục tiêu khác hoặc đơn giản hóa mục tiêu.');
      }

      if (!parsedResponse.strategy || typeof parsedResponse.strategy !== 'string') {
        throw new Error('AI không tạo được chiến lược. Vui lòng thử lại.');
      }

      if (!parsedResponse.motivations || !Array.isArray(parsedResponse.motivations) || parsedResponse.motivations.length === 0) {
        throw new Error('AI không tạo được lời nhắc động lực. Vui lòng thử lại.');
      }

      const validMotivations = parsedResponse.motivations.filter((motivation: any) => {
        return motivation.message && 
               typeof motivation.message === 'string' && 
               motivation.message.trim().length > 0 &&
               typeof motivation.days_from_now === 'number' &&
               motivation.days_from_now > 0 &&
               motivation.category &&
               ['Start', 'Daily', 'Weekly Review', 'Motivation', 'Completion'].includes(motivation.category);
      });

      if (validMotivations.length === 0) {
        throw new Error('AI tạo ra lời nhắc không hợp lệ. Vui lòng thử lại với mục tiêu cụ thể hơn.');
      }

      if (validMotivations.length < 5) {
        throw new Error('AI tạo quá ít lời nhắc. Vui lòng thử lại hoặc mô tả mục tiêu chi tiết hơn.');
      }

      const now = new Date();
      const motivations = validMotivations.map((motivation: any) => {
        const daysFromNow = parseInt(motivation.days_from_now) || 1;
        const scheduledTime = new Date(now.getTime() + daysFromNow * 24 * 60 * 60 * 1000);
        
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
          message: motivation.message.trim(),
          scheduledTime,
          category: motivation.category as MotivationCategory
        };
      });

      console.log('Successfully parsed AI response:', {
        strategy: parsedResponse.strategy.substring(0, 50) + '...',
        recommendedTimeframe: parsedResponse.recommended_timeframe || 'not specified',
        motivationCount: motivations.length
      });

      return {
        motivations,
        totalMotivations: motivations.length,
        strategy: parsedResponse.strategy.trim(),
      };

    } catch (error) {
      console.error('Error in analyzeGoal:', error);
      
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('Có lỗi không xác định xảy ra. Vui lòng thử lại.');
      }
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      console.log('Testing Gemini API connection...');
      
      const result = await this.queryGemini('Xin chào, vui lòng trả lời "Kết nối thành công" để kiểm tra API.');
      console.log('Test result:', result);
      
      const isSuccessful = result && result.length > 0;
      console.log('Connection test:', isSuccessful ? 'PASSED' : 'FAILED');
      
      return isSuccessful;
    } catch (error) {
      console.error('API test failed:', error);
      return false;
    }
  }
}