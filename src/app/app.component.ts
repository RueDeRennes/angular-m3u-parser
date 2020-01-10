import { Component, ElementRef } from "@angular/core";
import { FileHandler, FileAs } from "./Services/FileService";
import { M3uService } from "./Services/M3uService";

@Component({
  selector: "my-app",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent {

  async upload(files: FileList) {
    if (files && files.length) {
      const [file] = files;

      const content = await FileHandler.read(file, FileAs.text);
      const data = await M3uService.parse2(content.toString());

      console.log(this.data);
      console.log(this.data.length);
    }
  }

  public data: any;
}
