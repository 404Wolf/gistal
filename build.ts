await Bun.build({
  entrypoints: ["content.ts"],
  outdir: "./dist",
});

await Bun.build({
  entrypoints: ["options/options.ts"],
  outdir: "./dist",
});
