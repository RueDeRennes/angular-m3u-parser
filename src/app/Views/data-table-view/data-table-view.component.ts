import { Component, ViewChild, ContentChildren, QueryList, forwardRef, Input
 } from '@angular/core';
import {MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';
import {CdkDragDrop, moveItemInArray, transferArrayItem, CdkDragHandle} from '@angular/cdk/drag-drop';
import {MatTable} from '@angular/material/table';
import {M3UEntry} from '../../Models/Models';


@Component({
  selector: 'app-data-table-view',
  templateUrl: './data-table-view.component.html',
  styleUrls: ['./data-table-view.component.css']
})
export class DataTableViewComponent  {

  @ViewChild('table', {static: true}) table: MatTable<M3UEntry>;
  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];

  @Input()
  dataSource = [];
  
  dropTable(event: CdkDragDrop<Array<M3UEntry>>) {
    const prevIndex = this.dataSource.findIndex((d) => d === event.item.data);
    moveItemInArray(this.dataSource, prevIndex, event.currentIndex);
    this.table.renderRows();
  }
}