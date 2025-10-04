import fs from "fs";
import path from "path";
import axios from "axios";
import * as cheerio from "cheerio";

interface SiteConfig {
  url: string;
  selector: string;
  value?: string;
}

async function run() {
  const [, , configPath, command] = process.argv;

  if (!configPath) {
    console.error("Usage: ts-node checker.ts <config.json> [--save]");
    process.exit(2);
  }

  const filePath = path.resolve(configPath);
  if (!fs.existsSync(filePath)) {
    console.error("Config file not found:", filePath);
    process.exit(2);
  }

  const config: SiteConfig = JSON.parse(fs.readFileSync(filePath, "utf8"));

  try {
    const { data } = await axios.get(config.url);
    const $ = cheerio.load(data);
    const content = $(config.selector).first().text().trim();

    if (command === "--save") {
      config.value = content;
      fs.writeFileSync(filePath, JSON.stringify(config, null, 2), "utf8");
      console.log(
        JSON.stringify(
          { url: config.url, selector: config.selector, saved: content },
          null,
          2
        )
      );
      process.exit(0);
    }

    // Comparison mode
    const hasBaseline = config.value !== undefined;
    const changed = hasBaseline ? content !== config.value : false;

    const result = {
      url: config.url,
      selector: config.selector,
      scraped: content,
      baseline: hasBaseline ? config.value : null,
      changed,
    };

    console.log(JSON.stringify(result, null, 2));

    process.exit(changed ? 1 : 0);
  } catch (err: any) {
    console.error(
      JSON.stringify(
        { error: err.message || "Unknown error", url: config.url },
        null,
        2
      )
    );
    process.exit(2);
  }
}

run();
