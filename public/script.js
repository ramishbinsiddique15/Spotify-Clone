const current = new Audio();
let Nasheeds;
let currFolder;

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
    const data = await response.json();
    Nasheeds = data.nasheeds;
    const songUl = document.querySelector(".songlist ul");
    songUl.innerHTML = "";
    Nasheeds.forEach(key => {
      songUl.innerHTML +=
        `<li>
          <img src="img/music-note-svgrepo-com.svg" class="invert" alt="">
          <div class="info flex ">
            <div>${key}</div>
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
    console.error('Error fetching nasheeds:', error);
    return [];
  }
}

const playMusic = (track, pause = false) => {
  current.src = `/${currFolder}/${track}`;
  if (!pause) {
    current.play();
    play.src = "img/pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00/00:00";
};

async function displayAlbums() {
  try {
    const response = await fetch(`/getAlbums`);
    const data = await response.json();
    const cardContainer = document.querySelector('.cardContainer');
    cardContainer.innerHTML = "";
    data.albums.forEach(album => {
      cardContainer.innerHTML += `
        <div data-folder="${album.folder}" class="card rounded">
          <div class="play">
            <svg width="16px" height="16px" viewBox="-0.5 0 8 8" version="1.1" xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink">
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
          <img class="rounded" src="/img/Nasheeds/${album.folder}/cover.jpeg" alt="">
          <div class="text">
            <h2>${album.title}</h2>
            <p>${album.description}</p>
          </div>
        </div>`;
    });
    document.querySelectorAll('.card').forEach(card => {
      card.addEventListener('click', async () => {
        Nasheeds = await getNasheeds(`Nasheeds/${card.dataset.folder}`);
        playMusic(Nasheeds[0]);
      });
    });
  } catch (error) {
    console.error('Error fetching albums:', error);
  }
}

async function main() {
  Nasheeds = await getNasheeds(`Nasheeds/Aqib-Farid`);
  playMusic(Nasheeds[0], true);
  displayAlbums();

  document.getElementById("play").addEventListener("click", () => {
    if (current.paused) {
      current.play();
      play.src = "img/pause.svg";
    } else {
      current.pause();
      play.src = "img/play-svgrepo-com.svg";
    }
  });

  current.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${secToMinSec(
      current.currentTime
    )} / ${secToMinSec(current.duration)}`;
    document.querySelector(".circle").style.left =
      (current.currentTime / current.duration) * 100 + "%";
  });

  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    current.currentTime = (current.duration * percent) / 100;
  });

  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  document.getElementById("prev").addEventListener("click", () => {
    let index = Nasheeds.indexOf(current.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) playMusic(Nasheeds[index - 1]);
  });

  document.getElementById("next").addEventListener("click", () => {
    let index = Nasheeds.indexOf(current.src.split("/").slice(-1)[0]);
    if (index + 1 < Nasheeds.length) playMusic(Nasheeds[index + 1]);
  });

  document.querySelector(".range input").addEventListener("change", (e) => {
    current.volume = e.target.value / 100;
    if (current.volume > 0) {
      document.querySelector('.volume>img').src = document.querySelector('.volume>img').src.replace('mute.svg', 'volume.svg')
    }
    if (current.volume == 0) {
      document.querySelector('.volume>img').src = document.querySelector('.volume>img').src.replace('volume.svg', 'mute.svg')
    }
  });

  document.querySelector('.volume>img').addEventListener('click', e => {
    if (e.target.src.includes('volume.svg')) {
      e.target.src = e.target.src.replace('volume.svg', 'mute.svg')
      current.volume = 0
      document.querySelector(".range input").value = 0
    }
    else {
      e.target.src = e.target.src.replace('mute.svg', 'volume.svg')
      current.volume = 0.10
      document.querySelector(".range input").value = 10
    }
  });
}

main();
