import { Component, ElementRef } from "@angular/core";
import { FileHandler, FileAs } from "./Services/FileService";
import { M3uService } from "./Services/M3uService";

@Component({
  selector: "my-app",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent {

  public data: [];

  upload(files: FileList) {
    if (files && files.length) {
      const [file] = files;

      FileHandler.read(file, FileAs.text).then((content) => {
        M3uService.parse2(content.toString()).then((data) => {
          this.data = data.entries;
        });
      });
    }
  }


}
