(function() {
    let clicks = 0;
    document.addEventListener('DOMContentLoaded', () => {
        const foot = document.querySelector('footer');
        if (foot) {
            foot.addEventListener('click', () => {
                clicks++;
                if (clicks === 5) {
                    const logo = document.querySelector('h1');
                    if (logo) {
                        logo.style.animation = "dance 0.5s infinite"; 
                        
                        setTimeout(() => {
                            logo.style.animation = ""; 
                        }, 3000);
                    }
                    clicks = 0;
                }
            });
        }
    });
})();


const modal = document.getElementById("spotify_modal");
const playerContainer = document.getElementById("spotify_player_container");
const closeBtn = document.querySelector(".close_button");


document.querySelectorAll('.genre_button').forEach(button => {
    button.addEventListener('click', () => {
        const spotifyId = button.getAttribute('data_playlist');
        
        playerContainer.innerHTML = `
            <iframe src="https://open.spotify.com/embed/playlist/${spotifyId}?utm_source=generator&theme=0" 
                    width="100%" height="500" frameBorder="0" allowfullscreen="" 
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                    loading="lazy"></iframe>`;
        
        modal.style.display = "block"; 
    });
});


closeBtn.onclick = () => {
    modal.style.display = "none";
    playerContainer.innerHTML = ""; 
};


