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

// set the message for form status
function setSuccessMessage(message) {
  document.getElementById("message").innerHTML = message;
}
function editDataCall(id) {
  // call get user details by id API
  fetch("crud/getUserByID?id=" + id, {
    method: "GET",
  })
    .then((res) => res.json())
    .then((response) => {
      console.log("Edit info", response);
      editFormData = response[0];
      setFormData(editFormData.name, editFormData.email);
    });
}

// callled this function when user click on button
function submitForm() {
  if (!editFormData)
    addUser(); // if the editFormData is undefined then call addUser()
  else editData();
}
// add user function
function addUser() {
  let payload = getFormData();
  fetch("/crud/insertData", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })
    .then((res) => res.json())
    .then((response) => {
      setSuccessMessage(response.message);
      // clear input email and name
      clearFormData();
      getData(); // reload table
    });
}

// edit data
function editData() {
  var formData = getFormData();
  formData["id"] = editFormData._id; // get _id from selected user
  fetch("/crud/updateData", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  })
    .then((res) => res.json())
    .then((response) => {
      setSuccessMessage(response.message);
      clearFormData(); // clear the form field
      getData(); // reload the table
    });
}

// delete data
function deleteData(id) {
  fetch("/crud/delete?id=" + id)
    .then((res) => res.json())
    .then((response) => {
      setSuccessMessage(response.message);
      getData();
    });
}

// get data method

function getData() {
  fetch("/crud/getListData")
    .then((res) => res.json())
    .then((response) => {
      var tmpData = "";
      console.log(response);
      response.forEach((user) => {
        tmpData += "<tr>";
        tmpData += "<td>" + user.name + "</td>";
        tmpData += "<td>" + user.email + "</td>";
        tmpData +=
          "<td><button class='btn btn-primary' onclick='editDataCall(" +
          user._id +
          ")'>Edit</button></td>";
        tmpData +=
          "<td><button class='btn btn-danger' onclick='deleteData(" +
          user._id +
          ")'>Delete</button></td>";

        tmpData += "</tr>";
      });
      document.getElementById("tbData").innerHTML = tmpData;
    });
}

getData();
