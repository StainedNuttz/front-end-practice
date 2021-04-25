const http = new HTTP();

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

console.log('DELETE REQUEST');
http.delete('https://jsonplaceholder.typicode.com/comments/1', function(error, comments) {
  if (error) {
    console.log(error);
  } else {
    console.log(comments);
  }
});