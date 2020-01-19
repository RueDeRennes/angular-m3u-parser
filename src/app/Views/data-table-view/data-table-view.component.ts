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
  styleUrls: ["./data-table-view.component.scss"]
})
export class DataTableViewComponent {
  @ViewChild("table", { static: true })
  table: MatTable<M3UEntry>;

  @ViewChild(MatSort, { static: true })
  sort: MatSort;

  columns = [];

  displayedColumns = [];

  dataSource = null;

  highlightEmptyCells = false;

  setDataSource(data: Array<unknown>): void {
    this.setColumns(data);

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

  setColumns(data: Array<unknown>): void {
    // clear anything
    this.columns.splice(0,this.columns.length)
    this.displayedColumns.splice(0,this.displayedColumns.length)

    Object.keys(data[0]).forEach(x => {
      this.columns.push({
        columnDef: x,
        header: x,
        cell: (element: any) => `${element[x]}`,
        empty: (element: any) => {
          if (this.highlightEmptyCells) {
            return element[x] ? false : true;
          } else {
            return false;
          }
        },
        visible: true
      });
    });

    this.displayedColumns = this.columns
      .filter(x => x.visible)
      .map(c => c.columnDef);
  }

  applyFilter(filterValue: string) {
    setTimeout(() => {
      this.dataSource.filter = filterValue.trim().toLowerCase();
    }, 200);
  }

  applyColumn(column: any, visible: boolean) {
    column.visible = visible;

    console.log("column visibility was changed");
    console.log(this.columns);
  }
}
