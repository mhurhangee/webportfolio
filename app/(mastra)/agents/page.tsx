'use client'

import { useState } from 'react'
import { getWeatherInfo } from './actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function WeatherPage() {
  const [weatherData, setWeatherData] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    const city = formData.get('city') as string
    const result = await getWeatherInfo(city)
    console.log(result)
    setWeatherData(result)
  }

  return (
    <div className="container mx-auto p-4 pt-24">
      <Card>
        <CardHeader>
          <CardTitle>Weather Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <Input name="city" placeholder="Enter city name" />
            <Button type="submit">Get Weather</Button>
          </form>
          {weatherData && (
            <div className="mt-4">
              <h2 className="text-xl font-semibold">{weatherData}</h2>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}