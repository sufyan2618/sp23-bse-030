// Initialize data in localStorage if it doesn't exist
if (!localStorage.getItem('users')) {
  localStorage.setItem('users', JSON.stringify([]));
}

var editFormData;

function getFormData() {
  return {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
  };
}

function clearFormData() {
  document.getElementById("name").value = "";
  document.getElementById("email").value = "";
}

function setFormData(name, email) {
  document.getElementById("name").value = name;
  document.getElementById("email").value = email;
}

function setSuccessMessage(message) {
  document.getElementById("message").innerHTML = message;
}

function generateUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function editDataCall(id) {
  const users = JSON.parse(localStorage.getItem('users'));
  const user = users.find(user => user._id === id);
  if (user) {
    editFormData = user;
    setFormData(editFormData.name, editFormData.email);
  }
}

function submitForm() {
  if (!editFormData)
    addUser();
  else editData();
}

function addUser() {
  let payload = getFormData();
  payload._id = generateUniqueId();
  const users = JSON.parse(localStorage.getItem('users'));
  users.push(payload);
  localStorage.setItem('users', JSON.stringify(users));
  setSuccessMessage("User added successfully");
  clearFormData();
  getData();
}

function editData() {
  var formData = getFormData();
  formData["_id"] = editFormData._id;
  const users = JSON.parse(localStorage.getItem('users'));
  const index = users.findIndex(user => user._id === formData._id);
  if (index !== -1) {
    users[index] = formData;
    localStorage.setItem('users', JSON.stringify(users));
    setSuccessMessage("User updated successfully");
    clearFormData();
    editFormData = null; // Reset editFormData after editing
    getData();
  }
}

function deleteData(id) {
  let users = JSON.parse(localStorage.getItem('users'));
  users = users.filter(user => user._id !== id);
  localStorage.setItem('users', JSON.stringify(users));
  setSuccessMessage("User deleted successfully");
  getData();
}

function getData() {
  const users = JSON.parse(localStorage.getItem('users'));
  var tmpData = "";
  users.forEach((user) => {
    tmpData += "<tr>";
    tmpData += "<td>" + user.name + "</td>";
    tmpData += "<td>" + user.email + "</td>";
    tmpData +=
      "<td><button class='btn btn-primary' onclick='editDataCall(\"" +
      user._id +
      "\")'>Edit</button></td>";
    tmpData +=
      "<td><button class='btn btn-danger' onclick='deleteData(\"" +
      user._id +
      "\")'>Delete</button></td>";
    tmpData += "</tr>";
  });
  document.getElementById("tbData").innerHTML = tmpData;
}

getData();