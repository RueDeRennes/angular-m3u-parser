import { Injectable } from "@angular/core";
import { M3U, M3UEntry } from "./../Models/Models";

export class M3uService {
  private EXTM3U = "#EXTM3U";
  private EXTINF = "#EXTINF";
  private EXTALB = "#EXTALB";
  private EXTART = "#EXTART";

  parse(content: string): M3U {
    const m3u = new M3U();

    const lines = content.trim().split("\n");

    lines.forEach((line, index) => {
      if (line !== this.EXTM3U) {
        // maybe a invalid file?
       // return;
      }
      if (line.startsWith(this.EXTINF)) {
        m3u.entries.push(new M3UEntry({ src: lines[index + 1] }));
        //return;
      } else {
        // maybe the url? if true, it will be handled at the previous line.
      }
    });

    return m3u;
  }
}
