const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const fs = require("fs").promises;
const collection = require("./config");
const app = express();
const port = 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.use(express.static("public"));

// Function to read info.json file
async function readInfoFile(folderPath) {
  try {
    const infoPath = path.join(folderPath, "info.json");
    const infoData = await fs.readFile(infoPath, "utf8");
    return JSON.parse(infoData);
  } catch (error) {
    console.error(`Error reading info.json: ${error}`);
    return {};
  }
}

// Route to fetch albums
app.get("/getAlbums", async (req, res) => {
  try {
    const albumsPath = path.join(__dirname, "..", "public", "img", "Nasheeds");
    const folders = await fs.readdir(albumsPath);
    const albums = await Promise.all(
      folders.map(async (folder) => {
        const folderPath = path.join(albumsPath, folder);
        const stat = await fs.stat(folderPath);
        if (stat.isDirectory()) {
          const infoJson = await readInfoFile(folderPath);
          return {
            folder,
            title: infoJson.title || folder,
            description: infoJson.description || "",
            cover: `/img/Nasheeds/${folder}/cover.jpeg`,
          };
        }
        return null;
      })
    );
    res.json({ albums: albums.filter((album) => album) });
  } catch (error) {
    console.error("Error fetching albums:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route to fetch nasheeds
app.get("/getNasheeds/:folder", async (req, res) => {
  try {
    const folder = req.params.folder;
    if (!folder) {
      return res.status(400).json({ error: "Folder parameter is required" });
    }
    const folderPath = path.join("public", "img", "Nasheeds", folder);
    const stat = await fs.stat(folderPath);
    if (!stat.isDirectory()) {
      return res.status(400).json({ error: "Not a directory" });
    }

    const files = await fs.readdir(folderPath);
    const audioFiles = files.filter((file) =>
      [".mp3", ".wav", ".ogg"].includes(path.extname(file).toLowerCase())
    );
    res.json({ nasheeds: audioFiles });
  } catch (error) {
    console.error("Error fetching nasheeds:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/", (req, res) => {
  res.render("login",{errorMessage: ""});
});
app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/index", (req, res) => {
  res.render("index");
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.post("/signup", async (req, res) => {
  const data = {
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    email: req.body.email,
    password: req.body.password,
  };

  const existingUser = await collection.findOne({ email: data.email });
  if (existingUser) {
    res.render("login",{errorMessage: "User already exists"});
  } else {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);
    data.password = hashedPassword;
    const userData = await collection.insertMany(data);
    res.render("login",{errorMessage: "User created successfully"});
  }
});
let user = {}; // Changed from const to let

app.post("/login", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  user = await collection.findOne({ email: email });
  if (user) {
    const validPassword = await bcrypt.compare(password, user.password);
    if (validPassword) {
      res.redirect("/index");
    } else {
      res.render("login", { errorMessage: "Invalid password" }); // Render login page with error message
    }
  } else {
    res.render("login", { errorMessage: "Incorrect Email or Password" }); // Render login page with error message
  }
});

app.get("/delete", async (req, res) => {
  await collection.deleteOne({
    email: user.email,
  });
  res.render("login",{errorMessage: "User deleted successfully"});
}      
);
app.get("/logout", (req, res) => {
  res.render("login",{errorMessage: "Logged out successfully"});
});
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
