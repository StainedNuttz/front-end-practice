const weather = new Weather();
const ui = new UI();
const storage = new WeatherStorage();

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

ui.submitApiKey.addEventListener('click', () => {
  // disable button and show loading circle
  ui.submitApiKey.setAttribute('disabled', 'disabled');
  ui.submitApiKey.querySelector('svg').classList.remove('hidden');
  ui.applyStateChange('#'+ui.submitApiKey.id, 'processing');

  weather.tryApiKey(ui.inputApiKey.value)
    .then(d => {
      ui.inputApiKey.classList.remove('ring-1', 'border-red-500');

      setTimeout(() => {
        const message = document.createElement('p');
        message.id = 'api-key-result';

        const previous = document.querySelector('#api-key-result');
        if (previous) { previous.remove(); }
        
        if (d === 401) {
          ui.inputApiKey.classList.add('border-red-500', 'ring-1', 'ring-red-500');
          message.textContent = 'Invalid API key, please try again';
          message.className = 'text-red-500 sm:col-span-3'
          ui.submitApiKey.classList.add('from-blue-600', 'to-blue-500');
          ui.submitApiKey.removeAttribute('disabled');
        } else {
          ui.inputApiKey.classList.add('border-green-500', 'ring-1', 'ring-green-500');
          ui.submitApiKey.classList.add('from-green-600', 'to-green-500');
          ui.submitApiKey.classList.add('hover:from-green-600', 'hover:to-green-500');
          message.textContent = 'Success';
          message.className = 'text-green-500 sm:col-span-3';

          storage.saveApiKey(ui.inputApiKey.value);
          weather.setApiKeyFromStorage();
          ui.apiPromptSuccess();
          setTimeout(() => {
            ui.popup.remove();
            initApp();
          }, 2000);
        }

        ui.applyStateChange('#'+ui.submitApiKey.id, 'idle');
        ui.inputApiKey.parentElement.appendChild(message);
        ui.submitApiKey.querySelector('svg').classList.add('hidden');
      }, 2000);
    });
});