const taskForm = document.querySelector('#add-task');
const collection = document.querySelector('.collection ul')
const clearBtn = document.querySelector('#btn-clear');
const filterInput = document.querySelector('#filter');
const items = localStorage.getItem('items');

filterInput.value = '';

function createItem(text) {
  const li = document.createElement('li');

  li.innerHTML = 
  `
    <span>${text}</span>
    <a href="#">
      <i class="close material-icons">close</i>
    </a>
  `
  li.className = 'collection-item';

  return li;
}

// init items from local storage
if (items !== null) {
  JSON.parse(items).forEach(function(item) {
    if (collection.firstElementChild !== null) {
      collection.insertBefore(createItem(item), collection.firstElementChild);
    } else {
      collection.appendChild(createItem(item));
    }
  });
}

collection.addEventListener('click', function(e) {
  if (e.target.classList.contains('close')) {
    const li = e.target.parentElement.parentElement;
    const items = JSON.parse(localStorage.getItem('items'));

    const index = items.indexOf(li.querySelector('span').innerText);

    items.splice(index);
    localStorage.setItem('items', JSON.stringify(items));

    li.remove();
  }
});

taskForm.addEventListener('submit', function(e) {
  const taskInput = e.target.children[0];
  if (taskInput.value === '') { return }

  let items;
  // first time adding item
  if (localStorage.getItem('items') === null) {
    items = [];
  } else {
    items = JSON.parse(localStorage.getItem('items'));
  }

  items.push(taskInput.value);
  localStorage.setItem('items', JSON.stringify(items));

  const newLi = createItem(taskInput.value)
  collection.insertBefore(newLi, collection.firstElementChild);
  
  taskInput.value = "";

  e.preventDefault();
});

clearBtn.addEventListener('click', function(e) {
  Array.from(collection.children).forEach(function(item) {
    item.remove();
  });
  localStorage.removeItem('items');
});

function applyFilter() {

}

filterInput.addEventListener('keyup', applyFilter);