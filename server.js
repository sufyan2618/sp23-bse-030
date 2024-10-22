const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

const dataFile = path.join(__dirname, 'data.json');

// Helper function to read data from JSON file
function readData() {
  const rawData = fs.readFileSync(dataFile);
  return JSON.parse(rawData);
}

// Helper function to write data to JSON file
function writeData(data) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

app.post('/crud/insertData', (req, res) => {
  const users = readData();
  const newUser = {
    _id: Date.now().toString(),
    name: req.body.name,
    email: req.body.email
  };
  users.push(newUser);
  writeData(users);
  res.json({ message: 'User added successfully' });
});

app.get('/crud/getListData', (req, res) => {
  const users = readData();
  res.json(users);
});

app.post('/crud/updateData', (req, res) => {
  const { id, name, email } = req.body;
  const users = readData();
  const userIndex = users.findIndex(user => user._id === id);
  if (userIndex !== -1) {
    users[userIndex] = { ...users[userIndex], name, email };
    writeData(users);
    res.json({ message: 'User updated successfully' });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

app.get('/crud/delete', (req, res) => {
  const id = req.query.id;
  let users = readData();
  users = users.filter(user => user._id !== id);
  writeData(users);
  res.json({ message: 'User deleted successfully' });
});

app.get('/crud/getUserByID', (req, res) => {
  const id = req.query.id;
  const users = readData();
  const user = users.find(user => user._id === id);
  if (user) {
    res.json([user]);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});