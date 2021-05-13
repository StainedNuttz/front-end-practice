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
    items: [],
    current: null,
    totalPay: 0
  }
  
  const deleteBillFromList = id => {
    const billToDelete = getBillById(id);
    currentBills.items.splice(billToDelete.index, 1);
    currentBills.totalPay -= parseFloat(billToDelete.bill.price);
  }

  const editBillInList = (id, data) => {
    const billToEdit = getBillById(id);
    currentBills.totalPay -= parseFloat(billToEdit.bill.price);
    
    const newBill = new Bill(id, data.name, data.company, data.price, data.icon, data.color);
    currentBills.items[billToEdit.index] = newBill;
    currentBills.totalPay += parseFloat(data.price);

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

  function* genNewID() {
    let index = 1;
    while (true) {
      yield index++;
    }
  }
  
  const newID = genNewID();

  return {
    logBillData: () => currentBills,
    getBillById,
    getBillValue: () => currentBills.totalPay,
    getCurrentEditingBill: () => currentBills.current,
    getBillList: () => currentBills.items,
    setCurrentEditingBill: c => { currentBills.current = c },
    editBillInList,
    deleteBillFromList,
    addToBillList: bill => {
      currentBills.items.push(bill);
      currentBills.totalPay += parseFloat(bill.price);
    },
    createBill: (name, company, price, icon, color) => {
      return new Bill(newID.next().value, name, company, price, icon, color);
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

  const formatPrice = Intl.NumberFormat('en-GB', { minimumFractionDigits: 2 });

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
    document.querySelector(UI.elements.currentBillValue).textContent = formatPrice.format(BillController.getBillValue());
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
              <span class="text-${newBillData.color}-700 font-bold">$${formatPrice.format(newBillData.price)}</span>
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
              <span class="text-${bill.color}-700 font-bold">$${formatPrice.format(bill.price)}</span>
              <div class="text-sm text-right text-${bill.color}-500">
                <a href="#" class="hover:text-${bill.color}-400">Edit</a>
              </div>
          </div>
          </li>
        `;
    refreshBillValue();
  }

  const alert = (color, msg) => {
    const div = document.createElement('div');
    div.innerHTML = `<div class="bg-${color}-200 p-2 mx-2 my-0.5 text-${color}-600 font-bold flex items-center justify-between alert">
        ${msg}
        <i class="alert-close mr-2 cursor-pointer fas fa-times"></i>
      </div>`;
    document.querySelector(uiElements.alertList).appendChild(div);
    setTimeout(() => div.remove(), 10000);
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

const BillStorage = (() => {

  return {
    /**
      * Returns the array of Bill objects from local storage.
      * 
      * If there is no local storage available, set it up instead and return an empty array.
      * 
      * @returns {Array} An array of bills 
    */
    getFromStorage: function() {
      // if local storage has data
      const ls = localStorage.getItem('bills');
      if (ls) {
        console.log('data retrieved from storage, no initialization needed');
        return JSON.parse(ls);
      }

      // init local storage instead
      console.log("data doesn't exist, storage initialized");
      localStorage.setItem('bills', JSON.stringify([]));
      return [];
    },
    /**
     * Saves current bill list into storage.
    */
    saveToStorage: function() {
      const current = BillController.getBillList();
      localStorage.setItem('bills', JSON.stringify(current));
    }
  }
})();

const App = ((BillController, UI, BillStorage) => {
  return {
    initApp: () => {
      // start off by setting the default UI state
      UI.stateDefault();
      // get bills 
      const bills = BillStorage.getFromStorage();
      bills.forEach(b => BillController.addToBillList(b));
      // populate UI with bills
      UI.populateBillsList(bills);
      // clear inputs
      UI.clearInputs();
      // initialize and refresh the total bill value for the UI
      UI.refreshBillValue();
    }
  }
})(BillController, UI, BillStorage);

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
    const newBill = BillController.createBill(inputs.name.value, inputs.company.value, inputs.price.value, inputs.icon.value, inputs.color.value);
    BillController.addToBillList(newBill);
    BillStorage.saveToStorage();
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
    const newBill = BillController.editBillInList(current, UI.getInputValues());
    BillStorage.saveToStorage();
    UI.editPopulatedBill(current, newBill);
    UI.stateDefault();
    UI.alert('yellow', 'Bill edited');
  }
  e.preventDefault();
});

// BILL: DELETE THE BILL BITCH
document.querySelector(UI.elements.deleteAddBillPrompt).addEventListener('click', e => {
  const billToDelete = BillController.getCurrentEditingBill();
  BillController.deleteBillFromList(billToDelete.id);
  BillStorage.saveToStorage();
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
