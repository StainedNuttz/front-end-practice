class Weather {
  constructor() {
    this.apiKey = '4506e9996bf1ad8775c053e5e3fa66ba';
    this.lat = 50.798650;
    this.lon = -3.896830;
    this.weatherCodes = {
      "Clear": "from-blue-500 to-blue-400 text-white",
      "Clouds": "from-white via-blue-500 to-blue-600",
      "Snow": "from-gray-300 to-blue-300",
      "50d": "from-red-900 via-yellow-600 to-gray-900 text-gray-100",
      "Thunderstorm": "from-black via-gray-700 to-blue-400 text-gray-200",
      "Drizzle": "from-gray-200 via-blue-300 to-blue-500",
      "Rain": "from-gray-600 via-blue-400 to-blue-400 text-white"
    }
  }
  async getWeather() {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${this.lat}&lon=${this.lon}&appid=${this.apiKey}&units=metric&exclude=minutely,hourly,alerts`);
    const json = await res.json();

    return json;
  }
}