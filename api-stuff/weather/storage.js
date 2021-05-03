class WeatherStorage {
  saveApiKey(key) {
    localStorage.setItem('API_KEY', key); 
  }
  getApiKey() {
    return localStorage.getItem('API_KEY');
  }
  isApiKeySet() {
    return (localStorage.getItem('API_KEY')) ? true : false;
  }
}