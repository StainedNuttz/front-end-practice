const productName = document.querySelector('#product-name'),
      productPrice = document.querySelector('#product-price'),
      productCode = document.querySelector('#product-code'),
      productCalories = document.querySelector('#product-calories'),
      productQuantity = document.querySelector('#product-quantity'),
      newProduct = document.querySelector('#new-product'),
      addProduct = document.querySelector('#add-product'),
      tbody = document.querySelector('table > tbody');

function Product(name, price, code, calories, quantity) {
  this.name = name;
  this.price = price;
  this.code = code;
  this.calories = calories;
  this.quantity = quantity;
}

function UI() {}

UI.prototype.addProduct = function(product) {
  const tr = document.createElement('tr');
  tr.innerHTML = `<tr>
          <td class="border border-black px-2 py-2">${product.name}</td>
          <td class="border border-black px-2">${product.price}</td>
          <td class="border border-black px-2">${product.code}</td>
          <td class="border border-black px-2">${product.calories}</td>
          <td class="border border-black px-2">${product.quantity}</td>
          <td class="pl-3 text-red-500"><a class="delete-button" href="#">X</a></td>
        </tr>`;
  tbody.appendChild(tr);
}

UI.prototype.clearFields = function() {
  productName.value = '';
  productPrice.value = '';
  productCode.value = '';
  productCalories.value = '';
  productQuantity.value = '';
}

UI.prototype.showAlert = function(alert, message) {
  if (document.querySelector('#active-alert') !== null) { return; }
  const div = document.createElement('div');
  switch (alert) {
    case 'error':
      div.className = 'text-red-500 border-red-400 bg-red-100';
      break;
    case 'success':
      div.className = 'text-green-500 border-green-400 bg-green-100';
      break;
  }
  div.classList.add('border', 'p-2', 'mb-2', 'col-span-2')
  div.id = 'active-alert';
  div.appendChild(document.createTextNode(message));
  newProduct.insertBefore(div, productName.parentElement);

  setTimeout(function() { div.remove(); }, 3000);
}

newProduct.addEventListener('submit', function(e) {
  e.preventDefault();

  const product = new Product(productName.value, productPrice.value, productCode.value, productCalories.value, productQuantity.value);
  const ui = new UI();
  
  if (product.name === '' ||
      product.price === '' ||
      product.code === '' ||
      product.calories === '' ||
      product.quantity === '') {
    ui.showAlert('error', 'Please enter in all values');
  } else {
    ui.showAlert('success', 'Product added');
    ui.addProduct(product);
    ui.clearFields();
  }
});

tbody.addEventListener('click', function(e) {
  if (e.target.classList.contains('delete-button')) {
    const r = confirm('Are you sure you want to delete this product?');
    if (r) {
      const ui = new UI();
      ui.showAlert('success', 'Product deleted');
      e.target.parentElement.parentElement.remove();
    }
  }
  e.preventDefault();
});
