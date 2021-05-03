const weather = new Weather();
const ui = new UI();

document.addEventListener('DOMContentLoaded', () => {
  weather.getWeather()
    .then(d => {
      console.log(d);
      ui.displayToday({
        temp: d.current.temp,
        desc: d.current.weather[0].description,
        icon: d.current.weather[0].icon,
        code: d.current.weather[0].main,
        id: d.current.weather[0].id
      });
      ui.displayFuture(d.daily);
    })
    .catch(err => console.error(err));
});