import {Component, ElementRef, EventEmitter, Input, OnInit, Output, Renderer, ViewChild} from '@angular/core';
import {Field} from '../form.interface';

@Component({
    selector: 'app-image',
    templateUrl: './image.component.html',
    styleUrls: ['./image.component.scss']
})
export class ImageComponent implements OnInit {
    @Input() element: Field;
    @Input() fromExtraTable: false;
    @Output() eventEmitter: EventEmitter<any> = new EventEmitter<any>();
    @Output() errorEmitter: EventEmitter<any> = new EventEmitter<any>();
    @ViewChild('imageInput') fileInput: ElementRef;
    valid: boolean;
    showErrorFile: boolean;
    readerIsLoading: boolean;
    defaultAcceptedFiles = ['png', 'jpg', 'jpeg'];
    acceptedFilesString = '*';
    // maxSize = '2000000'; // in bytes
    maxSize = 307200 ; // in bytes
    maxSizeSentence = '300KB'; // in bytes
    errorMsg: string;
    preview: any;

    constructor(private renderer: Renderer) {
    }

    ngOnInit() {
        this.element.valid = true;
        if (this.element.value) {
            if (this.element.value.data) {
                this.preview = 'data:image/png;base64,' + this.element.value.data;
            } else {
                this.preview = this.element.value;
            }
        }
        if ((this.element.value === '' || !this.element.value) && this.element.readonly === true) {
            this.preview = 'assets/images/topbar/ic_profile.png';
        }
        if (this.element.maxSize) {
            this.maxSize = this.element.maxSize;
        }
        if (this.element.maxSizeSentence) {
            this.maxSizeSentence = this.element.maxSizeSentence;
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
        this.showErrorFile = false;
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

            if (this.defaultAcceptedFiles.indexOf(extension) !== -1) {
                if (size < this.maxSize) {
                    this.readerIsLoading = true;
                    let reader: FileReader = new FileReader();
                    reader.onloadend = (e) => {
                        this.element.value = {
                            data: reader.result.toString().split('base64,')[1],
                            name: file['name'].toString().replace(' ', ''),
                            size: size,
                            extension: extension
                        };
                        this.preview = reader.result;
                        let imageWidth = 0;
                        let imageHeight = 0;
                        let _URL = window.URL;
                        let img = new Image();
                        img.onload = () => {
                            imageWidth = img.width;
                            imageHeight = img.height;
                            if (!this.element.isIcon || (this.element.isIcon && imageWidth === imageHeight)) {
                                this.eventEmitter.emit({
                                    'id': this.element.identifier,
                                    'value': this.element.value
                                });
                            } else {
                                this.errorMsg = 'Image width and height should be equal';
                                this.element['valid'] = false;
                                this.valid = false;
                                this.eventEmitter.emit({
                                    'id': this.element.identifier,
                                    'value': ''
                                });
                                this.fileInput.nativeElement.value = '';
                                this.errorEmitter.emit(this.errorMsg);
                                this.showErrorFile = true;
                            }
                        };
                        img.src = _URL.createObjectURL(file);
                    };
                    reader.readAsDataURL(file);

                    this.errorMsg = '';
                    this.element['valid'] = true;
                    this.valid = true;
                } else {
                    this.errorMsg = 'File is too large. Max size should be ' + this.maxSizeSentence;
                    this.element['valid'] = false;
                    this.valid = false;
                    this.eventEmitter.emit({
                        'id': this.element.identifier,
                        'value': ''
                    });
                    this.fileInput.nativeElement.value = '';
                    this.errorEmitter.emit(this.errorMsg);
                    this.showErrorFile = true;
                }
            } else {
                this.errorMsg = 'Invalid file format. Allowed extensions: jpg, png';
                this.element['valid'] = false;
                this.valid = false;
                this.eventEmitter.emit({
                    'id': this.element.identifier,
                    'value': ''
                });
                this.fileInput.nativeElement.value = '';
                this.errorEmitter.emit(this.errorMsg);
                this.showErrorFile = true;
            }
        }
    }

    removeFile(event): void {
        this.preview = '';
        this.errorMsg = '';
        if (!this.element.changed) {
            this.element.changed = true;
        }
        event.stopPropagation();
        this.element['valid'] = false;
        this.valid = false;
        this.element.value = '';
        this.fileInput.nativeElement.value = '';
    }
}
