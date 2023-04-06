const presence = new Presence({
  clientId: "888141162488143893",
}),
browsingTimestamp = Math.floor(Date.now() / 1000);
let websiteData: { [websiteUrl: string]: string[] } = {};
fetch('./websites.json')
  .then(response => response.json())
  .then(data => localStorage.setItem('websiteData', JSON.stringify(data.websites)))

function getPresenceData(website: string) {
  var details: string = '';
  var state: string = '';
  var smallImage: string = '';
  var smallText: string = '';

  if (websiteData[website]) {
    [ details, state, smallImage, smallText ] = websiteData[website]
  } else {
    console.log(website)
  }

  return [ details, state, smallImage, smallText ];
}

presence.on("UpdateData", async () => {
  const presenceData: PresenceData = {
    largeImageKey: "https://i.imgur.com/HOmso2n.png",
    startTimestamp: browsingTimestamp,
  };

  var presenceInfo = getPresenceData(document.URL);
  [ presenceData.details, presenceData.state, presenceData.smallImageKey, presenceData.smallImageText ] = presenceInfo;

  presence.setActivity(presenceData);
});