import {Component, ElementRef, EventEmitter, Input, OnInit, Output, Renderer, ViewChild} from '@angular/core';
import {Field} from '../form.interface';

@Component({
    selector: 'app-gallery',
    templateUrl: './gallery.component.html',
    styleUrls: ['./gallery.component.scss']
})
export class GalleryComponent implements OnInit {
    @Input() element: Field;
    @Input() fromExtraTable: false;
    @Output() eventEmitter: EventEmitter<any> = new EventEmitter<any>();
    @Output() errorEmitter: EventEmitter<any> = new EventEmitter<any>();
    @ViewChild('imageInput') fileInput: ElementRef;
    valid: boolean;
    readerIsLoading: boolean;
    defaultAcceptedFiles = ['png', 'jpg','jpeg'];
    acceptedFilesString = '*';
    // maxSize = '2000000'; // in bytes
    maxSize = '307200'; // in bytes
    errorMsg: string;
    preview: any[];
    uploadedImagesIndex = 0;
    showGalleryError = false;
    galleryErrorMessage: string;
    @ViewChild("imageInput") imageInput: ElementRef;

    constructor(private renderer: Renderer) {
    }

    ngOnInit() {
        this.element.valid = true;
        if (typeof(this.element.value) === 'string') {
            this.element.value = [];
        }
        this.preview = [];
        if (this.element.value) {
            this.element.value.forEach( (value, index) => {
                if (typeof(value) !== 'string') {
                    this.element.value.splice(index, 1);
                }
            });
            this.element.value.forEach( (value, index) => {
                this.preview.push(value);
            });
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
        if (!this.element.changed) {
            this.element.changed = true;
        }

        this.showGalleryError = false;
        if (event.target.files && event.target.files.length > 0 && this.uploadedImagesIndex < 10) {
            for (let i = 0; i < event.target.files.length; i++) {
                if (event.target.files[i].size < this.maxSize) {
                    const reader = new FileReader();
                    const name = event.target.files[i].name;
                    const extension = event.target.files[i].type.substring(event.target.files[i].type.lastIndexOf('/') + 1);
                    const size = event.target.files[i].size;
                    reader.readAsDataURL(event.target.files[i]); // read select as data url
                    reader.onload = (e) => { // called once readAsDataURL is completed
                        this.element.value.push({
                            name: name,
                            data: reader.result.toString().split('base64,')[1],
                            extension: extension,
                            size: size
                        });
                        ++this.uploadedImagesIndex;
                        this.eventEmitter.emit({
                            'id': this.element.identifier,
                            'value': this.element.value
                        });
                        this.preview.push(reader.result);
                        this.imageInput.nativeElement.value = '';
                        this.element['valid'] = true;
                        this.valid = true;
                    };
                } else {
                    this.showGalleryError = true;
                    this.galleryErrorMessage = 'Some images were not uploaded because their size exceeds 300KB';
                }
            }
        } else {
            this.showGalleryError = true;
            this.galleryErrorMessage = 'You are only allowed to upload 10 images at one time';
        }
    }

    removeFile(event, index): void {
        this.preview.splice(index, 1);
        this.element.value.splice(index, 1);
        event.stopPropagation();
    }
}
