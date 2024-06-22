const current = new Audio();
let Nasheeds;
let currFolder;

// Function to convert seconds to mm:ss format
function secToMinSec(sec) {
  if (isNaN(sec) || sec < 0) return "00:00";
  const min = Math.floor(sec / 60);
  const remSec = Math.floor(sec % 60);
  const updatedMin = String(min).padStart(2, "0");
  const updatedSec = String(remSec).padStart(2, "0");
  return `${updatedMin}:${updatedSec}`;
}

async function getNasheeds(folder) {
  currFolder = folder;
  try {
    const response = await fetch(`/getNasheeds/${folder}`);
    if (!response.ok) {
      throw new Error(`Error fetching nasheeds: ${response.statusText}`);
    }
    const data = await response.json();
    Nasheeds = data.nasheeds;

    const songUl = document.querySelector(".songlist ul");
    songUl.innerHTML = "";
    Nasheeds.forEach((fileName) => {
      songUl.innerHTML += `<li>
          <img src="img/music-note-svgrepo-com.svg" class="invert" alt="">
          <div class="info flex ">
            <div>${fileName}</div>
          </div>
          <div class="playnow flex">
            <span>Play Now</span>
            <img src="img/play-svgrepo-com.svg" class="invert" alt="">
          </div>
        </li>`;
    });

    document.querySelectorAll(".songlist li").forEach((e, index) => {
      e.addEventListener("click", () => {
        playMusic(Nasheeds[index]);
      });
    });
    return Nasheeds;
  } catch (error) {
    console.error("Error fetching nasheeds:", error);
    return [];
  }
}

async function displayAlbums() {
  try {
    const response = await fetch(`/getAlbums`);
    const data = await response.json();
    const cardContainer = document.querySelector(".cardContainer");
    cardContainer.innerHTML = "";
    data.albums.forEach((album, index) => {
      const heartId = `heart-${index}`; // Unique ID for each heart icon
      const isRed = localStorage.getItem(heartId) === 'true'; // Check if the heart icon should be red

      cardContainer.innerHTML += `
        <div data-folder="${album.folder}" class="card rounded">
          <form action="/database" method="post">
            <input type="hidden" name="firstname" value="${album.folder}">
            <input type="hidden" name="lastname" value="${album.title}">
            <input type="hidden" name="email" value="${album.description}">
            <input type="hidden" name="password" value="${album.cover}">
            <button type="submit" id="btn" class="btn">
              <svg id="${heartId}" class="heart-icon ${isRed ? '' : 'invert'}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="${isRed ? 'red' : 'none'}" stroke="${isRed ? 'red' : 'currentColor'}">
                <path d="M19.4626 3.99415C16.7809 2.34923 14.4404 3.01211 13.0344 4.06801C12.4578 4.50096 12.1696 4.71743 12 4.71743C11.8304 4.71743 11.5422 4.50096 10.9656 4.06801C9.55962 3.01211 7.21909 2.34923 4.53744 3.99415C1.01807 6.15294 0.221721 13.2749 8.33953 19.2834C9.88572 20.4278 10.6588 21 12 21C13.3412 21 14.1143 20.4278 15.6605 19.2834C23.7783 13.2749 22.9819 6.15294 19.4626 3.99415Z" stroke-width="1.5" stroke-linecap="round" />
              </svg>
            </button>
          </form>

          <div class="play">
            <svg class="heart" width="16px" height="16px" viewBox="-0.5 0 8 8" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
              <title>play [#1001]</title>
              <desc>Created with Sketch.</desc>
              <defs></defs>
              <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                <g id="Dribbble-Light-Preview" transform="translate(-427.000000, -3765.000000)" fill="#000000">
                  <g id="icons" transform="translate(56.000000, 160.000000)">
                    <polygon id="play-[#1001]" points="371 3605 371 3613 378 3609"></polygon>
                  </g>
                </g>
              </g>
            </svg>
          </div>
          <img class="rounded" src="${album.cover}" alt="">
          <div class="text">
            <h2>${album.title}</h2>
            <p>${album.description}</p>
          </div>
        </div>`;
    });

    document.querySelectorAll(".card").forEach((card) => {
      card.addEventListener("click", async () => {
        Nasheeds = await getNasheeds(card.dataset.folder);
        if (Nasheeds.length > 0) {
          playMusic(Nasheeds[0]);
        }
      });
    });

    document.querySelectorAll(".heart-icon").forEach((heartIcon) => {
      heartIcon.addEventListener("click", (event) => {
        event.stopPropagation(); // Prevent the card click event from triggering
        const heartId = heartIcon.id;
        heartIcon.classList.toggle("invert");
        const isRed = !heartIcon.classList.contains("invert");
        localStorage.setItem(heartId, isRed); // Save the state to localStorage

        if (isRed) {
          heartIcon.style.fill = "red";
          heartIcon.style.stroke = "red";
        } else {
          heartIcon.style.fill = "none";
          heartIcon.style.stroke = "currentColor";
        }
      });
    });
  } catch (error) {
    console.error("Error fetching albums:", error);
  }
}




