let currentSong = new Audio();
let songs;
let currFolder;
let isShuffleEnabled = false;
let isRepeatEnabled = false;
let shuffledSongs = [];
let shuffledIndex = 0;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    try {
        const response = await fetch(`${folder}/`);
        
        // Check if response is successful (status 200-299)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    
        const text = await response.text();
        let div = document.createElement("div");
        div.innerHTML = text;
        let as = div.getElementsByTagName("a")
        songs = []
        for (let index = 0; index < as.length; index++) {
            const element = as[index];
            if (element.href.endsWith(".mp3")) {
                try {
                    const fileName = new URL(element.href).pathname.split('/').pop();
                    songs.push(decodeURIComponent(fileName));
                } catch (e) {
                    console.error('Error processing song URL:', e);
                }
            }
        }

        // Show all the songs in the playlist
        let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0]
        songUL.innerHTML = ""
        for (const song of songs) {
            songUL.innerHTML = songUL.innerHTML + `<li> <img class="invert" src="/Svg/music.svg" alt="">
                                <div class="info">
                                    <div> ${song.replaceAll("%20", " ")} </div>
                                    <div>Artist</div>
                                </div>
                                <div class="playnow">
                                    <span>Play Now</span>
                                    <img src="/Svg/play.svg" alt="">
                                </div></li>`;
        }

        // Update shuffledSongs array
        shuffledSongs = songs.slice(); // Make a copy of the original array

        // Attach an event listener to each song
        Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
            e.addEventListener("click", element => {
                playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
            })
        })

    } catch (error) {
        console.error('Error loading songs:', error);
        // You can add user-facing error messages here
        alert('Failed to load songs. Please check your internet connection.');
    }

}

