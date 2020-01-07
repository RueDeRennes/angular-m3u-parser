import { Injectable } from "@angular/core";
import { M3U, M3UEntry } from "./../Models/Models";

export class M3uService {
  private EXTM3U = "#EXTM3U";
  private EXTINF = "#EXTINF";
  private EXTALB = "#EXTALB";
  private EXTART = "#EXTART";

  parse(content: string): M3U {
    const m3u = new M3U();
    let entry: M3UEntry = null;

    const lines = content.trim().split("\n");

    lines.forEach((line, index) => {
      if (index === 0 && line != this.EXTM3U) {
        throw new Error("M3U header is missing.");
      }

      if (line.startsWith(this.EXTINF)) {
        if (entry !== null) {
          throw new Error("Unexpected entry detected.");
        }
        var split = line.substring(8, line.length).split(",", 2);

        if (split.length != 2) {
          throw new Error(`Invalid track information @ line ${index+1}.\rResult: ${split.length}`);
        }

        let seconds: number;
        if (Number.parseInt(split[0]) === Number.NaN) {
          throw new Error("Invalid track duration.");
        }

        const title = split[1];
        const duration = Number.parseInt(split[0]);

        entry = new M3UEntry({ duration, title });
      } else if (entry !== null && !line.startsWith("#")) {
        entry.src = line;
        m3u.entries.push(entry);
        entry = null;
      }
    });

    return m3u;
  }
}