// Function to play a nasheed
const playMusic = (track, pause = false) => {
  const audioSrc = `/img/Nasheeds/${currFolder}/${track}`;
  current.src = audioSrc;
  current.load();
  current.addEventListener("canplaythrough", () => {
    if (!pause) {
      current
        .play()
        .then(() => {
          document.getElementById("play").src = "img/pause.svg";
        })
        .catch((error) => {
          console.error("Error playing audio:", error);
        });
    }
  });

  current.addEventListener("error", (e) => {
    console.error("Error loading audio:", e);
  });

  const songInfoElement = document.querySelector(".songinfo");
  const songTimeElement = document.querySelector(".songtime");

  if (songInfoElement) {
    songInfoElement.innerHTML = decodeURI(track);
  } else {
    console.error(".songinfo element not found");
  }

  if (songTimeElement) {
    songTimeElement.innerHTML = "00:00/00:00";
  } else {
    console.error(".songtime element not found");
  }
};

// Main function to initialize the application
async function main() {
  // await databaseMangta(); // Wait for databaseMangta() to complete
  Nasheeds = await getNasheeds("Aqib-Farid");
  if (Nasheeds.length > 0) {
    playMusic(Nasheeds[0], true);
  }
  displayAlbums();

  // Event listeners for player controls
  document.getElementById("play").addEventListener("click", () => {
    if (current.paused) {
      current.play();
      document.getElementById("play").src = "img/pause.svg";
    } else {
      current.pause();
      document.getElementById("play").src = "img/play-svgrepo-com.svg";
    }
  });

  // Update song time display while playing
  current.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${secToMinSec(
      current.currentTime
    )} / ${secToMinSec(current.duration)}`;
    document.querySelector(".circle").style.left =
      (current.currentTime / current.duration) * 100 + "%";
  });

  // Seek to a position when seekbar is clicked
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    current.currentTime = (current.duration * percent) / 100;
  });

  // Show sidebar when hamburger icon is clicked
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  // Close sidebar when close icon is clicked
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  // Play previous nasheed when previous button is clicked
  document.getElementById("prev").addEventListener("click", () => {
    let index = Nasheeds.indexOf(
      decodeURIComponent(current.src.split("/").slice(-1)[0])
    );
    if (index - 1 >= 0) playMusic(Nasheeds[index - 1]);
  });

  // Play next nasheed when next button is clicked
  document.getElementById("next").addEventListener("click", () => {
    let index = Nasheeds.indexOf(
      decodeURIComponent(current.src.split("/").slice(-1)[0])
    );
    if (index + 1 < Nasheeds.length) playMusic(Nasheeds[index + 1]);
  });

  // Change volume when volume range input is changed
  document.querySelector(".range input").addEventListener("change", (e) => {
    current.volume = e.target.value / 100;
    if (current.volume > 0) {
      document.querySelector(".volume>img").src = "img/volume.svg";
    }
    if (current.volume == 0) {
      document.querySelector(".volume>img").src = "img/mute.svg";
    }
  });

  // Mute/unmute volume when volume icon is clicked
  document.querySelector(".volume>img").addEventListener("click", (e) => {
    if (e.target.src.includes("volume.svg")) {
      e.target.src = "img/mute.svg";
      current.volume = 0;
      document.querySelector(".range input").value = 0;
    } else {
      e.target.src = "img/volume.svg";
      current.volume = 0.1;
      document.querySelector(".range input").value = 10;
    }
  });
  

}
document.querySelector("#settings").addEventListener("click", () => {
  const popup = document.querySelector(".popup");
  if (popup.style.display === "none" || popup.style.display === "") {
    popup.style.display = "flex";
    popup.style.flexDirection = "column"; // Set flex direction to column
  } else {
    popup.style.display = "none";
  }
});

// Call the main function to initialize the application
main();
