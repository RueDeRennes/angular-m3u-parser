import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { AppComponent } from "./app.component";
import { DataTableViewComponent } from "./Views/data-table-view/data-table-view.component";
import { MatTableModule, MatIconModule } from "@angular/material";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { MatSortModule } from "@angular/material/sort";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    MatTableModule,
    MatIconModule,
    DragDropModule,
    MatSortModule,
    BrowserAnimationsModule
  ],
  declarations: [AppComponent, DataTableViewComponent],
  bootstrap: [AppComponent]
})
export class AppModule {}
