import {
  Component,
  ViewChild,
  ContentChildren,
  QueryList,
  forwardRef,
  Input
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

@Component({
  selector: "app-data-table-view",
  templateUrl: "./data-table-view.component.html",
  styleUrls: ["./data-table-view.component.css"]
})
export class DataTableViewComponent {
  private _dataSource: Array<any>;

  @ViewChild("table", { static: true })
  table: MatTable<M3UEntry>;
  displayedColumns: string[] = ["title", "src", "attributes"];

  @Input()
  public get dataSource(): Array<any> {
    return this._dataSource;
  }
  public set dataSource(value: Array<any>) {
    this._dataSource = value;
  }

  dropTable(event: CdkDragDrop<Array<M3UEntry>>) {
    const prevIndex = this.dataSource.findIndex(d => d === event.item.data);
    moveItemInArray(this.dataSource, prevIndex, event.currentIndex);
    this.table.renderRows();
  }
}
