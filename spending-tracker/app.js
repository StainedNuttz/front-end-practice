const BillController = (() => {

  const Bill = function(id, name, company, price, icon, color) {
    this.id = id;
    this.name = name;
    this.company = company;
    this.price = price;
    this.icon = icon;
    this.color = color;
  }
  
  const currentBills = {
    items: [
      { id: 0, name: 'Cutie Tax', company: 'Baby Girl', price: 300, icon: 'fa-heart', color: 'pink' }
    ],
    current: null,
    totalPay: 0
  }

  const updateTotalPay = () => {
    let total = 0;
    currentBills.items.forEach(i => {
      total += i.price;
    });
    currentBills.totalPay = total;
  }

  function* genNewID() {
    let index = 0;
    while (true) {
      yield index++;
    }
  }
  
  const newID = genNewID();

  return {
    updateTotalPay,
    logBillData: () => currentBills,
    getTotalPay: () => currentBills.totalPay,
    getCurrentBill: () => currentBills.current,
    getBills: () => currentBills.items,
    addBill: (name, company, price, icon, color) => {
      const newBill = new Bill(newID.next().value, name, company, price, icon, color);
      currentBills.items.push(newBill);
      currentBills.totalPay += parseInt(price);
      return newBill;
    }
  }

})();

const UI = (() => {

  const uiElements = {
    alertList: '#alert-list',
    billList: '#bills',
    nextBill: '#next-bill',
    addBill: '#add-bill',
    addBillPrompt: '#add-bill-prompt',
    addBillPromptInputs: {
      name: '#add-bill-name',
      company: '#add-bill-company',
      price: '#add-bill-price',
      icon: '#add-bill-icon',
      color: '#add-bill-color',
    },
    addBillPromptCreate: '#add-bill-create',
    addBillPromptDiscard: '#add-bill-discard'
  }

  const validations = {
    '#add-bill-name': {
      regex: /^([\w-._](\s\w)?)+$/,
      msg: 'Enter a valid name without special characters'
    },
    '#add-bill-company': {
      regex: /^([\w-._](\s\w)?)+$/,
      msg: 'Enter a valid company name without special characters'
    },
    '#add-bill-price': { 
      regex: /^\d{1,5}(\.\d{1,2})?$/,
      msg: 'Enter a valid payment sum'
    }
  }

  const validateSuccess = (input) => {
    const alert = input.parentElement.querySelector('.input-error');
    if (alert) { alert.remove() }
    input.classList.remove('border-red-400');
    input.classList.add('border-green-400');
  }

  const validateError = (input, msg) => {
    if (!input.parentElement.querySelector('.input-error')) {
      const alert = document.createElement('span');
      alert.className = 'input-error text-red-400 text-xs';
      alert.textContent = msg;
      input.classList.add('border-red-400');
      input.classList.remove('border-green-400');
      input.parentElement.appendChild(alert);
    }
  }

  const validateSingleInput = (input) => {
    const key = '#' + input.id;
    input.classList.remove('border-green-400');
    input.classList.remove('border-red-400');
    if (validations[key]) {
      if (validations[key].regex.test(input.value)) {
        validateSuccess(input);
      } else {
        validateError(input, validations[key].msg);
      }
    }
  }

  const validateInputs = (inputs) => {
    inputs.forEach(i => validateSingleInput(i));
  }

  const getInputs = () => {
    let elements = {};
    for (let inp in uiElements.addBillPromptInputs) {
      elements[inp] = document.querySelector(uiElements.addBillPromptInputs[inp]);
    }
    return elements;
  }

  const populate = bill => {
    const ul = document.querySelector(uiElements.billList);
    ul.innerHTML += `
          <li id="bill-${bill.id}" class="bg-${bill.color}-100 px-2 py-2 flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <i class="text-${bill.color}-500 w-8 text-center text-3xl fas ${bill.icon}"></i>
              <div>
                <span class="text-${bill.color}-700 font-bold text-lg tracking-wider">${bill.name}</span>
                <span class="text-${bill.color}-500 block text-sm">${bill.company}</span>
              </div>
            </div>
          <div class="">
              <span class="text-${bill.color}-700 font-bold">$${bill.price}</span>
              <div class="text-sm text-right text-${bill.color}-500">
                <a href="#" class="hover:text-${bill.color}-400">Edit</a>
              </div>
          </div>
          </li>
        `;
  }

  const alert = (color, msg) => {
    const html = `<div class="bg-${color}-200 p-2 mx-2 my-0.5 text-${color}-600 font-bold flex items-center justify-between alert">
        ${msg}
        <i class="alert-close mr-2 cursor-pointer fas fa-times"></i>
      </div>`;
    document.querySelector(uiElements.alertList).insertAdjacentHTML('afterbegin', html);
  }
  
  return {
    elements: uiElements,
    alert,
    populate,
    getInputs,
    validateInputs,
    validateSingleInput,
    validateError,
    validateSuccess,
    populateBillsList: bills => {
      bills.forEach((b) => {
        populate(b);
      });
    }
  }
})();

