// Express adalah framework backend yang digunakan untuk membangun server/membuat rest api yang berjalan diatas node js
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const { v4: uuidv4 } = require("uuid");
const { check, body, validationResult } = require("express-validator");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");
const {
  getContacts,
  getDetailContact,
  addContacts,
  cekDuplikatId,
  findContact,
  deleteContact,
  editContacts,
} = require("./libs/contacts");

const app = express();
const port = 3000; // menetukan port untuk menjalankan server

// Start Middleware
//  Middleware akan selalu dijalankan terlebih dahulu sebelum file yang lain dieksekusi
// Membuat file static agar file static terbaca oleh route di express
app.use(express.static("public")); // maka apapun yang ada didalam folder public maka akan dianggap file static
app.use(express.urlencoded({ extended: true })); // untuk mendapatkan value body pada method route post, extended:true digunakan untuk mengatasi body-parser deprecated
app.use(expressLayouts); // set layouts Menggunakan package express-ejs-layouts untuk mengatur layout file ejs untuk menampilkan konten
// Menggunakan view-engine ejs di express, biasa digunakan untuk mengintegrasikan response dari server dengan HTML/memduahkan membuat apliaksi menggunakan backend tanpa forntend
app.set("view engine", "ejs"); // File ejs (isi content yg akan ditampilkan di browser) disimpan didalam folder views, cara memanggil isi file nya menggunakan res.render("nama file yg ada didalam folder views")

