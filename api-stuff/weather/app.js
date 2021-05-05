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
  ui.inputApiKey.setAttribute('disabled', 'disabled');
  ui.submitApiKey.setAttribute('disabled', 'disabled');
  ui.submitApiKey.querySelector('svg').classList.remove('hidden');
  ui.applyStateChange('#'+ui.submitApiKey.id, 'processing');
  ui.applyStateChange('#'+ui.inputApiKey.id, 'idle');

  weather.tryApiKey(ui.inputApiKey.value)
    .then(d => {
      setTimeout(() => {
        const message = document.createElement('p');
        message.id = 'api-key-result';
        
        if (d === 401) {
          message.textContent = 'Invalid API key, please try again';
          message.className = 'text-red-500 sm:col-span-4';

          ui.applyStateChange(`#${ui.inputApiKey.id}`, 'error');
          ui.applyStateChange('#'+ui.submitApiKey.id, 'idle');
          ui.submitApiKey.querySelector('svg').classList.add('hidden');
          ui.submitApiKey.removeAttribute('disabled');
          ui.inputApiKey.removeAttribute('disabled', 'disabled');
        } else {
          message.textContent = 'Success';
          message.className = 'text-green-500 sm:col-span-4';
      
          ui.applyStateChange(`#${ui.inputApiKey.id}`, 'success');
          ui.applyStateChange(`#${ui.submitApiKey.id}`, 'success');
          ui.submitApiKey.textContent = '✓';

          storage.saveApiKey(ui.inputApiKey.value);
          weather.setApiKeyFromStorage();

          setTimeout(() => {
            ui.popup.remove();
            initApp();
          }, 2000);
        }

        const previous = document.querySelector('#api-key-result');
        if(previous) { previous.remove(); }
        ui.inputApiKey.parentElement.appendChild(message);
        
      }, 2000);
    });
});