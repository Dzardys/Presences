const presence = new Presence({
		clientId: "870850875562819595",
	}),
	browsingTimestamp = Math.floor(Date.now() / 1000);

async function getStrings() {
	return presence.getStrings(
		{
			play: "general.playing",
			anime: "general.anime",
			pause: "general.paused",
			search: "general.search",
			episode: "general.episode",
			viewPage: "general.viewPage",
			browsing: "general.browsing",
			watching: "general.watching",
			viewHome: "general.viewHome",
			viewList: "general.viewList",
			searchFor: "general.searchFor",
			viewGenre: "general.viewGenre",
			viewMovie: "general.viewMovie",
			viewAnime: "general.viewAnime",
			viewEpisode: "general.viewEpisode",
			viewCategory: "general.viewCategory",
			watchingMovie: "general.watchingMovie",
			searchSomething: "general.searchSomething",
			buttonWatchMovie: "general.buttonWatchMovie",
			buttonViewEpisode: "general.buttonViewEpisode",
		},
		await presence.getSetting<string>("lang").catch(() => "en")
	);
}

let video = {
		current: 0,
		duration: 0,
		paused: true,
	},
	movie,
	episode,
	Sub: string;

presence.on(
	"iFrameData",
	(data: { current: number; duration: number; paused: boolean }) => {
		video = data;
	}
);

let strings: Awaited<ReturnType<typeof getStrings>>,
	oldLang: string = null;

