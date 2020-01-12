  
import { Component, ElementRef, ViewChild } from "@angular/core";
import { FileHandler, FileAs } from "./Services/FileService";
import { M3uService } from "./Services/M3uService";
import {DataTableViewComponent} from './Views/data-table-view/data-table-view.component'

@Component({
  selector: "app",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent {

  @ViewChild(DataTableViewComponent, { static: true })
  dataTableView: DataTableViewComponent;

  upload(files: FileList) {
    if (files && files.length) {
      const [file] = files;

      FileHandler.read(file, FileAs.text).then((content) => {
        M3uService.parse2(content.toString()).then((data) => {
          this.dataTableView.setDataSource(data.entries)
        });
      });
    }
  }


}