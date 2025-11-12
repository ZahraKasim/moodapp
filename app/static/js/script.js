
document.addEventListener("DOMContentLoaded", function() {
    const player = document.getElementById("mainPlayer");
    const source = document.getElementById("playerSource");

    const playBtn = document.querySelector(".bi-play-fill");
    const prevBtn = document.querySelector(".bi-skip-start-fill");
    const nextBtn = document.querySelector(".bi-skip-end-fill");
    const progressBar = document.getElementById("bar");
    const startTime = document.getElementById("start");
    const endTime = document.getElementById("end");
    const titleEl = document.getElementById("recommendationTitle");

    let recommendedSongs = [];  // filled by /recommend
    let currentIndex = 0;




    // --- Artist form submission ---
    document.getElementById("artistForm").addEventListener("submit", async function(e) {
        e.preventDefault();

        let formData = new FormData(this);
        document.getElementById("moodResult").innerText = "📸 Detecting mood...";
        document.getElementById("songsList").innerHTML = "";
        document.getElementById("recommendationTitle").innerText = "Recommended songs:";

        let response = await fetch("/recommend", {
            method: "POST",
            body: formData
        });

        let data = await response.json();
        const moodEl = document.getElementById("moodResult");

        if (data.error) {
            moodEl.innerText = data.error;
            moodEl.className = "error-text";
        } else {
            moodEl.innerText = "😊 Mood Detected: " + data.mood;
            moodEl.className = "success-text";

            recommendedSongs = [];
            document.getElementById("recommendationTitle").style.display = "block"; // show title
let listHTML = "<ul class='songs-list'>";

            data.songs.forEach((song, index) => {
                recommendedSongs.push(song.file_url);
                listHTML += `<li class='song-item' data-url='${song.file_url}' data-index='${index}'>
                                ${song.track} by ${song.artist}
                             </li>`;
            });
            listHTML += "</ul>";
            document.getElementById("songsList").innerHTML = listHTML;

            // Click on recommended song
            document.querySelectorAll(".song-item").forEach(item => {
                item.addEventListener("click", function() {
                    const url = this.getAttribute("data-url");
                    const index = parseInt(this.getAttribute("data-index"));
                    if(url){
                        source.src = url;
                        player.load();
                        player.play();
                        currentIndex = index;
                        playBtn.classList.remove("bi-play-fill");
                        playBtn.classList.add("bi-pause-fill");
                        pulse.classList.add('active2');
                    }
                });
            });
        }
    });

    // --- Play/Pause button ---
    let pulse = document.getElementsByClassName('pulse')[0];
    playBtn.addEventListener("click", () => {
        if(player.paused){
            player.play();
            playBtn.classList.remove("bi-play-fill");
            playBtn.classList.add("bi-pause-fill");
            pulse.classList.add('active2');
        } else {
            player.pause();
            playBtn.classList.remove("bi-pause-fill");
            playBtn.classList.add("bi-play-fill");
            pulse.classList.remove('active2');
        }
    });



    // --- Previous button ---
    prevBtn.addEventListener("click", () => {
        if(recommendedSongs.length === 0) return;
        currentIndex = (currentIndex - 1 + recommendedSongs.length) % recommendedSongs.length;
        source.src = recommendedSongs[currentIndex];
        player.load();
        player.play();
        playBtn.classList.remove("bi-play-fill");
        playBtn.classList.add("bi-pause-fill");
    });



    // --- Next button ---
    nextBtn.addEventListener("click", () => {
        if(recommendedSongs.length === 0) return;
        currentIndex = (currentIndex + 1) % recommendedSongs.length;
        source.src = recommendedSongs[currentIndex];
        player.load();
        player.play();
        playBtn.classList.remove("bi-play-fill");
        playBtn.classList.add("bi-pause-fill");
    });

    // --- Progress bar update ---
player.addEventListener("timeupdate", () => {
  if (player.duration && !isNaN(player.duration)) {
    const progress = (player.currentTime / player.duration) * 100;

    // Update the bar fill
    bar1.style.width = `${progress}%`;

    // Update the point position
    point.style.left = `${progress}%`;
  } else {
    bar1.style.width = "0%";
    point.style.left = "0%";
  }

  startTime.innerText = formatTime(player.currentTime);
  endTime.innerText = formatTime(player.duration || 0);


   const makeAllPlays = () =>{
        Array.from(document.getElementsByClassName('.playListPLay')).forEach((element)=>{
            element.classList.add('bi-play-circle-fill');
            element.classList.remove('bi-pause-circle-fill');
        })
     }

    let index = 0;
    Array.from(document.getElementsByClassName('.playListPLay')).forEach((element)=>{
        element.addEventListener('click', (e)=>{
            index = e.target.id;
            e.target.classList.remove('bi-play-circle-fill');
            e.target.classList.add('bi-pause-circle-fill');
        })
    })

  seek.value = progressBar;
  bar1.style.width = `$(seekbar)%`;
  point.style.left = `$(seekbar)%`;

});

seek.addEventListener(`change`, ()=>{
    player.currentTime = seek.value * player.duration/100;
})

player.addEventListener('ended', ()=>{
    playBtn.classList.add("bi-play-fill");
    playBtn.classList.remove("bi-pause-fill");
    pulse.classList.remove('active2');
})

let vol_icon = document.getElementById('vol_icon');
let vol = document.getElementById('vol');
let vol_dot = document.getElementById('vol_dot');
let vol_bar = document.getElementsByClassName('vol_bar')[0];

vol.addEventListener('change', ()=>{
    if(vol.value == 0){
        vol_icon.classList.remove('bi-volume-down-fill');
        vol_icon.classList.add('bi-volume-mute-fill');
        vol_icon.classList.remove('bi-volume-up-fill');
    }

    if(vol.value > 0){
        vol_icon.classList.add('bi-volume-down-fill');
        vol_icon.classList.remove('bi-volume-mute-fill');
        vol_icon.classList.remove('bi-volume-up-fill');
    }

    if(vol.value > 50){
        vol_icon.classList.remove('bi-volume-down-fill');
        vol_icon.classList.remove('bi-volume-mute-fill');
        vol_icon.classList.add('bi-volume-up-fill');
    }

    let vol_a = vol.value;
    vol_bar.style.width = `${vol_a}%`;
    vol_dot.style.left = `${vol_a}%`;
    player.volume = vol_a/100;

})



    // Helper function
    function formatTime(sec){
        const minutes = Math.floor(sec / 60);
        const seconds = Math.floor(sec % 60);
        return `${minutes}:${seconds < 10 ? "0"+seconds : seconds}`;
    }



    let index1 = 0;

Array.from(document.getElementsByClassName('playListPlay')).forEach((e)=> {
    e.addEventListener('click', (el)=>{
    index1 = el.target.id;
    //console.log(index);
    source.src = `../static/songs/${index1}.mp3`;
    player.load();
    player.play();
    })
})

});


