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
  private baseUrl = 'https://router.huggingface.co/novita/v3/openai/chat/completions';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async queryHuggingFaceProviders(messages: any[]): Promise<any> {
    try {
      const requestBody = {
        messages: messages,
        model: 'deepseek/deepseek-v3-0324',
        stream: false,
        max_tokens: 1000,
        temperature: 0.7,
      };

      console.log('🚀 Request URL:', this.baseUrl);
      console.log('🚀 Request Headers:', {
        'Authorization': `Bearer ${this.apiKey.substring(0, 10)}...`,
        'Content-Type': 'application/json',
      });
      console.log('🚀 Request Body:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📡 Response Status:', response.status);
      console.log('📡 Response Headers:', JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2));

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Error Response Body:', errorText);
        
        if (response.status === 401) {
          throw new Error('Invalid API key. Please check your Hugging Face API key.');
        } else if (response.status === 503) {
          throw new Error('Model is loading. Please try again in a moment.');
        } else {
          throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
        }
      }

      const result = await response.json();
      console.log('✅ Full Response from Hugging Face:', JSON.stringify(result, null, 2));
      
      if (result.choices && result.choices.length > 0) {
        const content = result.choices[0].message.content;
        console.log('✅ Extracted Content:', content);
        return content;
      }
      
      console.log('❌ No valid choices in response');
      throw new Error('No response from AI model');
    } catch (error) {
      console.error('❌ Error calling Hugging Face API:', error);
      throw error;
    }
  }

  private parseTimeframe(timeframe: string): { days: number; weeks: number; months: number } {
    const lower = timeframe.toLowerCase();
    
    if (lower.includes('week')) {
      const weeks = parseInt(lower.match(/\d+/)?.[0] || '1');
      return { days: weeks * 7, weeks, months: 0 };
    } else if (lower.includes('month')) {
      const months = parseInt(lower.match(/\d+/)?.[0] || '1');
      return { days: months * 30, weeks: months * 4, months };
    } else if (lower.includes('year')) {
      const years = parseInt(lower.match(/\d+/)?.[0] || '1');
      return { days: years * 365, weeks: years * 52, months: years * 12 };
    } else {
      return { days: 30, weeks: 4, months: 1 }; // Default to 1 month
    }
  }

  private generateReminderSchedule(goal: string, timeframe: string, strategy: string): {
    message: string;
    dateTime: Date;
    category: string;
  }[] {
    const { days, weeks, months } = this.parseTimeframe(timeframe);
    const now = new Date();
    const reminders: { message: string; dateTime: Date; category: string; }[] = [];

    // Generate immediate reminder (within 1 hour)
    const immediateDate = new Date(now.getTime() + 60 * 60 * 1000);
    reminders.push({
      message: `Start working on your goal: ${goal}`,
      dateTime: immediateDate,
      category: 'Start'
    });

    // Generate daily reminders for first week
    for (let i = 1; i <= Math.min(7, days); i++) {
      const date = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
      date.setHours(9, 0, 0, 0); // Set to 9 AM
      
      reminders.push({
        message: `Daily check-in: Work on ${goal} - Stay consistent!`,
        dateTime: date,
        category: 'Daily'
      });
    }

    // Generate weekly milestones
    const weeklyCount = Math.min(weeks, 8); // Max 8 weekly reminders
    for (let i = 1; i <= weeklyCount; i++) {
      const date = new Date(now.getTime() + i * 7 * 24 * 60 * 60 * 1000);
      date.setHours(10, 0, 0, 0); // Set to 10 AM on the same day of week
      
      reminders.push({
        message: `Week ${i} review: Assess your progress on ${goal}`,
        dateTime: date,
        category: 'Weekly Review'
      });
    }

    // Generate monthly milestones
    if (months > 0) {
      const monthlyCount = Math.min(months, 6); // Max 6 monthly reminders
      for (let i = 1; i <= monthlyCount; i++) {
        const date = new Date(now.getTime() + i * 30 * 24 * 60 * 60 * 1000);
        date.setHours(11, 0, 0, 0); // Set to 11 AM
        
        reminders.push({
          message: `Month ${i} milestone: Major progress check on ${goal}`,
          dateTime: date,
          category: 'Monthly Milestone'
        });
      }
    }

    // Generate mid-point reminder
    if (days > 14) {
      const midDate = new Date(now.getTime() + (days / 2) * 24 * 60 * 60 * 1000);
      midDate.setHours(12, 0, 0, 0);
      
      reminders.push({
        message: `Halfway point: Reflect on your journey with ${goal}`,
        dateTime: midDate,
        category: 'Milestone'
      });
    }

    // Generate final reminder
    const finalDate = new Date(now.getTime() + (days - 1) * 24 * 60 * 60 * 1000);
    finalDate.setHours(13, 0, 0, 0);
    
    reminders.push({
      message: `Final check: Celebrate your achievement of ${goal}!`,
      dateTime: finalDate,
      category: 'Completion'
    });

    // Add some variety based on goal type
    const goalLower = goal.toLowerCase();
    if (goalLower.includes('exercise') || goalLower.includes('fitness') || goalLower.includes('workout')) {
      // Add rest day reminders
      for (let i = 7; i <= days; i += 7) {
        const restDate = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
        restDate.setHours(8, 0, 0, 0);
        reminders.push({
          message: `Rest day reminder: Recovery is part of your fitness journey`,
          dateTime: restDate,
          category: 'Rest Day'
        });
      }
    } else if (goalLower.includes('learn') || goalLower.includes('study') || goalLower.includes('skill')) {
      // Add practice reminders
      for (let i = 3; i <= days; i += 3) {
        const practiceDate = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
        practiceDate.setHours(19, 0, 0, 0); // Evening practice
        reminders.push({
          message: `Practice time: Dedicate 30 minutes to ${goal}`,
          dateTime: practiceDate,
          category: 'Practice'
        });
      }
    } else if (goalLower.includes('read') || goalLower.includes('book')) {
      // Add reading reminders
      for (let i = 2; i <= days; i += 2) {
        const readDate = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
        readDate.setHours(20, 0, 0, 0); // Evening reading
        reminders.push({
          message: `Reading time: Continue your reading goal`,
          dateTime: readDate,
          category: 'Reading'
        });
      }
    }

    // Sort by date and limit to reasonable number
    return reminders
      .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime())
      .slice(0, 25); // Limit to 25 reminders max
  }

  async analyzeGoal(goal: string, timeframe: string): Promise<AIGoalAnalysis> {
    try {
      // Create a structured prompt that requests specific format
      const messages = [
        {
          role: 'system',
          content: 'You are a smart goal-setting assistant. You must respond in a specific JSON format that includes both strategy and reminders.'
        },
        {
          role: 'user',
          content: `Analyze this goal and create a strategy with specific reminders:

Goal: "${goal}"
Timeframe: ${timeframe}

Please respond with EXACTLY this JSON format (no other text):

{
  "strategy": "Your detailed strategy here (200-300 words)",
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

Create 15-25 specific reminders based on your strategy. Use these categories: Start, Daily, Weekly Review, Monthly Milestone, Milestone, Practice, Completion.

Focus on:
1. Breaking the goal into smaller, actionable steps
2. Setting realistic milestones based on the timeframe
3. Creating specific, actionable reminders
4. Measuring progress regularly

Make sure each reminder is specific to the goal "${goal}" and actionable.`
        }
      ];

      console.log('🎯 Analyzing Goal:', goal);
      console.log('⏰ Timeframe:', timeframe);
      console.log('📝 Messages to send:', JSON.stringify(messages, null, 2));
      console.log('🚀 Sending request to Hugging Face Inference Providers...');
      
      const aiResponse = await this.queryHuggingFaceProviders(messages);

      console.log('📊 Raw AI Response:', aiResponse);
      console.log('📏 Response length:', aiResponse ? aiResponse.length : 0);

      // Try to parse the JSON response
      let parsedResponse;
      try {
        // Clean the response - sometimes AI adds extra text
        let cleanResponse = aiResponse.trim();
        
        // Find JSON block if it's wrapped in markdown or other text
        const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          cleanResponse = jsonMatch[0];
        }
        
        console.log('🧹 Cleaned response for JSON parsing:', cleanResponse);
        parsedResponse = JSON.parse(cleanResponse);
        console.log('✅ Successfully parsed JSON:', parsedResponse);
      } catch (parseError) {
        console.log('❌ Failed to parse JSON, using fallback:', parseError);
        throw new Error('AI response was not in valid JSON format');
      }

      // Validate the parsed response
      if (!parsedResponse.strategy || !parsedResponse.reminders || !Array.isArray(parsedResponse.reminders)) {
        console.log('❌ Invalid response structure, using fallback');
        throw new Error('AI response missing required fields');
      }

      // Convert AI reminders to our format
      const now = new Date();
      const reminders = parsedResponse.reminders.map((reminder: any) => {
        const daysFromNow = parseInt(reminder.days_from_now) || 1;
        const dateTime = new Date(now.getTime() + daysFromNow * 24 * 60 * 60 * 1000);
        
        // Set specific times based on category
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
          case 'Monthly Milestone':
            dateTime.setHours(11, 0, 0, 0);
            break;
          case 'Practice':
            dateTime.setHours(19, 0, 0, 0);
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

      console.log('📅 Parsed reminders from AI:', JSON.stringify(reminders.map(r => ({
        message: r.message,
        dateTime: r.dateTime.toISOString(),
        category: r.category
      })), null, 2));

      const result = {
        reminders,
        totalReminders: reminders.length,
        strategy: parsedResponse.strategy.trim(),
      };

      console.log('✅ Final analysis result:', {
        totalReminders: result.totalReminders,
        strategyLength: result.strategy.length
      });

      return result;

    } catch (error) {
      console.error('❌ Error in analyzeGoal:', error);
      console.log('🔄 Falling back to default strategy...');
      
      // Provide fallback analysis
      const strategy = this.generateFallbackStrategy(goal, timeframe);
      const reminders = this.generateReminderSchedule(goal, timeframe, strategy);

      console.log('📋 Fallback strategy generated:', strategy.substring(0, 100) + '...');
      console.log('📅 Fallback reminders count:', reminders.length);

      return {
        reminders,
        totalReminders: reminders.length,
        strategy,
      };
    }
  }

  private generateFallbackStrategy(goal: string, timeframe: string): string {
    const { days, weeks, months } = this.parseTimeframe(timeframe);
    
    return `Strategy for achieving "${goal}" in ${timeframe}:

1. IMMEDIATE START (Day 1): Begin with small, manageable steps. Set up your environment and gather necessary resources.

2. DAILY ROUTINE (Days 1-7): Establish a consistent daily practice. Start with 15-30 minutes per day focusing on your goal.

3. WEEKLY REVIEWS (Every 7 days): Assess your progress, adjust your approach if needed, and celebrate small wins.

4. MID-POINT EVALUATION (${Math.floor(days/2)} days): Conduct a thorough review of your progress. Identify what's working and what needs adjustment.

5. MILESTONE CHECKPOINTS: Set specific milestones at regular intervals to maintain motivation and track progress.

6. FINAL SPRINT (Last ${Math.min(7, Math.floor(days/4))} days): Intensify your efforts and prepare for goal completion.

Key Success Factors:
- Consistency over intensity
- Regular progress tracking
- Flexibility to adjust the plan
- Celebrating small victories
- Learning from setbacks

This structured approach with regular reminders will help you stay on track and achieve your goal within the specified timeframe.`;
  }

  // Test the API connection
  async testConnection(): Promise<boolean> {
    try {
      console.log('🧪 Testing Hugging Face API connection...');
      
      const messages = [
        {
          role: 'user',
          content: 'Hello, this is a test message. Please respond with "Connection successful".'
        }
      ];
      
      const result = await this.queryHuggingFaceProviders(messages);
      console.log('🧪 Test connection result:', result);
      console.log('🧪 Test result length:', result ? result.length : 0);
      
      const isSuccessful = result && result.length > 0;
      console.log('🧪 Connection test:', isSuccessful ? '✅ PASSED' : '❌ FAILED');
      
      return isSuccessful;
    } catch (error) {
      console.error('🧪 API test failed:', error);
      return false;
    }
  }
}