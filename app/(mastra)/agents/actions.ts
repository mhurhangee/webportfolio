'use server'
 
import { mastra } from '@/src/mastra'
 
export async function getWeatherInfo(city: string) {
  const agent = mastra.getAgent('weatherAgent')
  
  const result = await agent.generate(`What's the weather like in ${city}?`)
  console.log(result.text)
  return result.text
}