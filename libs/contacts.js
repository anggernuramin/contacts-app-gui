const fs = require("fs");

// membuat folder data jika belum ada
const dirPath = "./data";
// method stat berjalan secara asnychronous, method untuk cek apakah ada direktore apa belum
fs.stat(dirPath, (err) => {
  // Jika error true maka artinya data path belum ada,maka perlu membuat terlebih dahulu
  if (err) {
    fs.mkdirSync(dirPath);
  }
});

// membuat file jika belum ada
const dataPath = "./data/contacts.json";
// method existSync berjalan secara synchronous, method untuk cek apakah ada direktore apa belum sama seperti stat
if (!fs.existsSync(dataPath)) {
  fs.writeFileSync(dataPath, "[]", "utf-8");
}

// mengambil data kontak yang sudah ada
const getContacts = () => {
  let contacts = [];
  const readFileContacts = fs.readFileSync(dataPath, "utf-8");
  if (readFileContacts.trim() === "") {
    contacts = [];
  } else {
    contacts = JSON.parse(readFileContacts);
  }
  return contacts;
};
// save contact / menimpa contact yg sudah ada
const saveContacts = (contacts) => {
  return fs.writeFileSync(dataPath, JSON.stringify(contacts));
};

// Mencari data contact
const findContact = (id) => {
  const contacts = getContacts();
  return contacts.find((item) => item.id === id);
};
// get detail contact by id
const getDetailContact = (params) => {
  const data = getContacts();
  const contact = data.find((item) => item.id === params.id);
  return contact;
};

// cek duplikat id
const cekDuplikatId = (id) => {
  console.log("🚀 ~ cekDuplikatId ~ id:", id);
  const contacts = getContacts();
  const result = contacts.some(
    (item) => item.name.split(" ").join("") == id.split(" ").join("")
  );
  return result;
};

// manambahkan data contact
const addContacts = (contact) => {
  const contacts = getContacts();
  contacts.push(contact);
  fs.writeFileSync(dataPath, JSON.stringify(contacts));
};

// hapus contact
const deleteContact = (id) => {
  const contacts = getContacts();
  const filteredContact = contacts.filter((item) => item.id !== id);
  return saveContacts(filteredContact);
};

// edit contacts
const editContacts = (namaBaru) => {
  const contacts = getContacts();
  // hilangkan contact lama berdasarkan nama yang disimpan di oldName
  const filteredContact = contacts.filter(
    (contact) => contact.name != namaBaru.oldName
  );
  // hapus properti oldName dari namabaru karena tidak ingin disimpan di contacts.json(),hanya digunakan untuk pembanu menyimpan nama yang lama sebelum diedit
  delete namaBaru.oldName;
  filteredContact.push(namaBaru);
  saveContacts(filteredContact);
};

module.exports = {
  dirPath,
  getContacts,
  findContact,
  getDetailContact,
  addContacts,
  cekDuplikatId,
  deleteContact,
  editContacts,
};
