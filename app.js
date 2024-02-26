// Express adalah framework backend yang digunakan untuk membangun server/membuat rest api yang berjalan diatas node js
const express = require("express");
const app = express();
const port = 3000; // menetukan port untuk menjalankan server

// membuat response dan request rest api ke endpoint / atau root
app.get("/", (req, res) => {
  res.send("<h1>Hello world</h1>"); // Mengembalikan response saat route / diakses
});

// Menjalankan server dengan port yang telah ditentukan diawal
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
console.log("hello world");
