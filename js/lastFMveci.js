// dobrý den pane učiteli bohato, (nebo kdokoliv jiný kdo tu být NEMÁ, v tom případě zmiz)
// i když toto určitě vypadá působivě, za žádný JS soubor v tomto projektu neberu žádný kredit
// kód jsem totiž ukradl odněkud z internetu a ještě k tomu to párkrát nakrmil růžnými
// AI modely když mi něco nefungovalo kvůli lenosti asi. až budu vědět dostatečně moc o JS,
// určitě se k tomu vrátím. 

// představuji honzovu hrůzostrašnou koláž různých kódů z několik vývojářských fór
// slepena dohromady slzami chatgpt, claude, gemini, a dokonce i deepseek.

const user = "chromant_";
const apiKey = "54bd2bc8d72e08f38a2b1398f690e227";
const fallbackImage = "img/default-cover.png";
const REFRESH_INTERVAL = 3000;

const trackEl = document.getElementById("track");
const timeEl = document.getElementById("time");
const coverEl = document.getElementById("cover");

function timeAgo(unix) {
    const seconds = Math.floor(Date.now() / 1000 - unix);
    if (seconds < 60) return "před chvílí";
    if (seconds < 3600) return `před ${Math.floor(seconds / 60)} min`;
    if (seconds < 86400) return `před ${Math.floor(seconds / 3600)} h`;
    return `před ${Math.floor(seconds / 86400)} dny`;
}

async function loadTrack() {
    try {
        const res = await fetch(`https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${user}&api_key=${apiKey}&format=json&limit=1`);
        const data = await res.json();
        const track = data.recenttracks.track[0];
        if (!track) { trackEl.textContent = "Žádná data."; return; }

        const artist = track.artist["#text"];
        const title = track.name;
        const nowPlaying = track["@attr"]?.nowplaying;
        const image = track.image?.find(img => img.size === "extralarge")?.["#text"] || fallbackImage;

        trackEl.innerHTML = `<strong>${artist}</strong> - ${title}`;
        coverEl.src = image;
        coverEl.style.display = "block";

        if (nowPlaying) {
            timeEl.textContent = "🎧 teď hraje";
        } else {
            const playedAt = track.date?.uts;
            timeEl.textContent = playedAt ? `naposledy hrálo ${timeAgo(playedAt)}` : "";
        }
    } catch {
        trackEl.textContent = "Data se nenačetla. Refreshni stránku.";
    }
}

async function loadTop(method, containerId, limit) {
    try {
        const res = await fetch(`https://ws.audioscrobbler.com/2.0/?method=${method}&user=${user}&api_key=${apiKey}&format=json&limit=${limit}&period=overall`);
        const data = await res.json();

        let items = [];
        if (method === "user.getTopAlbums") items = data.topalbums.album;
        if (method === "user.getTopArtists") items = data.topartists.artist;
        if (method === "user.getTopTracks") items = data.toptracks.track;

        const container = document.getElementById(containerId);
        container.innerHTML = "";

        items.forEach((item, index) => {
            let name = item.name;
            let sub = item.artist ? item.artist.name : "";
            let url = item.url;
            let plays = item.playcount;
            let imageHtml = "";
            let itemClass = "top-item-no-image";

            // 1. Obrázek vložíme POUZE u alb
            if (method === "user.getTopAlbums") {
                const image = item.image?.find(img => img.size === "medium")?.["#text"] || fallbackImage;
                imageHtml = `<img src="${image}" alt="${name} cover" />`;
                itemClass = "top-item-with-image";
            }

            // 2. Dynamický text pro počet přehrání
            let playsLabel = "";
            if (method === "user.getTopAlbums") {
                playsLabel = `přehráno ${plays} skladeb`;
            } else if (method === "user.getTopArtists") {
                playsLabel = `${plays} přehrání umělce`;
            } else {
                playsLabel = `${plays} přehrání`;
            }

            const el = document.createElement("div");
            el.className = `top-item ${itemClass}`;
            el.innerHTML = `
                <div class="rank">${index + 1}</div>
                ${imageHtml}
                <div class="item-info">
                    <a href="${url}" target="_blank"><strong>${name}</strong></a>
                    ${sub ? `<br><small>${sub}</small>` : ""}
                    <div class="play-count">${playsLabel}</div>
                </div>
            `;
            container.appendChild(el);
        });
    } catch {
        document.getElementById(containerId).textContent = "Data se nenačetla. Refreshni stránku.";
    }
}

loadTrack();
setInterval(loadTrack, REFRESH_INTERVAL);

loadTop("user.getTopArtists", "top-artists", 8);
loadTop("user.getTopAlbums", "top-albums", 8);
loadTop("user.getTopTracks", "top-tracks", 8);