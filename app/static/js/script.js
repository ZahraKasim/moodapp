
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
                    }
                });
            });
        }
    });

    // --- Play/Pause button ---
    playBtn.addEventListener("click", () => {
        if(player.paused){
            player.play();
            playBtn.classList.remove("bi-play-fill");
            playBtn.classList.add("bi-pause-fill");
        } else {
            player.pause();
            playBtn.classList.remove("bi-pause-fill");
            playBtn.classList.add("bi-play-fill");
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
});



    // Helper function
    function formatTime(sec){
        const minutes = Math.floor(sec / 60);
        const seconds = Math.floor(sec % 60);
        return `${minutes}:${seconds < 10 ? "0"+seconds : seconds}`;
    }
});
