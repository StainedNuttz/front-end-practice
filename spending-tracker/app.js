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
      { id: 1, name: 'Cutie Tax', company: 'Baby Girl', price: 300, icon: 'fa-heart', color: 'pink' }
    ],
    current: null,
    totalPay: 0
  }
  
  const deleteBill = id => {
    const billToDelete = getBillById(id);
    currentBills.items.splice(billToDelete.index, 1);
    currentBills.totalPay -= parseInt(billToDelete.bill.price);
  }

  const editBill = (id, data) => {
    const billToEdit = getBillById(id);
    currentBills.totalPay -= parseInt(billToEdit.bill.price);

    const newBill = new Bill(id, data.name, data.company, data.price, data.icon, data.color);
    currentBills.items[billToEdit.index] = newBill;
    currentBills.totalPay += parseInt(data.price);

    return newBill;
  }

  const getBillById = (id) => {
    id = parseInt(id);
    let bill = null;
    let index;

    for (index = 0; index < currentBills.items.length; index++) {
      if (currentBills.items[index].id !== null && currentBills.items[index].id === id) {
        bill = currentBills.items[index];
        break;
      }
    }

    return {
      bill,
      index
    }
  }

  // usually used for initializing bill value upon load
  const refreshBillValue = () => {
    let total = 0;
    currentBills.items.forEach(i => {
      total += i.price;
    });
    currentBills.totalPay = total;
  }

  function* genNewID() {
    let index = 1;
    while (true) {
      yield index++;
    }
  }
  
  const newID = genNewID();

  return {
    refreshBillValue,
    logBillData: () => currentBills,
    getBillById,
    getBillValue: () => currentBills.totalPay,
    getCurrentEditingBill: () => currentBills.current,
    setCurrentEditingBill: c => { currentBills.current = c },
    getBills: () => currentBills.items,
    editBill,
    deleteBill,
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
    currentBillValue: '#bill-value',

    addBillPrompt: '#add-bill-prompt',

    // prompt buttons
    showAddBillPrompt: '#prompt-show',
    hideAddBillPrompt: '#prompt-hide',
    editAddBillPrompt: '#prompt-edit',
    backAddBillPrompt: '#prompt-back',
    createAddBillPrompt: '#prompt-create',
    deleteAddBillPrompt: '#prompt-delete',

    addBillPromptInputs: {
      name: '#add-bill-name',
      company: '#add-bill-company',
      price: '#add-bill-price',
      icon: '#add-bill-icon',
      color: '#add-bill-color',
    },
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
    input.classList.add('border-red-400');
    input.classList.remove('border-green-400');
    if (!input.parentElement.querySelector('.input-error')) {
      const alert = document.createElement('span');
      alert.className = 'input-error text-red-400 text-xs';
      alert.textContent = msg;
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

  const getInputValues = () => {
    const inputs = getInputs();
    let output = {};
    for (let i in inputs) {
      output[i] = inputs[i].value;
    }
    return output;
  }

  const getInputs = () => {
    let elements = {};
    for (let inp in uiElements.addBillPromptInputs) {
      elements[inp] = document.querySelector(uiElements.addBillPromptInputs[inp]);
    }
    return elements;
  }

  const refreshBillValue = () => {
    document.querySelector(UI.elements.currentBillValue).textContent = BillController.getBillValue();
  }

  const deletePopulatedBill = id => {
    const ul = document.querySelector(uiElements.billList);
    ul.querySelector(`#bill-${id}`).remove();
    refreshBillValue();
  }

  const editPopulatedBill = (id, newBillData) => {
    const ul = document.querySelector(uiElements.billList);
    const billElement = ul.querySelector(`#bill-${id}`);
    billElement.outerHTML = `
      <li id="bill-${newBillData.id}" class="bg-${newBillData.color}-100 px-2 py-2 flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <i class="text-${newBillData.color}-500 w-8 text-center text-3xl fas ${newBillData.icon}"></i>
              <div>
                <span class="text-${newBillData.color}-700 font-bold text-lg tracking-wider">${newBillData.name}</span>
                <span class="text-${newBillData.color}-500 block text-sm">${newBillData.company}</span>
              </div>
            </div>
          <div class="">
              <span class="text-${newBillData.color}-700 font-bold">$${newBillData.price}</span>
              <div class="text-sm text-right text-${newBillData.color}-500">
                <a href="#" class="hover:text-${newBillData.color}-400">Edit</a>
              </div>
          </div>
          </li>
    `;
    refreshBillValue();
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
    refreshBillValue();
  }

  const alert = (color, msg) => {
    const html = `<div class="bg-${color}-200 p-2 mx-2 my-0.5 text-${color}-600 font-bold flex items-center justify-between alert">
        ${msg}
        <i class="alert-close mr-2 cursor-pointer fas fa-times"></i>
      </div>`;
    document.querySelector(uiElements.alertList).insertAdjacentHTML('afterbegin', html);
  }

  const clearInputs = () => {
    const inputs = UI.getInputs();
    for (let i in inputs) {
      const inp = inputs[i];
      const error = inp.parentElement.querySelector('.input-error');
      if (error) { error.remove() }

      // clear inputs and border colors
      inp.value = '';
      inp.classList.remove('border-green-400');
      inp.classList.remove('border-red-400');
    }
    inputs.icon.value = inputs.icon.options[0].value;
    inputs.color.value = inputs.color.options[0].value;
  }

  const validateInputs = () => {
    const inputs = UI.getInputs();
    const arr = [inputs.name, inputs.company, inputs.price];
    arr.forEach(i => validateSingleInput(i));

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
  }

  const show = e => {
    document.querySelector(e).classList.remove('hidden');
  }
  const hide = e => {
    document.querySelector(e).classList.add('hidden');
  }

  // EDIT STATE
  const stateDefault = () => {
    UI.clearInputs();
    // show
    show(UI.elements.showAddBillPrompt);
    // hide
    hide(UI.elements.hideAddBillPrompt);
    hide(UI.elements.addBillPrompt);
    hide(UI.elements.editAddBillPrompt);
    hide(UI.elements.backAddBillPrompt);
    hide(UI.elements.deleteAddBillPrompt);
    hide(UI.elements.createAddBillPrompt);
  }

  const stateAddBill = () => {
    // show
    show(UI.elements.addBillPrompt);
    show(UI.elements.createAddBillPrompt);
    show(UI.elements.hideAddBillPrompt);
    // hide
    hide(UI.elements.showAddBillPrompt);
    hide(UI.elements.editAddBillPrompt);
    hide(UI.elements.backAddBillPrompt);
    hide(UI.elements.deleteAddBillPrompt);
  }

  const stateEditBill = () => {
    // show
    stateAddBill();
    show(UI.elements.editAddBillPrompt);
    show(UI.elements.backAddBillPrompt);
    show(UI.elements.deleteAddBillPrompt);
    // hide
    hide(UI.elements.hideAddBillPrompt);
    hide(UI.elements.createAddBillPrompt);
  }
  
  return {
    elements: uiElements,
    hide,
    show,
    alert,
    populate,
    editPopulatedBill,
    deletePopulatedBill,
    refreshBillValue,
    getInputs,
    getInputValues,
    validateInputs,
    validateSingleInput,
    validateError,
    validateSuccess,
    stateDefault,
    stateAddBill,
    stateEditBill,
    clearInputs,
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
      UI.stateDefault();
      // get bills and populate UI
      const bills = BillController.getBills();
      UI.populateBillsList(bills);
      // clear inputs
      // init total bill amount
      BillController.refreshBillValue();
      document.querySelector(UI.elements.currentBillValue).textContent = BillController.getBillValue();
    }
  }
})(BillController, UI, Storage);

