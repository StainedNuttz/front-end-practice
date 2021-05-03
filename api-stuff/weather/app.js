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

let submitProcessing = false;
submitKey.addEventListener('click', () => {
  if (submitProcessing) { return; }
  submitKey.setAttribute('disabled', 'disabled');
  submitKey.classList.remove('from-blue-600', 'to-blue-500');
  submitKey.classList.add('from-blue-400', 'to-blue-400', 'cursor-not-allowed');
  submitKey.querySelector('svg').classList.remove('hidden');
  
  weather.tryApiKey(key.value)
    .then(d => {
      console.log(`d: ${d}`);
      submitProcessing = true;
      const previous = document.querySelector('#api-key-result');
      if (previous !== null) { previous.remove(); }
      key.classList.remove('ring-1', 'border-red-500');

      setTimeout(() => {
        const message = document.createElement('p');
        message.id = 'api-key-result';
        
        if (d === 401) {
          key.classList.add('border-red-500', 'ring-1', 'ring-red-500');
          message.textContent = 'Invalid API key, please try again';
          message.className = 'text-red-500 mt-1 sm:mt-2 sm:col-span-3'
        } else {
          key.classList.add('border-green-500', 'ring-1', 'ring-green-500');
          message.textContent = 'Success';
          message.className = 'text-green-500 mt-1 sm:mT-2 sm:col-span-3'

          storage.saveApiKey(key.value);
          weather.setApiKeyFromStorage();
          setTimeout(() => {
            ui.apiPromptSuccess();
            this.initApp();
          }, 2000);
        }

        key.parentElement.appendChild(message);
        submitKey.removeAttribute('disabled');
        submitKey.classList.add('from-blue-600', 'to-blue-500');
        submitKey.classList.remove('from-blue-400', 'to-blue-400', 'cursor-not-allowed');
        submitKey.querySelector('svg').classList.add('hidden');
        submitProcessing = false;
      }, 2000);
    });
});