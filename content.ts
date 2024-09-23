import ValTown from "@valtown/sdk";

console.log("Loaded content script for github gist val runner");

(async () => {
  const valTownClient = new ValTown({
    bearerToken: (await chrome.storage.sync.get(["apiKey"])).apiKey,
  });

  for (const buttonContainer of Array.from(
    document.querySelectorAll(".file-actions.flex-order-2.pt-0"),
  )) {
    const viewRawCodeButton = buttonContainer.querySelector("a");
    const filename = viewRawCodeButton!.href
      .match("(?<=/)[^/]+.w*$")![0]
      .split(".");

    if (filename[1] === "ts") {
      const rawCode = fetch(viewRawCodeButton!.href).then((res) => res.text());
      const callback = async () => {
        const sanitizedFilename = filename[0].replace(/[^a-zA-Z0-9]/g, "_");
        console.log("Creating new val named", sanitizedFilename);
        const newVal = await valTownClient.vals.create({
          code: await rawCode,
          name: sanitizedFilename,
          privacy: "public",
          readme: `Created from [this GitHub Gist](${window.location.href}), using [gistal](https://github.com/404wolf/gistal)`,
        });
        console.log("Opening new val", newVal.url);
        window.open(newVal.url);
      };
      buttonContainer.appendChild(
        Object.assign(document.createElement("button"), {
          innerText: "Run in Val.Town",
          onclick: callback,
          className: "btn btn-sm",
        }),
      );
    }
  }
})();
