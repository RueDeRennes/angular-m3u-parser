// see https://github.com/NateShoffner/M3U.NET/blob/master/M3U.NET/M3UFile.cs
import { Injectable } from "@angular/core";
import { M3U, M3UEntry, M3UEntryAttribute } from "./../Models/Models";

export class M3uService {
  private static EXTM3U = "#EXTM3U";
  private static EXTINF = "#EXTINF";
  private static EXTALB = "#EXTALB";
  private static EXTART = "#EXTART";

  public parse(content: string): Promise<M3U> {
    return new Promise<M3U>(
      (resolve, reject): any => {
        const m3u = new M3U();
        let entry: M3UEntry = null;

        const lines = content.trim().split("\n");

        lines.forEach((line, index) => {
          if (index === 0 && line != M3uService.EXTM3U) {
            throw new Error("M3U header is missing.");
          }

          if (line.startsWith(M3uService.EXTINF)) {
            if (entry !== null) {
              throw new Error("Unexpected entry detected.");
            }
            var split = line.substring(8, line.length).split(",", 2);

            if (split.length != 2) {
              throw new Error(
                `Invalid track information @ line ${index + 1}.\rResult: ${
                  split.length
                }`
              );
            }

            let seconds: number;
            if (Number.parseInt(split[0]) === Number.NaN) {
              throw new Error("Invalid track duration.");
            }

            const title = split[1];
            const duration = Number.parseInt(split[0]);

            entry = new M3UEntry({ duration, title });

            let s = split[0];

            let attrName: string = "";
            let beginAttrNameIndex: number = 0;
            let endAttrNameIndex: number = 0;
            let attrValue: string = "";
            let beginAttrValueIndex: number = 0;
            let endAttrValueIndex: number = 0;
            let currentChar: string;
            let quoteCounter: number = 0;
            let isCurrentIndexInAttrName: boolean = false;
            let isCurrentIndexInAttrValue: boolean = false;

            for (let i = 0; i < split[0].length; i++) {
              currentChar = s.charAt(i);
              //attribute value begin
              if (currentChar === '"') {
                //attribute value start
                if (quoteCounter === 0) {
                  isCurrentIndexInAttrValue = true;

                  quoteCounter++;
                } else if (quoteCounter === 1) {
                  //end of attribute value
                  isCurrentIndexInAttrValue = false;
                  endAttrValueIndex = i - 1;
                  quoteCounter = 0;
                  //store the attribute and reset values
                  entry.attributes.push(
                    new M3UEntryAttribute({ [attrName]: attrValue })
                  );
                  attrName = "";
                  attrValue = "";
                }
              } else if (currentChar === " ") {
                //either seperator or inside value of attr.
                //inside value of attr.
                if (quoteCounter > 0) {
                  attrValue = attrValue.concat(...currentChar);
                } else {
                  //seperator between attributes
                  //next char is begin of attribute name
                  beginAttrNameIndex = i + 1;
                  isCurrentIndexInAttrName = true;
                }
              } else if (currentChar === "=") {
                //end of attr name
                endAttrNameIndex = i - 1;
                isCurrentIndexInAttrName = false;
              } else if (isCurrentIndexInAttrName) {
                // build attribute name
                attrName = attrName.concat(...currentChar);
              } else if (isCurrentIndexInAttrValue) {
                // continue building attribute value
                attrValue = attrValue.concat(...currentChar);
              }
            }
          } else if (entry !== null && !line.startsWith("#")) {
            entry.src = line;
            m3u.entries.push(entry);
            entry = null;
          }
        });
        resolve(m3u);
      }
    );
  }

  public save(m3u: M3U): Promise<void> {
    throw new Error("NOT IMPLEMENTED");
  }
}

// ######################## new stuff?
class M3uReader {
  public read(content: string): Promise<M3U> {
    throw new Error("NOT IMPLEMENTED");
  }
}
class M3uWriter {
  public write(m3u: any): Promise<string> {
    throw new Error("NOT IMPLEMENTED");
  }
}

class M3uParser {
  private readonly _reader: M3uReader;
  private readonly _writer: M3uWriter;

  public constructor() {
    this._reader = new M3uReader();
    this._writer = new M3uWriter();
  }

  public get reader(): M3uReader {
    return this._reader;
  }

  public get writer(): M3uWriter {
    return this._writer;
  }
}