// const playMusic = (track, pause = false) => {
//     currentSong.src = `${currFolder}/` + track
function playMusic(track, pause = false) {
    const encodedTrack = encodeURIComponent(track);
    
    const finalTrack = encodedTrack.replace(/%20/g, ' ');
    
    currentSong.src = `${currFolder}/${finalTrack}`;
    if (!pause) {
        currentSong.play()
        play.src = "/Svg/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

async function displayAlbums() {
    try {
        // Replace this with actual album data or create a manifest file
        const albums = [
            {
                folder: "Softmusic",
                title: "Soft Music",
                description: "Relaxing tunes"
            }
            // Add more albums as needed
        ];

        let cardContainer = document.querySelector(".cardContainer");
        cardContainer.innerHTML = ""; // Clear existing content

        for (const album of albums) {
            const response = await fetch(`songs/${album.folder}/info.json`);
            const info = await response.json();
            
            // Create card element
            const card = document.createElement("div");
            card.className = "card";
            card.innerHTML = `
                <div class="play">
                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none">

                    <circle cx="12" cy="12" r="10" fill="#1ed760" />

                    <polygon points="10 7 17 12 10 17 10 7" fill="#000000" />

                    <circle cx="12" cy="12" r="100" stroke="#000000" stroke-width="1.5" />
                    <path d="M15.4531 12.3948C15.3016 13.0215 14.5857 13.4644 13.1539 14.3502C11.7697 15.2064 11.0777 15.6346 10.5199 15.4625C10.2893 15.3913 10.0793 15.2562 9.90982 15.07C9.5 14.6198 9.5 13.7465 9.5 12C9.5 10.2535 9.5 9.38018 9.90982 8.92995C10.0793 8.74381 10.2893 8.60868 10.5199 8.53753C11.0777 8.36544 11.7697 8.79357 13.1539 9.64983C14.5857 10.5356 15.3016 10.9785 15.4531 11.6052C15.5156 11.8639 15.5156 12.1361 15.4531 12.3948Z" stroke="" stroke-width="1.5" stroke-linejoin="round" />
                    </svg>
                </div>
                <img src="songs/${album.folder}/cover.jpg" alt="${info.title}">
                <h2>${info.title}</h2>
                <p>${info.description}</p>
            `;

            card.addEventListener("click", () => getSongs(`songs/${album.folder}`));
            cardContainer.appendChild(card);
        }
    } catch (error) {
        console.error('Error loading albums:', error);
        alert('Failed to load albums');
    }
}

async function main() {
    // Get the list of the songs
    await getSongs("songs/Softmusic")

    // Add null check for songs array
    if (songs && songs.length > 0) {
        playMusic(songs[0], true);
        let currentSongIndex = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    } else {
        console.error("No songs found in the initial folder");
        alert("No songs found in the selected playlist");
    }

    // Display all the albums on the page
    displayAlbums()

    let currentSongIndex = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);

    // Attach an event listener to play, next and previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "/Svg/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "/Svg/play.svg"
        }
    })

    // Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    // Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    // Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    // Add an event listener for close hamburger
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-130%"
    })

    // Add an event listener for repeat
    repeat.addEventListener("click", () => {
        console.log("Repeat clicked");

        // Toggle repeat functionality
        isRepeatEnabled = !isRepeatEnabled;
        repeat.src = isRepeatEnabled ? "/Svg/repeatgreen.svg" : "/Svg/repeat.svg";

        if (isRepeatEnabled) {
            currentSong.loop = true;
        } else {
            currentSong.loop = false;
        }

    })

    // Listen for the 'ended' event on the audio element
    currentSong.addEventListener('ended', () => {
        if (isRepeatEnabled) {
            repeatCurrentSong();
        } else if (isShuffleEnabled) {
            // If shuffle is enabled, play the next shuffled song
            let nextIndex = getRandomIndex();
            playMusic(songs[nextIndex], true);
            currentSongIndex = nextIndex;
            // Automatically play the next shuffled song
            currentSong.play();
        } else {
            // Play the next song or repeat the current one if it's the last song
            playNextOrRepeat();
        }
    });

    // Function to repeat the current song
    function repeatCurrentSong() {
        playMusic(songs[currentSongIndex], true);
        currentSong.play();
    }

    // Function to play the next song or repeat the current one if it's the last song
    function playNextOrRepeat() {
        let nextIndex = currentSongIndex + 1;
        if (nextIndex < songs.length) {
            playMusic(songs[nextIndex], true);
            currentSongIndex = nextIndex;
        } else {
            currentSong.pause();
            play.src = "/Svg/play.svg";
            currentSongIndex = -1;
        }
    }


    // Add an event listener for shuffle
    shuffle.addEventListener("click", () => {
        console.log("Shuffle clicked");

        // Toggle shuffle functionality
        isShuffleEnabled = !isShuffleEnabled;
        shuffle.src = isShuffleEnabled ? "/Svg/shufflegreen.svg" : "/Svg/shuffle.svg";

        if (isShuffleEnabled) {
            shuffleArray(songs);
        }
    })

    // Listen for the 'ended' event on the audio element
    currentSong.addEventListener('ended', () => {
        if (isRepeatEnabled) {
            playMusic(songs[currentSongIndex], true);
        } else if (isShuffleEnabled) {
            // If shuffle is enabled, play the next shuffled song
            let nextIndex = getRandomIndex();
            playMusic(songs[nextIndex], true);
            currentSongIndex = nextIndex;
            // Automatically play the next shuffled song
            currentSong.play();

        } else {
            // Implement logic for playing the next song in the playlist
            let nextIndex = currentSongIndex + 1;
            if (nextIndex < songs.length) {
                playMusic(songs[nextIndex], true);
                currentSongIndex = nextIndex;
            } else {
                // If it's the last song, stop playback or implement your logic
                currentSong.pause();
                play.src = "/Svg/play.svg";
                currentSongIndex = -1;
            }
        }
    })

}

// Function to shuffle an array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Function to get a random index for shuffle
function getRandomIndex() {
    return Math.floor(Math.random() * songs.length);
}


// Add an event listener to previous
previous.addEventListener("click", () => {
    console.log("Previous clicked")
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
    if ((index - 1) > 0) {
        playMusic(songs[index - 1])
    }
})

// Add an event listener to next
next.addEventListener("click", () => {
    console.log("Next clicked")
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
    if ((index + 1) < songs.length) {
        playMusic(songs[index + 1])
    }
})

// Add an event listener to volume
document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
    console.log("Setting volume to", e.target.value, "/100")
    currentSong.volume = parseInt(e.target.value) / 100
    if (currentSong.volume > 0) {
        document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace
            ("Svg/mute.svg", "Svg/volume.svg")
    }
})

// Add event listener to mute the track
document.querySelector(".volume>img").addEventListener("click", e => {
    if (e.target.src.includes("Svg/volume.svg")) {
        e.target.src = e.target.src.replace("Svg/volume.svg", "Svg/mute.svg")
        currentSong.volume = 0;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
    }
    else {
        e.target.src = e.target.src.replace("Svg/mute.svg", "Svg/volume.svg")
        currentSong.volume = .1;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
    }
})


main()