// add flash message(notif contact berhasil ditambahkan)
app.use(cookieParser());
app.use(
  session({
    cookie: { maxAge: 6000 },
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());

// End Middleware

// halaman home
// membuat response dan request rest api ke endpoint / atau root
app.get("/", (req, res) => {
  //   res.sendFile("./index.html", { root: __dirname }); // membaca file dan menampilkan sesuai dengan route(dalam hal ini artinya jika route / diakses maka akan membuka index.html pada browser)
  // res.send("<h1>Hello world</h1>"); // Mengembalikan response saat route / diakses

  const url = req.url;
  res.render("index", {
    title: "Home Page",
    url,
    layout: "layouts/main-layout",
  });
});

// halaman contact
app.get("/contact", (req, res) => {
  const contacts = getContacts();
  const url = req.url;

  // Memanggil file.ejs didalam folder views dan parameter kedua kita bisa menginjek atau memasukkan data yang kita bisa akses difile di index,ejs
  res.render("contact", {
    layout: "layouts/main-layout", // memanggil layout yang ada didalam view,pemanggilan path nya relativ terhadap folder views
    title: "Contact Page",
    url,
    contacts: contacts, // injek isi data agar dikemablikan sebagai response dihalaman index.ejs pada folder views
    notification: req.flash("notification"), // mengambil nilai di cookie
  });
});

// handle method post padd form add contact
// body("") isi dari body harus sesuai dengan name untuk implementasi validator pada form
// check("") jika ingin mencustom pesan error. withMessage("isi pesan error")
app.post(
  "/contact",
  [
    check("nohp")
      .isMobilePhone("id-ID")
      .withMessage("Nomor yang anda inputkan tidak valid"),
    check("email")
      .isEmail()
      .withMessage("Email yang anda inputkan tidak valid"),
    // custm error dengan mencocokkan apakah nama yang diinputkan sudah ada di contacts.json
    body("name").custom((value) => {
      console.log("🚀 ~ body ~ value:", value);
      // cek duplikat id (simulasi masi dengan name buka id harusnya id)
      const duplikat = cekDuplikatId(value);

      if (duplikat) {
        //  kirim pessan error
        throw new Error("Nama yang anda masukkan sudah ada");
      }
      return true;
    }),
  ],
  (req, res) => {
    // cara menangkap error dari validator
    const errors = validationResult(req);
    // jika errors ada
    if (!errors.isEmpty()) {
      // tampilkan pesan error dihalaman add contact
      res.render("add-contact", {
        title: "Page Add Contact",
        url: req.url,
        layout: "layouts/main-layout",
        errors: errors.array(),
      });
    } else {
      const dataForm = req.body;
      const data = {
        id: uuidv4(),
        ...dataForm,
      };
      addContacts(data);
      // Buat flash message data berhasil ditambahkan
      req.flash("notification", "Data contact berhasil ditambahkan.");
      res.redirect("/contact");
    }
  }
);
// Handle method post pada form contact
app.post(
  "/contact/update",
  [
    check("nohp")
      .isMobilePhone("id-ID")
      .withMessage("No HP yang anda inputkan tdak valid"),
    check("email")
      .isEmail()
      .withMessage("Email yang anda masukkan tidak valid"),
    body("name").custom((value, { req }) => {
      console.log("🚀 ~ body ~ value:", req.body);
      const duplikat = cekDuplikatId(value);
      // buat kondisi agar oldName dan name tidak sama nilainya agar jika ingin edit dan nohp bisa
      // untuk menghindari jika nama nya sama{tidak diubah} maka masih bisa diedit, karena jika masuk di if ini akan thron error karena duplikat
      if (req.body.oldName != value && duplikat) {
        // kedua value harus bernilai true agar if berjalan
        throw new Error("Nama yang anda masukkan sudah ada");
      }

      return true;
    }),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("update-contact", {
        title: "Update Contact",
        url: req.url,
        layout: "layouts/main-layout",
        errors: errors.array(),
        contact: req.body,
      });
    } else {
      const dataForm = req.body;
      console.log("🚀 ~ dataForm:", dataForm);

      const data = {
        id: uuidv4(),
        ...dataForm,
      };

      editContacts(data);
      // Buat flash message data berhasil diupdate
      req.flash("notification", "Data contact berhasil diUpdate.");
      res.redirect("/contact");
    }
  }
);

// Halaman tambah contact
// agar tidak mengacu pada contact/id maka pastikan membuat halaman contact/add sebelum get contact/add
app.get("/contact/add", (req, res) => {
  res.render("add-contact", {
    title: "Add Contact Page",
    url: req.url,
    layout: "layouts/main-layout",
  });
});

// Halaman delete dengan method get
app.get("/contact/delete/:id", (req, res) => {
  const contact = findContact(req.params.id);
  if (contact) {
    deleteContact(req.params.id);
    req.flash("notification", "Data berhasil dihapus.");
    res.redirect("/contact");
  } else {
    res.render("not-found", {
      title: "Contact tidak ada",
      url: req.url,
      layout: "layouts/main-layout",
    });
  }
});

// Halaman edit contact
app.get("/contact/update/:id", (req, res) => {
  const contact = findContact(req.params.id);
  console.log("🚀 ~ app.get ~ contact:", contact);

  res.render("update-contact", {
    title: "Update Contact",
    layout: "layouts/main-layout",
    url: req.url,
    contact,
  });
});
// halaman detail contact
app.get("/contact/:id", (req, res) => {
  // get params id
  const params = req.params;
  const contact = getDetailContact(params);

  const url = req.url;
  res.render("detail-contact", {
    layout: "layouts/main-layout",
    url,
    title: "Detail Contact Page",
    contact,
  });
});

// halaman cli
app.get("/cli", (req, res) => {
  const url = req.url;
  res.render("cli", {
    layout: "layouts/main-layout",
    url: url,
    title: "CLI ",
  });
});

// halaman not found
// Patikan tempatkan di akhir route karena jika di tempatkan paling atas / mengacu pada route ini
// middleware
app.use((req, res) => {
  res.status(404); // render jika res status 404
  res.render("not-found", {
    title: "Not-found Page",
    url: req.url,
    layout: "layouts/main-layout",
  });
});

// Menjalankan server dengan port yang telah ditentukan diawal
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
