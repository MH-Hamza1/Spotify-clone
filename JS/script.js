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
        currFolder = `songs/${folder}`;

        // Load from manifest instead of directory listing
        const manifest = await fetch('/songs/manifest.json');
        const data = await manifest.json();

        const album = data.albums.find(a => a.folder === folder);
        if (!album) throw new Error('Album not found');

        songs = album.songs;

        const songUL = document.querySelector(".songlist ul");
        songUL.innerHTML = songs.map(song => `
        <li>
          <img class="invert" src="/Svg/music.svg" alt="">
          <div class="info">
            <div>${song.replace('.mp3', '')}</div>
            <div>Artist</div>
          </div>
          <div class="playnow">
            <span>Play Now</span>
            <img src="/Svg/play.svg" alt="">
          </div>
        </li>
      `).join('');

        // Attach event listeners
        Array.from(songUL.children).forEach((e, index) => {
            e.addEventListener("click", () => playMusic(songs[index]));
        });

    } catch (error) {
        console.error('Error loading songs:', error);
        alert('Failed to load songs. Please check the playlist');
    }
}

function playMusic(track, pause = false) {
    const encodedTrack = encodeURIComponent(track);
    const finalTrack = encodedTrack.replace(/%20/g, ' ');
    currentSong.src = `${currFolder}/${finalTrack}`;
    
    // Update current index
    currentSongIndex = songs.findIndex(song => 
        decodeURIComponent(song) === decodeURIComponent(track)
    );

    if (!pause) {
        currentSong.play();
        play.src = "/Svg/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

async function displayAlbums() {
    try {
        const manifest = await fetch('/songs/manifest.json');
        const data = await manifest.json();

        const cardContainer = document.querySelector(".cardContainer");
        cardContainer.innerHTML = '';

        for (const album of data.albums) {
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
          <img src="/songs/${album.folder}/${album.cover}" alt="${album.info.title}">
          <h2>${album.info.title}</h2>
          <p>${album.info.description}</p>
        `;

            card.addEventListener("click", () => getSongs(album.folder));
            cardContainer.appendChild(card);
        }
    } catch (error) {
        console.error('Error loading albums:', error);
        alert('Failed to load albums');
    }
}

async function main() {
    let currentSongIndex = -1; // Declare here for proper scoping

    await getSongs("songs/Softmusic");
    if (songs && songs.length > 0) {
        playMusic(songs[0], true);
        currentSongIndex = 0; // Update the existing variable
    } else {
        console.error("No songs found!");
        document.querySelector(".songinfo").innerHTML = "No songs found in playlist";
    }

    async function verifyFiles() {
        try {
            const testImage = await fetch(`songs/${encodeURIComponent("Softmusic")}/cover.jpg`);
            if (!testImage.ok) throw new Error('Cover image missing');

            if (songs.length > 0) {
                const testSongPath = `songs/${encodeURIComponent("Softmusic")}/${encodeURIComponent(songs[0])}`;
                const testSong = await fetch(testSongPath);
                if (!testSong.ok) throw new Error('First song missing');
            }

            console.log('All files verified');
        } catch (error) {
            console.error('File verification failed:', error);
        }
    }
    // Call it after getSongs()
    await verifyFiles();

    // Display all the albums on the page
    displayAlbums()

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
        isShuffleEnabled = !isShuffleEnabled;
        shuffle.src = isShuffleEnabled ? "/Svg/shufflegreen.svg" : "/Svg/shuffle.svg";
    
        if (isShuffleEnabled) {
            // Preserve current song as first in shuffled list
            const currentSongName = songs[currentSongIndex];
            shuffledSongs = shuffleArray([...songs]);
            const currentIndex = shuffledSongs.indexOf(currentSongName);
            [shuffledSongs[0], shuffledSongs[currentIndex]] = 
                [shuffledSongs[currentIndex], shuffledSongs[0]];
            songs = shuffledSongs;
            currentSongIndex = 0;
        } else {
            // Restore original order while maintaining current song
            const currentSongName = songs[currentSongIndex];
            songs = [...shuffledSongs];
            currentSongIndex = songs.indexOf(currentSongName);
        }
    });

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
    });

}

// Function to shuffle an array
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Function to get a random index for shuffle
function getRandomIndex() {
    return Math.floor(Math.random() * songs.length);
}

previous.addEventListener("click", () => {
    if (songs.length === 0) return;

    let index = songs.findIndex(song =>
        decodeURIComponent(song) === decodeURIComponent(currentSong.src.split('/').pop())
    );

    if (index === -1) index = currentSongIndex;

    const newIndex = (index - 1 + songs.length) % songs.length;
    currentSongIndex = newIndex;
    playMusic(songs[newIndex]);
});

next.addEventListener("click", () => {
    if (songs.length === 0) return;

    let index = songs.findIndex(song =>
        decodeURIComponent(song) === decodeURIComponent(currentSong.src.split('/').pop())
    );

    if (index === -1) index = currentSongIndex;

    const newIndex = (index + 1) % songs.length;
    currentSongIndex = newIndex;
    playMusic(songs[newIndex]);
});

// Add an event listener to volume
document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
    console.log("Setting volume to", e.target.value, "/100");
    currentSong.volume = parseInt(e.target.value) / 100
    if (currentSong.volume > 0) {
        document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace
            ("Svg/mute.svg", "Svg/volume.svg")
    }
});

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