const Storage = (() => {

})();

const App = ((BillController, UI, Storage) => {
  return {
    initApp: () => {
      console.log('App initializing...');

      // get bills and populate UI
      const bills = BillController.getBills();
      UI.populateBillsList(bills);

      // init total pay amount
      BillController.updateTotalPay();
      document.querySelector(UI.elements.nextBill).textContent = BillController.getTotalPay();

      // clear input fields
      const inputs = UI.getInputs();
      for (let i in inputs) {
        inputs[i].value = '';
      }
      inputs.icon.value = inputs.icon.options[0].value;
      inputs.color.value = inputs.color.options[0].value;
    }
  }
})(BillController, UI, Storage);

// -------------------------------------------------------------
// init the app
App.initApp();

// LISTENERS ---------------------------------------------------

// VALIDATE WHEN LOSING FOCUS OF INPUT
document.querySelector(UI.elements.addBillPrompt).addEventListener('focusout', e => {
  UI.validateSingleInput(e.target);
});

// BUTTON: SHOW PROMPT
document.querySelector(UI.elements.addBill).addEventListener('click', e => {
  document.querySelector(UI.elements.addBillPrompt).classList.remove('hidden');

  e.preventDefault();
});

// BUTTON: CREATE BILL FROM INPUTS
document.querySelector(UI.elements.addBillPromptCreate).addEventListener('click', e => {
  // validate inputs
  const inputs = UI.getInputs();
  UI.validateInputs([
    inputs.name,
    inputs.company,
    inputs.price
  ]);

  if (inputs.color.value === 'Select color') {
    UI.validateError(inputs.color, 'Please select a color')
  } else {
    UI.validateSuccess(inputs.color);
  }
  if (inputs.icon.value === 'Select icon') {
    UI.validateError(inputs.icon, 'Please select an icon')
  } else {
    UI.validateSuccess(inputs.icon);
  }

  // SUCCESSFUL VALIDATION
  if (!document.querySelector('.input-error')) {
    // add input data into currentBills data structure
    const newBill = BillController.addBill(inputs.name.value, inputs.company.value, inputs.price.value, inputs.icon.value, inputs.color.value);
    // add created bill to UI
    UI.populate(newBill);
    // update total pay amount in UI
    document.querySelector(UI.elements.nextBill).textContent = BillController.getTotalPay();
    // hide prompt
    document.querySelector(UI.elements.addBillPrompt).classList.add('hidden');
    // alert user
    UI.alert('green', 'New bill added!');
  }

  e.preventDefault();
});

// BUTTON: HIDE PROMPT
document.querySelector(UI.elements.addBillPromptDiscard).addEventListener('click', e => {
  document.querySelector(UI.elements.addBillPrompt).classList.add('hidden');

  e.preventDefault();
});

// ALERT: CLOSE BUTTON
document.querySelector(UI.elements.alertList).addEventListener('click', e => {
  if (e.target.classList.contains('alert-close')) {
    e.target.parentElement.remove();
  }
  e.preventDefault();
});
