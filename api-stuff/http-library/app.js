// const http = new HTTP();

// data to POST
const data = {
  name: 'Josef Wimmer',
  email: 'josef.wimmer@gmail.com',
  body: 'Lorem ipsum ist ein model und er sieht gut aus.',
}

// console.log('GET REQUEST');
// http.get('https://jsonplaceholder.typicode.com/comments/128', function(error, comments) {
//   if (error) {
//     console.log(error);
//   } else {
//     console.log(comments);
//   }
// });

// console.log('POST REQUEST');
// http.post('https://jsonplaceholder.typicode.com/comments/', data, function(error, comment) {
//   if (error) {
//     console.log(error);
//   } else {
//     console.log(comment);
//   }
// });

// console.log('PUT REQUEST');
// http.put('https://jsonplaceholder.typicode.com/comments/1', data, function(error, comment) {
//   if (error) {
//     console.log(error);
//   } else {
//     console.log(comment);
//   }
// })

// console.log('DELETE REQUEST');
// http.delete('https://jsonplaceholder.typicode.com/comments/1', function(error, comments) {
//   if (error) {
//     console.log(error);
//   } else {
//     console.log(comments);
//   }
// });

// const http2 = new HTTP2();
// http2.get('https://jsonplaceholder.typicode.com/users')
//   .then(data => {
//     data.forEach(d => console.log(d.name));
//   })
//   .catch(error => console.log(error));

// http2.post('https://jsonplaceholder.typicode.com/users', data)
//   .then(data => console.log(data))
//   .catch(error => console.log(error));

// http2.put('https://jsonplacehold
// http2.put('https://jsonplaceholder.typicode.com/users/1', data)
//   .then(data => console.log(data))
//   .catch(error => console.log(error));

// http2.delete('https://jsonplaceholder.typicode.com/users/1', data)
//    .then(data => console.log(`User ${data.id} has been deleted`))
//    .catch(error => console.log(error));

const http3 = new HTTP3();

// http3.get('https://jsonplaceholder.typicode.com/users');
http3.delete('https://jsonplaceholder.typicode.com/users/1')
  .then(data => console.log(data))
  .catch(error => console.error(error));