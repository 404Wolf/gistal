import ValTown from "@valtown/sdk";

console.log("Loaded content script for github gist val runner");

const setupValButtons = async () => {
  const valTownClient = new ValTown({
    bearerToken: (await chrome.storage.sync.get(["apiKey"])).apiKey,
  });

  for (const buttonContainer of Array.from(
    document.querySelectorAll(".file-actions.flex-order-2.pt-0"),
  )) {
    // If we already added the button then do not add another
    if (buttonContainer.querySelectorAll("button").length === 1) continue;

    // Find the raw code button and extract the filename
    const viewRawCodeButton = buttonContainer.querySelector("a");
    const filename = viewRawCodeButton!.href
      .match("(?<=/)[^/]+.w*$")![0]
      .split(".");

    // Only act if it is a typescript gist
    if (filename[1] === "ts") {
      // Start prefetching the raw code, but we don't need to wait for it for now
      const rawCode = fetch(viewRawCodeButton!.href).then((res) => res.text());

      // Create the callback for when they click on the open in Val Town button
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

      // Add the button
      buttonContainer.appendChild(
        Object.assign(document.createElement("button"), {
          innerText: "Run in Val.Town",
          onclick: callback,
          className: "btn btn-sm",
        }),
      );
    }
  }
};

const callback: MutationCallback = (
  mutationsList: MutationRecord[],
  _: MutationObserver,
) => {
  if (document.readyState !== "complete") return;
  for (const mutation of mutationsList) {
    if (mutation.type === "childList") {
      mutation.addedNodes.forEach((_) => {
        setupValButtons();
      });
    }
  }
};

const observer: MutationObserver = new MutationObserver(callback);
observer.observe(document.body, { childList: true, subtree: true });
