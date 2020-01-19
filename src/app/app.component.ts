import { Component, ElementRef, ViewChild } from "@angular/core";
import { FileHandler, FileAs } from "./Services/FileService";
import { M3uService } from "./Services/M3uService";
import { DataTableViewComponent } from "./Views/data-table-view/data-table-view.component";
import { TableNormalizer } from "./Services/TableNormalizer";

@Component({
  selector: "app",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent {
  @ViewChild(DataTableViewComponent, { static: true })
  dataTableView: DataTableViewComponent;

  upload(files: FileList) {
    if (files && files.length) {
      const [file] = files;


      FileHandler.read(file, FileAs.text).then(content => {
        new M3uService().parse(content.toString()).then(data => {
          const normalizeData = new TableNormalizer().normalize(data.entries)

          this.dataTableView.setDataSource(normalizeData);
        });
      });
    }
  }
}
