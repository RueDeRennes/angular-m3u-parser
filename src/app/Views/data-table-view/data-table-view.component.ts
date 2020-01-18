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
import { SelectionModel } from "@angular/cdk/collections";

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

  dataSourceColumns: string[] = [];

  dataSource: MatTableDataSource<M3UEntry>;

  selection = new SelectionModel<M3UEntry>(true, []);

  setDataSource(data: Array<unknown>): void {
    console.log(data);
    Object.keys(data[0]).forEach(x => {
      this.dataSourceColumns.push(x as any);
    });

    setTimeout(() => {
      this.dataSource = new MatTableDataSource(data);
      this.dataSource.sort = this.sort;
      this.dataSource.sortingDataAccessor = (
        data: object,
        sortHeaderId: string
      ): string | number => {
        const propPath = sortHeaderId.split(".");
        const value: any = propPath.reduce(
          (curObj, property) => curObj[property],
          data
        );
        return !isNaN(value) ? Number(value) : value;
      };
    });
  }

  applyFilter(filterValue: string) {
    setTimeout(() => {
      this.dataSource.filter = filterValue.trim().toLowerCase();
    }, 200);
  }

  dropTable(event: CdkDragDrop<Array<M3UEntry>>) {
    const prevIndex = this.dataSource.data.findIndex(
      d => d === event.item.data
    );
    moveItemInArray(this.dataSource.data, prevIndex, event.currentIndex);
    this.table.renderRows();
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected == numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.data.forEach(row => this.selection.select(row));
  }
}
