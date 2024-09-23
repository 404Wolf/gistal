import * as path from "path";

async function copyFileToDist(file: string) {
  const fileContent = Bun.file(file);
  await Bun.write(`dist/${path.basename(file)}`, fileContent);
}

await Bun.build({
  entrypoints: ["src/content/content.ts"],
  outdir: "./dist",
});

await Bun.build({
  entrypoints: ["src/options/options.ts"],
  outdir: "./dist",
});

copyFileToDist("src/manifest.json");
copyFileToDist("src/options/options.html");
