let current = new Audio();
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
  let a = await fetch(`/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  Nasheeds = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      Nasheeds.push(element.href.split(`/${folder}/`)[1]); 
    }
  }
  // show in playlist
  let songUl = document
    .querySelector(".songlist")
    .getElementsByTagName("ul")[0];
  songUl.innerHTML = "";
  for (const key of Nasheeds) {
    songUl.innerHTML =
      songUl.innerHTML +
      `<li>
    <img src="img/music-note-svgrepo-com.svg" class="invert" alt="">
    <div class="info flex ">
      <div>${key.replaceAll("%20", " ")}</div>
    </div>
    <div class="playnow flex">
      <span>Play Now</span>
    <img src="img/play-svgrepo-com.svg" class="invert" alt="">
  </div>
  </li>`;
  }
  // event listener for each song
  Array.from(
    document.querySelector(".songlist").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      // console.log(e.querySelector('.info').firstElementChild.innerHTML)
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });
  return Nasheeds;
}
const playMusic = (track, pause = false) => {
  // let audio = new Audio("/Nasheeds/"+track)

  current.src = `/${currFolder}/` + track;
  if (!pause) {
    current.play();
    play.src = "img/pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00/00:00";
};
async function displayAlbums() {
  let a = await fetch(`/Nasheeds/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  // console.log(div)
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector('.cardContainer')
  // console.log(anchors)
  let array = Array.from(anchors)
  for (let index = 0; index < array.length; index++) {
    const e = array[index];
    // console.log(e.href)
   if (e.href.includes("/Nasheeds")) {
      // console.log(e.href)
      let folder = e.href.split("/").slice(-2)[1]
      // console.log(folder)
      if(folder!= 'Nasheeds'){
        // console.log(folder)
//     //   get meta data of folder
      let a = await fetch(`/Nasheeds/${folder}/info.json`);
      let response = await a.json();
      // console.log(response)
      cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card rounded">
      <div class="play">
        <svg width="16px" height="16px" viewBox="-0.5 0 8 8" version="1.1" xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink">

          <title>play [#1001]</title>
          <desc>Created with Sketch.</desc>
          <defs>

          </defs>
          <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
            <g id="Dribbble-Light-Preview" transform="translate(-427.000000, -3765.000000)" fill="#000000">
              <g id="icons" transform="translate(56.000000, 160.000000)">
                <polygon id="play-[#1001]" points="371 3605 371 3613 378 3609">

                </polygon>
              </g>
            </g>
          </g>
        </svg>
      </div>

      <img class="rounded"
        src="/Nasheeds/${folder}/cover.jpeg" alt="">
        <div class="text">
      <h2>${response.title}</h2>
      <p>${response.description}</p>
      </div>
    </div>`
}
    }
  } 
    // event listener on card

    Array.from(document.getElementsByClassName("card")).forEach((e) => {
        e.addEventListener("click", async (item) => {
          Nasheeds = await getNasheeds(
            `Nasheeds/${item.currentTarget.dataset.folder}`
          );
          playMusic(Nasheeds[0])
        });
      });
    }
    async function main() {
      // get list
  Nasheeds = await getNasheeds(`Nasheeds/Aqib-Farid`);
  playMusic(Nasheeds[0], true);

  // display albums

  displayAlbums();

  // event listener for play pause
  play.addEventListener("click", () => {
    if (current.paused) {
      current.play();
      play.src = "img/pause.svg";
    } else {
      current.pause();
      play.src = "img/play-svgrepo-com.svg";
    }
  });

  // event listener for time update

  current.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${secToMinSec(
      current.currentTime
    )} / ${secToMinSec(current.duration)}`;
    document.querySelector(".circle").style.left =
      (current.currentTime / current.duration) * 100 + "%";
  });

  // event listener to seekbar

  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    current.currentTime = (current.duration * percent) / 100;
  });

  //event listener for hamburger

  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  //closing hamburger

  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  // event listener for previous and next

  prev.addEventListener("click", () => {
    let index = Nasheeds.indexOf(current.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) playMusic(Nasheeds[index - 1]);
  });
  next.addEventListener("click", () => {
    let index = Nasheeds.indexOf(current.src.split("/").slice(-1)[0]);
    if (index + 1 < Nasheeds.length) playMusic(Nasheeds[index + 1]);
  });

  // event listener for volume

  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      current.volume = e.target.value / 100;
      if (current.volume>0) {
        document.querySelector('.volume>img').src =  document.querySelector('.volume>img').src.replace('mute.svg','volume.svg')
      }
      if (current.volume==0) {
        document.querySelector('.volume>img').src =  document.querySelector('.volume>img').src.replace('volume.svg','mute.svg')
      }
    });

   
    // event listener to mute
    document.querySelector('.volume>img').addEventListener('click',e=>{
    if (e.target.src.includes('volume.svg')) {
      e.target.src =  e.target.src.replace('volume.svg','mute.svg') 
       current.volume = 0
       document
    .querySelector(".range")
    .getElementsByTagName("input")[0].value = 0
    }
    else{
       e.target.src =  e.target.src.replace('mute.svg','volume.svg') 
       current.volume = 0.10
       document
    .querySelector(".range")
    .getElementsByTagName("input")[0].value = 10
    }
    
    })

}
main();
