// Express adalah framework backend yang digunakan untuk membangun server/membuat rest api yang berjalan diatas node js
const express = require("express");
// const expressLayouts = require("express-ejs-layouts");

const app = express();
const port = 3000; // menetukan port untuk menjalankan server

// Membuat file static agar file static terbaca oleh route di express
// app.use(express.static("public")); // maka apapun yang ada didalam folder public maka akan dianggap file static

// Menggunakan view-engine ejs di express, biasa digunakan untuk mengintegrasikan response dari server dengan HTML/memduahkan membuat apliaksi menggunakan backend tanpa forntend
app.set("view engine", "ejs"); // File ejs (isi content yg akan ditampilkan di browser) disimpan didalam folder views, cara memanggil isi file nya menggunakan res.render("nama file yg ada didalam folder views")

// app.use(expressLayouts); // set Menggunakan packageexpress-ejs-layouts untuk mengatur layout file ejs untuk menampilkan konten

// membuat response dan request rest api ke endpoint / atau root
app.get("/", (req, res) => {
  //   res.sendFile("./index.html", { root: __dirname }); // membaca file dan menampilkan sesuai dengan route(dalam hal ini artinya jika route / diakses maka akan membuka index.html pada browser)
  // res.send("<h1>Hello world</h1>"); // Mengembalikan response saat route / diakses

  // Memanggil file.ejs didalam folder views dan parameter kedua kita bisa menginjek atau memasukkan data yang kita bisa akses difile di index,ejs
  res.render("index", { nama: "Angger" });
});

app.get("/contact", (req, res) => {
  res.render("contact");
});

// Menjalankan server dengan port yang telah ditentukan diawal
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
console.log("hello world");
