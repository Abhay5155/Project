console.log('Lets Write Javascript');
let currentsong = new Audio();
let currfolder;

function formatSeconds(seconds) {
    seconds = Math.floor(seconds);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
}

// fetch data from directory
async function getsongs(folder) {
    currfolder = folder;
    let a = await fetch(`/${folder}/`);
    let response = await a.text();
    // console.log(response);
    let div = document.createElement('div');
    div.innerHTML = response;
    let as = div.getElementsByTagName('a');
    songs = [];
    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        if (element.href.endsWith('.mp3')) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
        try {
            let response = await fetch(`/${folder}/`);
            if (!response.ok) throw new Error(`Http error! status: ${response.status}`);
            let text = await response.text();
        } catch (error) {
            console.log('Fetching songs failed:', error);
        }
    }

    // Show all the songs in the playlist
    let songul = document.querySelector('.songlist').getElementsByTagName('ul')[0];
    songul.innerHTML = '';
    for (const song of songs) {
        songul.innerHTML += `<li>
                                <img class="invert" src="/resources/music.svg" alt="music">
                                <div class="info">
                                    <div class='title'>${song.replaceAll('%20', ' ')}</div>
                                    <div>By Abhay</div>
                                </div>
                                <img class="invert pl" src="/resources/play2.svg" alt="play"></li>`;
    }

    // Attach event listener to each song
    Array.from(document.querySelector('.songlist').getElementsByTagName('li')).forEach((e) => {
        e.addEventListener('click', element => {
            playmusic(e.querySelector('.info').firstElementChild.innerHTML);
            // currentsong.volume = 0.05;
            // document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        });
    });
    return songs;
}

// Function for playing the track
const playmusic = (track, pause = false) => {
    currentsong.src = (`/${currfolder}/` + track);
    if (!pause) {
        currentsong.play();
        // currentsong.volume = 0.05;

        playbtn.src = '/resources/pause.svg';
    }
    document.querySelector('.songinfo').innerHTML = decodeURI(track);
    document.querySelector('.songtime').innerHTML = '00:00/00:00';
};

async function displayalbums() {
    let a = await fetch(`/Songs/`);
    let response = await a.text();
    let div = document.createElement('div');
    div.innerHTML = response;
    let anchors = div.getElementsByTagName('a');
    let cardcontainer = document.querySelector('.cardcontainer');
    let array = Array.from(anchors);
    for (let i = 0; i < array.length; i++) {
        const e = array[i];
        if (e.href.includes('/Songs/') && !e.href.includes(".htaccess")) {
            let folder = e.href.split('/').slice(-2)[1];
            // console.log(folder);
            // get the meta data of the folder
            let a = await fetch(`/Songs/${folder}/info.json`);
            let response = await a.json();
            // console.log(a)
            cardcontainer.innerHTML += `<div data-folder="${folder}" class="card">
                        <div class="play"><img src="/resources/play.svg" alt="play"></div>
                        <img src="/Songs/${folder}/cover.jpeg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`;
        }
    }

    // Load the playlist whenever the card is clicked
    Array.from(document.getElementsByClassName('card')).forEach(e => {
        e.addEventListener('click', async item => {
            songs = await getsongs(`Songs/${item.currentTarget.dataset.folder}`);
            playmusic(songs[0]);
            document.querySelector(".range").getElementsByTagName("input")[0].value = 25;
        });
    });
}

async function main() {
    // Get the list of all the songs
    await getsongs("Songs/Karanaujla");
    playmusic(songs[0], true);
    // currentsong.volume = 0.05;

    // Volume from start
    currentsong.volume = 0.05;
    document.querySelector(".range").getElementsByTagName("input")[0].value = 25;

    // Display all the albums on the page
    displayalbums();

    // Attach an event listener to play
    playbtn.addEventListener('click', () => {
        // currentsong.volume = 0.2;
        if (currentsong.paused) {
            currentsong.play();
            playbtn.src = '/resources/pause.svg';
            // currentsong.volume = 0.05;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 25;
        } else {
            currentsong.pause();
            playbtn.src = '/resources/play2.svg';
        }
    });

    // Listen for Time update event
    currentsong.addEventListener('timeupdate', () => {
        document.querySelector('.songtime').innerHTML = `${formatSeconds(currentsong.currentTime)}/${formatSeconds(currentsong.duration)}`;
        document.querySelector('.circle').style.left = (currentsong.currentTime / currentsong.duration) * 100 + '%';
    });

    // Add an event listener to seekbar
    document.querySelector('.seekbar').addEventListener('click', e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector('.circle').style.left = percent + '%';
        currentsong.currentTime = (currentsong.duration) * percent / 100;
    });

    // Add event listeners for hamburger menu
    document.querySelector('.hamburger').addEventListener('click', () => {
        document.querySelector('.left').style.left = '0';
    });
    document.querySelector('.close').addEventListener('click', () => {
        document.querySelector('.left').style.left = '-100%';
    });

    // Add event listener on previous button
    previousbtn.addEventListener('click', () => {
        let index = songs.indexOf(currentsong.src.split('/').slice(-1)[0]);
        if ((index - 1) >= 0) {
            playmusic(songs[index - 1]);
        }
    });

    // Add event listener on next button
    nextbtn.addEventListener('click', () => {
        let index = songs.indexOf(currentsong.src.split('/').slice(-1)[0]);
        if ((index + 1) < songs.length) {
            playmusic(songs[index + 1]);
        }
    });

    // Add an event listener for volume control
    document.querySelector('.range').getElementsByTagName('input')[0].addEventListener('change', (e) => {
        currentsong.volume = parseInt(e.target.value) / 100;
    });

    // Add an event listener to mute the track
    document.querySelector('.volume>img').addEventListener('click', e => {
        if (e.target.src.includes('volume.svg')) {
            e.target.src = e.target.src.replace('volume.svg', 'mute.svg');
            currentsong.volume = 0.0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        } else {
            e.target.src = e.target.src.replace('mute.svg', 'volume.svg');
            currentsong.volume = 0.09;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 100;
        }
    });
}

main();