presence.on("UpdateData", async () => {
	const [newLang, privacy, showepisode, time, subtitle, buttons] =
			await Promise.all([
				presence.getSetting<string>("lang").catch(() => "en"),
				presence.getSetting<boolean>("privacy"),
				presence.getSetting<boolean>("showepisode"),
				presence.getSetting<boolean>("timestamps"),
				presence.getSetting<boolean>("subtitle"),
				presence.getSetting<boolean>("buttons"),
			]),
		title =
			document.querySelector(
				"#contenedor > div.module > div.content > header > h1"
			)?.textContent ?? "?",
		titlemovies =
			document.querySelector(
				"#single > div.content > div.sheader > div.data > h1"
			)?.textContent ?? "?",
		playvdo = document.querySelector("#info > h1")?.textContent ?? "?",
		pathArray = document.location.toString().split("/"),
		presenceData: PresenceData = {
			largeImageKey: "https://i.imgur.com/tSmgmK1.jpg",
			startTimestamp: browsingTimestamp,
		};
	if (oldLang !== newLang || !strings) {
		oldLang = newLang;
		strings = await getStrings();
	}
	if (pathArray[3].includes("?s=")) {
		presenceData.details = `${
			privacy ? strings.searchSomething : strings.searchFor
		}`;
		presenceData.state = (
			document.querySelector(".content.rigth.csearch > header > h1")
				?.textContent ?? strings.searchSomething
		)
			.split("ผลการค้นหา:")
			.pop();
		presenceData.smallImageKey = "search";
	} else if (!privacy && (pathArray[4] === "page" || pathArray[5] === "page")) {
		presenceData.details = `${strings.viewPage} ${
			pathArray[pathArray.indexOf("page") + 1]
		}`;
		presenceData.state = title;
	} else {
		switch (pathArray[3]) {
			case "genre":
				presenceData.details = privacy
					? strings.viewGenre.replace(":", "")
					: strings.viewGenre;
				presenceData.state = title;
				presenceData.smallImageKey = "reading";
				break;
			case "catalog":
				presenceData.details = privacy
					? strings.viewCategory.replace(":", "")
					: strings.viewList;
				presenceData.state = title;
				presenceData.smallImageKey = "reading";
				break;
			case "category":
				presenceData.details = privacy
					? strings.viewCategory.replace(":", "")
					: strings.viewCategory;
				presenceData.state = title;
				presenceData.smallImageKey = "reading";
				break;
			case "tag":
				presenceData.details = privacy
					? strings.viewCategory.replace(":", "")
					: strings.viewList;
				presenceData.state = title.split("รวมอนิเมะ").pop();
				presenceData.smallImageKey = "reading";
				break;
			case "release":
				presenceData.details = privacy
					? strings.viewCategory.replace(":", "")
					: strings.viewList;
				presenceData.state = title;
				presenceData.smallImageKey = "reading";
				break;
			case "movies":
				if (!["เดอะมูฟวี่", "เดอะ", "มูฟวี่"].includes(titlemovies)) {
					const movieinfo = titlemovies.split(/(เดอะ)?(มูฟวี่)/);
					movie = movieinfo.pop();
					if (movie === "ซับไทย")
						movie = movie.replace((Sub = "ซับไทย"), "").trim();
					else if (movie === "พากย์ไทย")
						movie = movie.replace((Sub = "พากย์ไทย"), "").trim();
					movie = `${strings.watchingMovie} ${movie} ${subtitle ? Sub : ""}`;
					privacy
						? (presenceData.details = strings.watchingMovie)
						: (presenceData.state = `${movieinfo[0]}`),
						(presenceData.details = strings.watchingMovie);
				} else {
					presenceData.details = privacy
						? strings.viewMovie.replace(":", "")
						: strings.viewMovie;
					presenceData.state = titlemovies;
					presenceData.smallImageKey = "reading";
				}
				presenceData.smallImageKey = video.paused ? "pause" : "playing";
				presenceData.smallImageText = video.paused
					? (await strings).pause
					: (await strings).play;
				if (!video.paused) {
					[, presenceData.endTimestamp] = presence.getTimestamps(
						Math.floor(video.current),
						Math.floor(video.duration)
					);
				}
				if (buttons) {
					presenceData.buttons = [
						{
							label: strings.buttonWatchMovie,
							url: document.location.href.replace(/#\d+/, ""),
						},
					];
				}
				delete presenceData.startTimestamp;
				delete presenceData.endTimestamp;
				break;
			case "anime":
				if (pathArray[4] !== "page") {
					const ep =
						document.querySelector(
							"#single > div.content > div.sheader > div.data > h1"
						)?.textContent ?? strings.anime;
					presenceData.startTimestamp = browsingTimestamp;
					presenceData.details = privacy
						? strings.viewAnime.replace(":", "")
						: strings.viewAnime;
					presenceData.state = `${ep.split("ตอนที่")[0]}`;
				} else presenceData.details = strings.browsing;
				presenceData.smallImageKey = "reading";
				break;
			case "ep":
				if (playvdo.includes("ตอนที่")) {
					const info = playvdo.split("ตอนที่");
					episode = info.pop();
					if (episode === "ซับไทย")
						episode = episode.replace((Sub = "ซับไทย"), "").trim();
					else if (episode === "พากย์ไทย")
						episode = episode.replace((Sub = "พากย์ไทย"), "").trim();
					episode = `${strings.episode} ${
						subtitle ? episode : episode.match(/\d+/g)[0]
					}`;
					privacy
						? (presenceData.details = showepisode
								? episode
								: `${strings.watching.replace(":", "")} ${strings.anime}`)
						: ([presenceData.details] = info),
						(presenceData.state = episode);
				} else {
					let info;
					if (playvdo === "ซับไทย") info = playvdo.replace("ซับไทย", "").trim();
					else if (playvdo === "พากย์ไทย")
						info = playvdo.replace("พากย์ไทย", "").trim();
					presenceData.details = strings.watching;
					presenceData.state = info;
				}
				presenceData.smallImageKey = video.paused ? "pause" : "playing";
				presenceData.smallImageText = video.paused
					? (await strings).pause
					: (await strings).play;
				if (!video.paused) {
					[, presenceData.endTimestamp] = presence.getTimestamps(
						Math.floor(video.current),
						Math.floor(video.duration)
					);
				}
				if (buttons) {
					presenceData.buttons = [
						{
							label: strings.buttonViewEpisode,
							url: document.location.href.replace(/#\d+/, ""),
						},
					];
				}
				break;
			default:
				presenceData.details = strings.viewHome;
				presenceData.smallImageKey = "reading";
				break;
		}
	}
	if (!time) {
		delete presenceData.startTimestamp;
		delete presenceData.endTimestamp;
	}
	if (privacy) {
		delete presenceData.state;
		delete presenceData.buttons;
	}
	if (presenceData.details) presence.setActivity(presenceData);
	else presence.setActivity();
});
