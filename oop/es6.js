const productName = document.querySelector('#product-name'),
  productPrice = document.querySelector('#product-price'),
  productCode = document.querySelector('#product-code'),
  productCalories = document.querySelector('#product-calories'),
  productQuantity = document.querySelector('#product-quantity'),
  newProduct = document.querySelector('#new-product'),
  addProduct = document.querySelector('#add-product'),
  tbody = document.querySelector('table > tbody');

class Product {
  constructor(name, price, code, calories, quantity) {
    this.name = name;
    this.price = price;
    this.code = code;
    this.calories = calories;
    this.quantity = quantity;
  }
}

class Storage {
  static getProducts() {
    let products;
    if (localStorage.getItem('products') === null) {
      products = [];
    } else {
      products = JSON.parse(localStorage.getItem('products'));
    }
    return products;
  }

  static addProduct(product) {
    let products = Storage.getProducts();
    for (const p of products) {
      if (p.code == product.code) {
        console.log("returning false");
        return false;
      }
    }
    products.push(product);
    localStorage.setItem('products', JSON.stringify(products));
    return true;
  }

  static deleteProduct(codeToDelete) {
    let products = Storage.getProducts();
    products.forEach(function(product, index) {
      if (product.code === codeToDelete) {
        products.splice(index, 1);
      }
    });
    localStorage.setItem('products', JSON.stringify(products));
  }
}

class UI {
  addProduct(product) {
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

  deleteProduct(target) {
    target.parentElement.parentElement.remove();
  }

  showAlert(alert, message) {
    // if an error alert already exists, return out of function  
    if (document.querySelector('.alert-error') && alert == 'error') {
      return;
    }
    const div = document.createElement('div');
    switch (alert) {
      case 'error':
        div.className = 'alert-error text-red-500 border-red-400 bg-red-100';
        break;
      case 'success':
        div.className = 'alert-success text-green-500 border-green-400 bg-green-100';
        break;
    }
    div.classList.add('border', 'p-2', 'mb-2', 'col-span-2')
    div.appendChild(document.createTextNode(message));
    newProduct.insertBefore(div, productName.parentElement);

    setTimeout(function() { div.remove(); }, 3000);
  }

  clearFields() {
    productName.value = '';
    productPrice.value = '';
    productCode.value = '';
    productCalories.value = '';
    productQuantity.value = '';
  }

  displayProducts() {
    let products = Storage.getProducts();
    const self = this;
    products.forEach(function (product) {
      self.addProduct(product);
    });
  }
}

document.addEventListener('DOMContentLoaded', function(e) {
  const ui = new UI();
  ui.displayProducts();
  
  e.preventDefault();
});

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
    if(Storage.addProduct(product)) {
      ui.showAlert('success', 'Product added');
      ui.addProduct(product);
      ui.clearFields();
    } else {
      ui.showAlert('error', 'Error: product code already exists');
    }
  }
});

tbody.addEventListener('click', function(e) {
  if (e.target.classList.contains('delete-button')) {
    const ui = new UI();

    const r = confirm('Are you sure you want to delete this product?');
    if (r) {
      ui.deleteProduct(e.target);
      Storage.deleteProduct(e.target.parentElement.parentElement.children[2].textContent);
      ui.showAlert('success', 'Product deleted');
    }
  }

  e.preventDefault();
});