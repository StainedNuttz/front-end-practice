import { ui } from './ui';
import { http } from './http';
require('../index.html');

http.baseURL = 'http://192.168.1.96:3000';

let beingEdited = null;

function extractId(post) {
  return post.id.split('-')[1];
}

// INITIALIZE THINGS
document.addEventListener('DOMContentLoaded', () => {
  // set default state
  ui.defaultState();
  ui.clearInputs();

  // get posts
  http.get('/posts')
    .then(posts => {
      posts.forEach(p => ui.createPost(p));
    })
    .catch(err => {
      ui.elements.createPostInputs.content.value = err;
    });
});

ui.elements.alertList.addEventListener('click', e => {
  if (e.target.classList.contains('alert-close')) { e.target.parentElement.remove() }
})

// CREATE NEW POST
ui.elements.createPost.addEventListener('click', e => {
  const title = ui.elements.createPostInputs.title.value;
  const author = ui.elements.createPostInputs.author.value;
  const content = ui.elements.createPostInputs.content.value;

  if (title !== '' && author !== '' && content !== '') {
    const data = {
      id: '',
      title,
      author,
      content
    }
    ui.clearInputs();
    http.post('/posts', data)
      .then(post => {
        ui.createPost(post);
        ui.alert('green', 'Post created!');
      })
      .catch(err => console.log(err));
  }
  
  e.preventDefault();
});

// DELETE A POST
ui.elements.postList.addEventListener('click', e => {
  console.log(e.target);
  if (e.target.classList.contains('post-delete')) {
    const post = e.target.parentElement.parentElement.parentElement;
    const id = extractId(post);
    http.delete(`/posts/${id}`)
      .then(d => post.remove())
      .catch(err => console.log(err));
  }
  e.preventDefault();
});

// START EDITING A POST
ui.elements.postList.addEventListener('click', e => {
  if (e.target.classList.contains('post-edit')) {
    ui.editState();
    const post = e.target.parentElement.parentElement.parentElement;
    const id = extractId(post);
    beingEdited = post;

    http.get(`/posts/${id}`)
      .then(post => {
        const { id, title, author, content } = post;
        ui.elements.createPostInputs.title.value = title;
        ui.elements.createPostInputs.author.value = author;
        ui.elements.createPostInputs.content.value = content;
      })
      .catch(err => console.log(err));
  }
})

// SAVE EDITED CHANGES
ui.elements.editPost.addEventListener('click', e => {
  const post = beingEdited;
  const id = extractId(post);
  const { title, author, content } = ui.getInputs();

  http.put(`/posts/${id}`, {
    id,
    title,
    author,
    content
  })
    .then(d => {
      ui.defaultState();
      ui.clearInputs();
    })
    .catch(err => console.log(err));

  e.preventDefault();
})