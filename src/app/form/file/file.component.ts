import {Component, ElementRef, EventEmitter, Input, OnInit, Output, Renderer, ViewChild} from '@angular/core';
import {Field} from '../form.interface';

@Component({
  selector: 'app-file',
  templateUrl: './file.component.html',
  styleUrls: ['./file.component.css']
})
export class FileComponent implements OnInit {
  @Input() element: Field;
  @Input() savedFile: boolean;
  @Output() eventEmitter: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('fileInput') fileInput: ElementRef;
  valid: boolean;
  readerIsLoading: boolean;
  defaultAcceptedFiles = ['pdf', 'png', 'jpg'];
  acceptedFilesString = '*';
  maxSize: string = '2000000'; // in bytes
  errorMsg: string;
  preview: any;

  constructor(private renderer: Renderer) {
    this.convertExtensionsToString();
  }

  ngOnInit() {
    this.element.valid = true;
    if (this.savedFile) {
      this.valid = true;
    }
    this.element.changed = false;

    if (this.element.value && Array.isArray(this.element.value) && this.element.value.length > 0) {
      this.preview = this.element.value[0].url;
      this.element['valid'] = true;
      this.valid = true;
    }
  }

  openFile() {
    let event = new MouseEvent('click', {bubbles: true});
    this.renderer.invokeElementMethod(this.fileInput.nativeElement, 'dispatchEvent', [event]);
  }

  private convertExtensionsToString(): void {
    let temp = this.defaultAcceptedFiles.slice();
    for (let i = 0; i < this.defaultAcceptedFiles.length; i++) {
      temp[i] = '.' + this.defaultAcceptedFiles[i];
    }

    this.acceptedFilesString = temp.toString();
  }

  onChangeFile(event) {
    this.preview = '';
    if (!this.element.changed) {
      this.element.changed = true;
    }
    const src = event.target || event.srcElement;
    const files = src.files;

    if (files.length === 1) {
      let file = files[0];
      let extension = file['name'].split('.').pop();
      extension = extension.toLowerCase();
      const size = file['size'];

      this.element.value = {
        extension: '',
        data: '',
        type: 'image',
        width: 0,
        height: 0
      };

      if (this.defaultAcceptedFiles.indexOf(extension) !== -1) {
        if (size < this.maxSize) {
          this.readerIsLoading = true;

          let reader: FileReader = new FileReader();
          reader.onloadend = (e) => {
            let img = new Image;
            img.onload = () => {
              this.element.value.width = img.width;
              this.element.value.height = img.height;
              this.eventEmitter.emit({
                'id': this.element.identifier,
                'value': this.element.value
              });

              this.readerIsLoading = false;
            };
            img.src = reader.result;

            this.element.value['extension'] = extension;

            this.element.value['data'] = reader.result.replace(/^data:image\/\w+;base64,/, '');
            this.preview = reader.result;
          };
          reader.readAsDataURL(file);

          this.errorMsg = '';
          this.element['valid'] = true;
          this.valid = true;
        } else {
          this.errorMsg = 'File is too large. Max size should be 2MB';
          this.element['valid'] = false;
          this.valid = false;
          this.eventEmitter.emit({
            'id': this.element.identifier,
            'value': ''
          });
        }
      } else {
        this.errorMsg = 'Invalid file format. Allowed extensions: jpg, png, pdf';
        this.element['valid'] = false;
        this.valid = false;
        this.eventEmitter.emit({
          'id': this.element.identifier,
          'value': ''
        });
      }
    }
  }

  removeFile(event): void {
    if (!this.element.changed) {
      this.element.changed = true;
    }
    event.stopPropagation();
    this.element['valid'] = false;
    this.valid = false;
    this.element.value = '';
    this.preview = '';
    this.fileInput.nativeElement.value = '';
  }
}
