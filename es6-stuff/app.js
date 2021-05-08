async function getUsers() {
  const users = await fetch('users.json');
  const json = await users.json();
  return json;
}

function* userIterator(users) {
  let index = 0;
  while (true) {
    yield users.results[index++];
  }
}

let gen;
getUsers().then(d => { 
  gen = userIterator(d);
  const test = gen.next().value;
});

const scroller = document.querySelector('#scroller');
const btn = scroller.querySelector('button');
btn.addEventListener('click', () => {
  const user = gen.next().value;
  scroller.querySelector('#current').innerHTML = `
  <img class="rounded-full mr-3" src="${user.picture.large}">
  <ul class="flex flex-col mt-1 ml-1">
    <li class="text-xl text-indigo-600 font-bold">${user.name.first} ${user.name.last}</li>
    <li class="capitalize text-sm">${user.gender}, ${user.dob.age}</li>
    <li class="text-sm">${user.email}</li>
    <li class="text-sm">${user.cell}</li>
  </ul>
  `;
});