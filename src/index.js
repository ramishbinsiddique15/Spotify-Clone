const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const collection = require('./config');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.use(express.static("public"));
// app.use(express.static(path.join(__dirname, 'public')));
// Add a route for fetching nasheeds
app.get('/getNasheeds', async (req, res) => {
  try {
    const folder = req.query.folder; // Get the folder from the query parameters
    // Assuming `users` contains your nasheeds data
    const nasheeds = await users.find({ folder: folder }).toArray();
    res.json({ nasheeds: nasheeds });
  } catch (error) {
    console.error('Error fetching nasheeds:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get('/', (req, res) => {
  res.render('index');
})
app.get('/login', (req, res) => {
  res.render('login');
})
app.get('/signup', (req, res) => {
  res.render('signup');
})

app.post('/signup', async (req, res) => {
 const data = {
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    email: req.body.email,
    password: req.body.password
 }

 const existingUser = await collection.findOne({ email: data.email });
  if(existingUser){
     res.send('User already exists');
  }
else{
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(data.password, saltRounds);
  data.password = hashedPassword; 
 const userData = await collection.insertMany(data);
 console.log(userData);
 res.render('login');
}
})

app.post('/login', async (req, res) => {  
  const email = req.body.email;
  const password = req.body.password;
  console.log('Received login request for email:', email); // Log email for debugging
  const user = await collection.findOne({ email: email });
  console.log('Found user:', user); // Log user object for debugging
  if(user){
    const validPassword = await bcrypt.compare(password, user.password);
    if(validPassword){
      res.render('index');
    } else {
      res.send('Invalid password');
    }
  } else {
    res.send('User not found');
  }
});

const port =  5000
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
})