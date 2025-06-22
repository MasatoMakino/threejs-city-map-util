#!/usr/bin/env node

import { Command } from "commander";
import { generatePlateauGSITileTexture } from "./PlateauGSITileTextureGenerator.js";

const program = new Command();
program
  .command("generateTexture")
  .argument("<meshCode>", "Japan Standard Regional Mesh Code")
  .option("--zoomLevel <number>")
  .option("--style <string>")
  .action((meshCode, options) => {
    generatePlateauGSITileTexture(meshCode, {
      zoomLevel: options.zoomLevel,
      style: options.style,
    });
  });

program.parse(process.argv);
