export interface AIGoalAnalysis {
  reminders: {
    message: string;
    dateTime: Date;
    category: string;
  }[];
  totalReminders: number;
  strategy: string;
}

export class AIService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
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

      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
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
            throw new Error('Invalid API key. Please check your Gemini API key.');
          } else if (errorData.error?.message?.includes('quota')) {
            throw new Error('API quota exceeded. Please try again later.');
          } else {
            throw new Error(`API Error: ${errorData.error?.message || 'Invalid request'}`);
          }
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again in a moment.');
        } else {
          throw new Error(`Gemini API request failed: ${response.status} ${response.statusText}`);
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
      throw new Error('No response from Gemini');
    } catch (error) {
      console.error('❌ Error calling Gemini API:', error);
      throw error;
    }
  }

  private parseTimeframe(timeframe: string): { days: number } {
    const lower = timeframe.toLowerCase();
    
    if (lower.includes('week')) {
      const weeks = parseInt(lower.match(/\d+/)?.[0] || '1');
      return { days: weeks * 7 };
    } else if (lower.includes('month')) {
      const months = parseInt(lower.match(/\d+/)?.[0] || '1');
      return { days: months * 30 };
    } else if (lower.includes('year')) {
      const years = parseInt(lower.match(/\d+/)?.[0] || '1');
      return { days: years * 365 };
    } else {
      return { days: 30 }; // Default to 1 month
    }
  }

  private generateReminderSchedule(goal: string, timeframe: string): {
    message: string;
    dateTime: Date;
    category: string;
  }[] {
    const { days } = this.parseTimeframe(timeframe);
    const now = new Date();
    const reminders: { message: string; dateTime: Date; category: string; }[] = [];

    // Start reminder (1 hour from now)
    const startDate = new Date(now.getTime() + 60 * 60 * 1000);
    reminders.push({
      message: `Start working on: ${goal}`,
      dateTime: startDate,
      category: 'Start'
    });

    // Daily reminders for first week
    for (let i = 1; i <= Math.min(7, days); i++) {
      const date = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
      date.setHours(9, 0, 0, 0);
      
      reminders.push({
        message: `Daily progress: Work on ${goal}`,
        dateTime: date,
        category: 'Daily'
      });
    }

    // Weekly reviews
    const weeks = Math.floor(days / 7);
    for (let i = 1; i <= Math.min(weeks, 4); i++) {
      const date = new Date(now.getTime() + i * 7 * 24 * 60 * 60 * 1000);
      date.setHours(10, 0, 0, 0);
      
      reminders.push({
        message: `Week ${i} review: Check progress on ${goal}`,
        dateTime: date,
        category: 'Weekly Review'
      });
    }

    // Final reminder
    const finalDate = new Date(now.getTime() + (days - 1) * 24 * 60 * 60 * 1000);
    finalDate.setHours(18, 0, 0, 0);
    
    reminders.push({
      message: `Final check: Complete your goal - ${goal}!`,
      dateTime: finalDate,
      category: 'Completion'
    });

    return reminders.sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());
  }

  async analyzeGoal(goal: string, timeframe: string): Promise<AIGoalAnalysis> {
    try {
      const prompt = `Create a strategy for this goal: "${goal}" in ${timeframe}.

Respond with EXACTLY this JSON format (no other text):

{
  "strategy": "Your strategy here (100-200 words)",
  "reminders": [
    {
      "message": "Specific reminder message",
      "days_from_now": 1,
      "category": "Start"
    },
    {
      "message": "Another specific reminder",
      "days_from_now": 7,
      "category": "Weekly Review"
    }
  ]
}

Create 5-15 reminders. Use categories: Start, Daily, Weekly Review, Completion.
Make each reminder specific and actionable for the goal "${goal}".`;

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
          throw new Error('No JSON found in AI response');
        }
      } catch (parseError) {
        console.log('❌ Failed to parse JSON, using fallback:', parseError);
        throw new Error('AI response was not in valid JSON format');
      }

      // Validate response
      if (!parsedResponse.strategy || !parsedResponse.reminders || !Array.isArray(parsedResponse.reminders)) {
        console.log('❌ Invalid response structure:', parsedResponse);
        throw new Error('AI response missing required fields');
      }

      // Convert to our format
      const now = new Date();
      const reminders = parsedResponse.reminders.map((reminder: any) => {
        const daysFromNow = parseInt(reminder.days_from_now) || 1;
        const dateTime = new Date(now.getTime() + daysFromNow * 24 * 60 * 60 * 1000);
        
        // Set times based on category
        switch (reminder.category) {
          case 'Start':
            dateTime.setHours(9, 0, 0, 0);
            break;
          case 'Daily':
            dateTime.setHours(8, 0, 0, 0);
            break;
          case 'Weekly Review':
            dateTime.setHours(10, 0, 0, 0);
            break;
          case 'Completion':
            dateTime.setHours(18, 0, 0, 0);
            break;
          default:
            dateTime.setHours(12, 0, 0, 0);
        }

        return {
          message: reminder.message || `Work on ${goal}`,
          dateTime,
          category: reminder.category || 'Custom'
        };
      });

      console.log('✅ Successfully parsed AI response:', {
        strategy: parsedResponse.strategy.substring(0, 50) + '...',
        reminderCount: reminders.length
      });

      return {
        reminders,
        totalReminders: reminders.length,
        strategy: parsedResponse.strategy,
      };

    } catch (error) {
      console.error('❌ Error in analyzeGoal:', error);
      
      // Fallback strategy
      console.log('🔄 Using fallback strategy...');
      const strategy = `Simple strategy for "${goal}" in ${timeframe}:\n\n1. Start immediately with small steps\n2. Work consistently every day\n3. Review progress weekly\n4. Adjust approach as needed\n5. Celebrate completion`;
      const reminders = this.generateReminderSchedule(goal, timeframe);

      return {
        reminders,
        totalReminders: reminders.length,
        strategy,
      };
    }
  }

  // Test Gemini connection
  async testConnection(): Promise<boolean> {
    try {
      console.log('🧪 Testing Gemini 2.0 API connection...');
      
      const result = await this.queryGemini('Hello, please respond with "Connection successful" to test the API.');
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