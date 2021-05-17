class UI {
  constructor() {
    this.elements = {
      postList: document.querySelector('#posts'),
      writePost: document.querySelector('#create-post'),
      createPostInputs: {
        title: document.querySelector('#title'),
        author: document.querySelector('#author'),
        content: document.querySelector('#content')
      },
      editPost: document.querySelector('#edit'),
      createPost: document.querySelector('#post'),
      alertList: document.querySelector('#alert-list')
    }
  }

  alert(color, msg) {
    const div = document.createElement('div');
    div.innerHTML = `
    <div class="bg-${color}-200 p-2 text-${color}-600 font-bold flex items-center justify-between alert">
      ${msg}
      <i class="alert-close mr-2 cursor-pointer fas fa-times"></i>
    </div>`;
    this.elements.alertList.appendChild(div.firstElementChild);
    setTimeout(() => div.remove(), 10000);
  }

  show(e) {
    e.classList.remove('hidden');
  }

  hide(e) {
    e.classList.add('hidden');
  }

  defaultState() {
    this.hide(this.elements.editPost);
    this.show(this.elements.createPost);
  }

  editState() {
    this.hide(this.elements.createPost);
    this.show(this.elements.editPost);
  }

  clearInputs() {
    for (let i in this.elements.createPostInputs) { this.elements.createPostInputs[i].value = '' }
  }

  getInputs() {
    const { title, author, content } = this.elements.createPostInputs;
    return {
      title: title.value,
      author: author.value,
      content: content.value
    }
  }

  createPost(post) {
    this.elements.postList.innerHTML += `
      <article id="post-${post.id}" class="post border border-purple-200 p-3 relative">
        <div class="absolute top-2 right-2">
          <a href="#" class="inline-flex">
            <i class="text-purple-600 text-xl far fa-edit post-edit"></i>
          </a>
          <a href="#" class="inline-flex">
            <i class="text-red-600 text-xl far fa-trash-alt post-delete"></i>
          </a>
        </div>
        <h2 class="title text-4xl text-purple-600 -ml-0.5">${post.title}</h2>
        <div>
          <small class="text-gray-600 inline-block mb-2">
            Written by <span class="text-purple-600 font-bold author">${post.author}</span>
          </small>
          <p class="leading-6 text-gray-700 content">
            ${post.content}
          </p>
        </div>
      </article>
    `;
  }
}

export const ui = new UI();