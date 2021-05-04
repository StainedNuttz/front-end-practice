class UI {
  constructor() {
    this.today = document.querySelector('#today');
    this.todayLocation = today.querySelector('#location');
    this.todayIcon = today.querySelector('#main-cloud');
    this.todayDesc = today.querySelector('#desc');
    this.todayTemp = today.querySelector('#temp');

    this.hr = document.querySelector('hr');
    this.days = document.querySelector('#days');

    this.submitApiKey = document.querySelector('#submit-key');
    this.inputApiKey = document.querySelector('#api-key');
    this.popup = document.querySelector('#api-message');

    this.states = {
      '#submit-key': {
        'idle': 'from-blue-600 to-blue-500 hover:from-blue-400 hover:to-blue-400',
        'processing': 'from-blue-400 to-blue-400 cursor-not-allowed hover:from-blue-400 hover:to-blue-400',
      }
    }
    
    // store original classlist
    for (let s in this.states) {
      this.states[s].base = document.querySelector(s).className;
    }
  }
  applyStateChange(element, state) {
    console.log(`${element} : ${state}`);
    const e = document.querySelector(element);
    e.className = this.states[element].base + ` ${this.states[element][state]}`;
  }
  apiPrompt() {
    this.popup.classList.remove('hidden');
    this.applyStateChange('#'+this.submitApiKey.id, 'idle');
  }
  apiPromptSuccess() {
    this.submitApiKey.textContent = '✓';
  }
  displayToday(data) {
    this.todayTemp.textContent = `${Math.round(data.temp)}°`;
    this.todayIcon.style.backgroundImage = `url('http://openweathermap.org/img/wn/${data.icon}@4x.png')`;
    this.todayDesc.textContent = data.desc;

    console.log(data.id)
    if (data.icon.toString()[0] === '5') { data.code = '50d'; }

    document.body.className = 'bg-gradient-to-b ' + weather.weatherCodes[data.code];
  }
  displayFuture(data) {
    const date = new Date();

    for(let i = 0; i < 6; i++) {
      date.setDate(date.getDate() + 1)
      const newDay = date.toString().split(' ')[0];
      const li = `
        <li class="day flex flex-col justify-center mt-8">
          <span class="font-bold sm:font-normal sm:mb-1 sm:text-3xl">${newDay}</span>
          <div class="cloud mx-auto h-16 w-16 sm:h-32 sm:w-32 mb-1"
          style="
            background-image: url('http://openweathermap.org/img/wn/${data[i].weather[0].icon}@4x.png')
            @media (min-width: 640px) {
              background-image: url('http://openweathermap.org/img/wn/${data[i].weather[0].icon}@2x.png')
            }
          "></div>
          <div class="flex justify-center sm:text-2xl">
            <span class="mr-3">${Math.round(data[i].temp.min)}°</span>
            <span class="ml-4">${Math.round(data[i].temp.max)}°</span>
          </div>
        </li>
      `;

      this.days.innerHTML += li;
    }
  }
}