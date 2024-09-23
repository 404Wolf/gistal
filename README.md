# Gistal

![output](https://github.com/user-attachments/assets/23d8b56d-587c-4865-83cb-044d6dfb3fc1)


Chrome extension to add "Run in Val.Town" to all typescript Github gists.

# Usage

1) Go to `chrome://extensions`. Then go to releases, and download `gistal.crx` ([here](https://github.com/404Wolf/gistal/releases/download/v1.0.0/gistal.crx)). Drag and drop it into the extensions page.
2) Click the extensions dropdown on the top right, right click the `gistal` extension, click `options`, and then on the options page set your val town API token.

Now all github gists will show "Run in Val.Town"!

# How it works

Pretty straightforward: on `gist.github.com/*`, it matches all the "View Raw" button containers, and gets the URL of the raw code. The filename is in the url; if it's `*.ts` we add a "Run in Val Town" button to the group of buttons with the "View Raw" one, with a callback that uses the Val Town SDK to create a val, and then use the window object to navigate to it. 

For regex nerds, fun trick: `(?<=/)` is a lookbehind that matches onto the first / from the back. So `(?<=/)[^/]+.w*$` matches "url...stuff/**test.ts**" (yes we could use `.split(".")`, but that's less fun).

# Build

I'm using Bun to bundle the typescript files. To build the extension, run `bun run build`. The output will be in `./dist`.
