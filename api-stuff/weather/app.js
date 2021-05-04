const weather = new Weather();
const ui = new UI();
const storage = new WeatherStorage();

const submitKey = document.querySelector('#submit-key');
const key = document.querySelector('#api-key');

document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
  if (!storage.isApiKeySet()) {
    ui.apiPrompt();
  } else {
    weather.setApiKeyFromStorage();
    weather.tryApiKey(storage.getApiKey())
      .then(d => {
        weather.getWeather()
          .then(d => {
            ui.displayToday({
              temp: d.current.temp,
              desc: d.current.weather[0].description,
              icon: d.current.weather[0].icon,
              code: d.current.weather[0].main,
              id: d.current.weather[0].id
            });
            ui.displayFuture(d.daily);
          })
          .catch(err => ui.apiPrompt());
      });
  }
}

submitKey.addEventListener('click', () => {
  submitKey.setAttribute('disabled', 'disabled');
  submitKey.classList.remove('from-blue-600', 'to-blue-500');
  submitKey.classList.add('from-blue-400', 'to-blue-400', 'cursor-not-allowed');
  submitKey.querySelector('svg').classList.remove('hidden');
  
  weather.tryApiKey(key.value)
    .then(d => {
      key.classList.remove('ring-1', 'border-red-500');

      setTimeout(() => {
        const message = document.createElement('p');
        message.id = 'api-key-result';

        const previous = document.querySelector('#api-key-result');
        if (previous) { previous.remove(); }
        
        if (d === 401) {
          key.classList.add('border-red-500', 'ring-1', 'ring-red-500');
          message.textContent = 'Invalid API key, please try again';
          message.className = 'text-red-500 sm:col-span-3'
          submitKey.classList.add('from-blue-600', 'to-blue-500');
          submitKey.removeAttribute('disabled');
        } else {
          key.classList.add('border-green-500', 'ring-1', 'ring-green-500');
          submitKey.classList.add('from-green-600', 'to-green-500');
          submitKey.classList.add('hover:from-green-600', 'hover:to-green-500');
          message.textContent = 'Success';
          message.className = 'text-green-500 sm:col-span-3'

          storage.saveApiKey(key.value);
          weather.setApiKeyFromStorage();
          ui.apiPromptSuccess();
          setTimeout(() => {
            ui.popup.remove();
            initApp();
          }, 2000);
        }

        key.parentElement.appendChild(message);
        submitKey.classList.remove('from-blue-400', 'to-blue-400', 'cursor-not-allowed');
        submitKey.querySelector('svg').classList.add('hidden');
      }, 2000);
    });
});