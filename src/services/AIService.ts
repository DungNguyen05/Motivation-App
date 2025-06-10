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
    private baseUrl = 'https://api-inference.huggingface.co/models';
  
    constructor(apiKey: string) {
      this.apiKey = apiKey;
    }
  
    private async queryHuggingFace(model: string, inputs: string): Promise<any> {
      const response = await fetch(`${this.baseUrl}/${model}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: inputs,
          parameters: {
            max_new_tokens: 1000,
            temperature: 0.7,
            do_sample: true,
            return_full_text: false,
          },
          options: {
            wait_for_model: true,
          },
        }),
      });
  
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid API key. Please check your Hugging Face API key.');
        } else if (response.status === 503) {
          throw new Error('Model is loading. Please try again in a moment.');
        } else {
          throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }
      }
  
      const result = await response.json();
      
      if (Array.isArray(result) && result.length > 0) {
        return result[0];
      }
      
      return result;
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
  
      // Parse the AI strategy to extract reminder patterns
      const lines = strategy.split('\n').filter(line => 
        line.trim() && 
        (line.includes('reminder') || line.includes('check') || line.includes('review') || 
         line.includes('practice') || line.includes('daily') || line.includes('weekly') ||
         line.includes('milestone') || line.includes('goal'))
      );
  
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
        // Create a comprehensive prompt for goal analysis
        const prompt = `You are a smart goal-setting assistant. Analyze this goal and create a strategy:
  
  Goal: "${goal}"
  Timeframe: ${timeframe}
  
  Create a detailed strategy for achieving this goal with specific milestones and checkpoints. Focus on:
  1. Breaking the goal into smaller, actionable steps
  2. Setting realistic milestones based on the timeframe
  3. Identifying potential challenges and solutions
  4. Creating a sustainable routine
  5. Measuring progress
  
  Provide a comprehensive strategy in 200-300 words that I can use to create reminder schedules.
  
  Strategy:`;
  
        console.log('Sending request to Hugging Face API...');
        
        // Use a reliable text generation model
        const models = [
          'microsoft/DialoGPT-large',
          'google/flan-t5-large',
          'facebook/blenderbot-400M-distill',
          'mistralai/Mistral-7B-Instruct-v0.1'
        ];
  
        let strategy = '';
        let lastError = null;
  
        // Try different models until one works
        for (const model of models) {
          try {
            console.log(`Trying model: ${model}`);
            const result = await this.queryHuggingFace(model, prompt);
            
            if (result && typeof result === 'object') {
              strategy = result.generated_text || result.response || result.text || '';
            } else if (typeof result === 'string') {
              strategy = result;
            }
  
            if (strategy && strategy.length > 50) {
              console.log(`Success with model: ${model}`);
              break;
            }
          } catch (error) {
            console.log(`Model ${model} failed:`, error);
            lastError = error;
            continue;
          }
        }
  
        // If all models fail, create a fallback strategy
        if (!strategy || strategy.length < 50) {
          console.log('All models failed, generating fallback strategy');
          strategy = this.generateFallbackStrategy(goal, timeframe);
        }
  
        // Generate reminders based on the strategy
        const reminders = this.generateReminderSchedule(goal, timeframe, strategy);
  
        return {
          reminders,
          totalReminders: reminders.length,
          strategy: strategy.trim(),
        };
  
      } catch (error) {
        console.error('Error in analyzeGoal:', error);
        
        // Provide fallback analysis
        const strategy = this.generateFallbackStrategy(goal, timeframe);
        const reminders = this.generateReminderSchedule(goal, timeframe, strategy);
  
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
        const result = await this.queryHuggingFace(
          'microsoft/DialoGPT-large',
          'Hello, this is a test message.'
        );
        return true;
      } catch (error) {
        console.error('API test failed:', error);
        return false;
      }
    }
  }