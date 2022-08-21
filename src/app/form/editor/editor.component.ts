import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Field} from '../form.interface';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit {
  @Input() element: Field;
  @Output() eventEmitter: EventEmitter<any> = new EventEmitter<any>();

  constructor() {
  }

  ngOnInit() {
    this.element.changed = false;
  }

  change(event): void {
    this.element.changed = true;
  }

}