// -------------------------------------------------------------
// init the app
App.initApp();

// LISTENERS ---------------------------------------------------

// VALIDATE WHEN LOSING FOCUS OF INPUT
document.querySelector(UI.elements.addBillPrompt).addEventListener('focusout', e => {
  if (e.target.tagName === 'INPUT') { UI.validateSingleInput(e.target) }
});

// BUTTON: CREATE ACTUAL BILL FROM INPUTS
// VALIDATE INPUTS
document.querySelector(UI.elements.createAddBillPrompt).addEventListener('click', e => {
  // validate inputs
  UI.validateInputs();
  const inputs = UI.getInputs();
  
  // SUCCESSFUL VALIDATION
  if (!document.querySelector('.input-error')) {
    // add input data into currentBills data structure
    const newBill = BillController.addBill(inputs.name.value, inputs.company.value, inputs.price.value, inputs.icon.value, inputs.color.value);
    // add created bill to UI
    UI.populate(newBill);
    UI.refreshBillValue();
    // hide prompt
    UI.stateDefault();
    // alert user
    UI.alert('green', 'New bill added');
  }

  e.preventDefault();
});

// BILL: EDIT BILL
document.querySelector(UI.elements.billList).addEventListener('click', e => {
  if (e.target.tagName === 'A') {
    const billToEdit = BillController.getBillById
      (e.target.parentElement.parentElement.parentElement.id.split('-')[1]).bill;
    if (!billToEdit) { return }

    BillController.setCurrentEditingBill(billToEdit);
    UI.stateEditBill();
    const inputs = UI.getInputs();
    for (let i in inputs) {
      inputs[i].value = billToEdit[i];
    }
  }
  e.preventDefault();
});

// VALIDATE INPUTS FOR SELECT INPUTS
document.querySelector(UI.elements.addBillPrompt).addEventListener('change', e => {
  UI.validateSuccess(e.target);
  e.preventDefault();
})

// BILL: SHOW PROMPT
document.querySelector(UI.elements.showAddBillPrompt).addEventListener('click', UI.stateAddBill);

// BILL: GO BACK
document.querySelector(UI.elements.backAddBillPrompt).addEventListener('click', e => {
  BillController.setCurrentEditingBill(null);
  UI.stateDefault();
});

// BILL: HIDE PROMPT
document.querySelector(UI.elements.hideAddBillPrompt).addEventListener('click', UI.stateDefault);

// BILL: SAVE EDIT BILL
document.querySelector(UI.elements.editAddBillPrompt).addEventListener('click', e => {
  UI.validateInputs();
  if (!document.querySelector('.input-error')) {
    const current = BillController.getCurrentEditingBill().id;
    const newBill = BillController.editBill(current, UI.getInputValues());
    UI.editPopulatedBill(current, newBill);
    UI.stateDefault();
    UI.alert('yellow', 'Bill edited');
  }
  e.preventDefault();
});

// BILL: DELETE THE BILL BITCH
document.querySelector(UI.elements.deleteAddBillPrompt).addEventListener('click', e => {
  const billToDelete = BillController.getCurrentEditingBill();
  BillController.deleteBill(billToDelete.id);
  UI.deletePopulatedBill(billToDelete.id);
  UI.stateDefault();
  UI.alert('red', 'Bill deleted');
  e.preventDefault();
});

// ALERT: CLOSE BUTTON
document.querySelector(UI.elements.alertList).addEventListener('click', e => {
  if (e.target.classList.contains('alert-close')) {
    e.target.parentElement.remove();
  }
  e.preventDefault();
});
