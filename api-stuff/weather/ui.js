class UI {
  constructor() {
    this.today = document.querySelector('#today');
    this.todayLocation = today.querySelector('#location');
    this.todayIcon = today.querySelector('#main-cloud');
    this.todayDesc = today.querySelector('#desc');
    this.todayTemp = today.querySelector('#temp');

    this.hr = document.querySelector('hr');
    this.days = document.querySelector('#days');

    this.submitKey = document.querySelector('#submit-key');
    this.key = document.querySelector('#api-key');
    this.popup = document.querySelector('#api-message');
  }
  apiPrompt() {
    document.querySelector('#api-message').classList.remove('hidden');
  }
  apiPromptSuccess() {
    this.submitKey.textContent = '✓';
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
          <div class="cloud mx-auto h-16 w-16 sm:h-32 sm:w-32 mb-1" style="background-image: url('http://openweathermap.org/img/wn/${data[i].weather[0].icon}@4x.png')"></div>
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