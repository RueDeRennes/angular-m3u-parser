import {
  Component,
  ViewChild,
  ContentChildren,
  QueryList,
  forwardRef,
  Input,
  AfterViewInit
} from "@angular/core";
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
  CdkDragHandle
} from "@angular/cdk/drag-drop";
import { MatTable } from "@angular/material/table";
import { M3UEntry } from "../../Models/Models";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";

@Component({
  selector: "app-data-table-view",
  templateUrl: "./data-table-view.component.html",
  styleUrls: ["./data-table-view.component.css"]
})
export class DataTableViewComponent {
  @ViewChild("table", { static: true })
  table: MatTable<M3UEntry>;

  @ViewChild(MatSort, { static: true })
  sort: MatSort;

  dataSourceColumns: string[] = ["title", "src", "attributes"];

  dataSource: MatTableDataSource<any>;

  setDataSource(data: Array<any>): void {
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.sort = this.sort;
  }

  applyFilter(filterValue: string) {
    setTimeout(() => {
      this.dataSource.filter = filterValue.trim().toLowerCase()
    }, 200)
  }

  // dropTable(event: CdkDragDrop<Array<M3UEntry>>) {
  //   const prevIndex = this.dataSource.findIndex(d => d === event.item.data);
  //   moveItemInArray(this.dataSource, prevIndex, event.currentIndex);
  //   this.table.renderRows();
  // }
}
