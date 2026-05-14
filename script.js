const modal = document.getElementById("spotify_modal");
const playerContainer = document.getElementById("spotify_player_container");
const closeBtn = document.querySelector(".close_button");


document.querySelectorAll('.genre_button').forEach(button => {
    button.addEventListener('click', () => {
        const spotifyId = button.getAttribute('data_playlist');
        
        // Створюємо код айфрейму
        playerContainer.innerHTML = `
            <iframe src="https://open.spotify.com/embed/playlist/${spotifyId}?utm_source=generator&theme=0" 
                    width="100%" height="500" frameBorder="0" allowfullscreen="" 
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                    loading="lazy"></iframe>`;
        
        modal.style.display = "block"; 
    });
});


if (closeBtn) closeBtn.onclick = () => {
    modal.style.display = "none";
    playerContainer.innerHTML = "";
};


let footerClicks = 0;

const footerTag = document.querySelector('footer');

if (footerTag) {
    footerTag.addEventListener('click', () => {
        footerClicks++;
        
   
        if (footerClicks === 5) {
            activatePartyMode();
            footerClicks = 0; 
        }
    });
}

function activatePartyMode() {
    const logo = document.querySelector('h1') || document.querySelector('.uamuse-title');
    if (!logo) return;

    logo.classList.add('logo-settling');

    setTimeout(() => {
        logo.classList.remove('logo-settling');
        logo.classList.add('dancing_logo');

        setTimeout(() => {
            logo.classList.add('logo-settling');
            logo.classList.remove('dancing_logo');

            setTimeout(() => {
                logo.classList.remove('logo-settling');
            }, 400);
        }, 5000);
    }, 400);
}

