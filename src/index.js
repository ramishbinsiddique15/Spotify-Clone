const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const collection = require('./config');
const app = express();
const fs = require('fs').promises;
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.use(express.static("public"));
// app.use(express.static(path.join(__dirname, 'public')));
// Add a route for fetching nasheeds
app.get('/getAlbums', async (req, res) => {
  try {
    const albumsPath = path.join(__dirname, '..', 'public', 'img', 'Nasheeds'); // Adjust path accordingly
    const folders = await fs.readdir(albumsPath);
    const albums = await Promise.all(folders.map(async folder => {
      const folderPath = path.join(albumsPath, folder);
      const stat = await fs.stat(folderPath);
      if (stat.isDirectory()) {
        return {
          folder,
          title: folder,
          description: `Description of ${folder}`,
          cover: `/img/Nasheeds/${folder}/cover.jpeg`
        };
      }
      return null;
    }));
    res.json({ albums: albums.filter(album => album) }); // Filter out null values
  } catch (error) {
    console.error('Error fetching albums:', error);
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