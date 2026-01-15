let currentSongs = new Audio();
let songs;
let x = currentSongs.volume;
let currFolder;

function secondsToMinutes(seconds){
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    
    return `${formattedMinutes}:${formattedSeconds}`;
}
async function getSongs(folder){
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    let songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if(element.href.endsWith(".mp3")){
            songs.push(element.href.split(`${folder}`)[1]);
        }
    }
    let songUL = document.querySelector(".songsList").getElementsByTagName("ul")[0];
    songUL.innerHTML = ""; // Clear existing songs
    for (const song of songs) {
        const li = document.createElement("li");
        li.innerHTML = `
            <div class="musicCards">
                <div class="musicInfo">
                    <div class="adjust">
                        <img src="Images/music.svg" alt="">
                        <div>${song.replaceAll("%20", " ")}</div>
                    </div>
                    <img src="Images/play-button-svgrepo-com.svg" alt="">
                </div>
                <div class="artists">Artist</div>
            </div>`;
        songUL.appendChild(li);
    }

    Array.from(document.querySelector(".songsList").getElementsByTagName("li")).forEach(e =>{
        e.addEventListener("click", element =>{ 
            playMusic(e.querySelector('.musicInfo :nth-child(2)').innerHTML.trim())
        })
    })

    return songs;
}

let playMusic = (track, pause=false)=>{
    currentSongs.src = (`${currFolder }` + track);
    if(!pause){
        currentSongs.play();
        play.src = "Images/pause.svg";
    }
    document.querySelector(".songInfo").innerHTML = decodeURI(track);
    document.querySelector(".duration").innerHTML = "00:00 / 00:00";

}
async function displayAlbums() {
    console.log("displaying albums")
    let a = await fetch(`/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index]; 
        if (e.href.includes("/songs/") && !e.href.includes("/songs/.")) {
            let folder = e.href.split("/").slice(-2)[0]
            console.log(folder)
        //     // Get the metadata of the folder
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json(); 
            cardContainer.innerHTML = cardContainer.innerHTML + ` <div data-folder="${folder}" class="cardPlaylists">
            <img class="cardImg" src="/songs/${folder}/cover.jpeg" alt="">
            <span>
                <h2>${response.title}</h2>
                <p>${response.description}</p>
            </span>
        </div>`
        }
    }
    
    Array.from(document.getElementsByClassName("cardPlaylists")).forEach(e => { 
        e.addEventListener("click", async item => {
            console.log("Fetching Songs")
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}/`)

        })
    })
}
async function main(){
    songs = await getSongs("/songs/English/");
    playMusic(songs[0], true); 

    displayAlbums();

    play.addEventListener("click", () =>{
        if(currentSongs.paused){
            currentSongs.play();
            play.src = "Images/pause.svg";
        }
        else{
            currentSongs.pause();
            play.src = "Images/play.svg";
        }
    })

    range.value = 0;
    volSet.value = 100;

    document.querySelector(".hamburger").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = "0";
    })

    document.querySelector(".close").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = "-150%";
    })

    previous.addEventListener("click", ()=>{
        currentSongs.pause()
        let index = songs.indexOf(`/${currentSongs.src.split("/").slice(-1)[0]}`);
        if((index - 1) >= 0){
            playMusic(songs[index-1]);
        }
    })
    next.addEventListener("click", ()=>{
        let index = songs.indexOf(`/${currentSongs.src.split("/").slice(-1)[0]}`);
        console.log(index)
        if((index + 1) < songs.length){
            playMusic(songs[index+1]);
        }
    })

    volSet.addEventListener("change", (e) =>{
        console.log("setting volume to: " + e.target.value + "/100");
        currentSongs.volume = parseInt(e.target.value)/100;
        if(currentSongs.volume == 0){
            vol.src = "Images/mute.svg";
        }
        else{
            vol.src = "Images/volume.svg";
        }
        let percent = e.target.value; // Volume percentage (0 to 100)
        volSet.style.background = `linear-gradient(to right, rgb(118, 255, 118) ${percent}%, #ffffff ${percent}%, #ffffff 100%)`;
    })

    vol.addEventListener("click", () => {
        if(currentSongs.volume){
            x = currentSongs.volume;
            currentSongs.volume = 0.0;
            vol.src = "Images/mute.svg";
            volSet.value = 0;
        }
        else{
            currentSongs.volume = x;
            vol.src = "Images/volume.svg";
            volSet.value = x * 100;
        }
    })

    currentSongs.addEventListener("timeupdate", () => {
        document.querySelector(".duration").innerHTML = 
            `${secondsToMinutes(currentSongs.currentTime)} / ${secondsToMinutes(currentSongs.duration)}`;
        
        let percent = (currentSongs.currentTime / currentSongs.duration) * 100;
        range.value = percent;
    
        // Update seekbar color dynamically
        range.style.background = `linear-gradient(to right, rgb(118, 255, 118) ${percent}%, rgb(115, 255, 115) ${percent}%, #ffffff ${percent}%, #ffffff 100%)`;
    });
    

    range.addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        range.value = percent;
        currentSongs.currentTime = ((currentSongs.duration) * percent) / 100;
    
        // Update gradient immediately
        range.style.background = `linear-gradient(to right, rgb(118, 255, 118) ${percent}%, rgb(115, 255, 115) ${percent}%, #ffffff ${percent}%, #ffffff 100%)`;;
    });    

    
}

main()