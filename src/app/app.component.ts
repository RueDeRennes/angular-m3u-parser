import { Component, ElementRef } from "@angular/core";
import { FileHandler, FileAs } from "./Services/FileService";
import { M3uService } from "./Services/M3uService";

@Component({
  selector: "my-app",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent {

  upload(files: FileList) {
    if (files && files.length) {
      const [file] = files;
      FileHandler.read(file, FileAs.text).then(x => {
        // here comes the m3u reader whats currently missing
        const m3u = new M3uService();
        this.data = m3u.convertStringToPlaylist(x.toString());
        console.log(this.data);
      });
    }
  }

  public data: any;
}
