import {Component, Input, Output, EventEmitter, OnInit, Renderer, ViewChild, ElementRef} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {MatDialog} from '@angular/material';
import {VideoDialogComponent} from '../../video-dialog/video-dialog.component';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss']
})
export class VideoComponent implements OnInit {
  @Input() public element: any;
  @Input() public src: string;
  @Input() public width: string;
  @Input() public height: string;
  @Input() public controls: boolean;
  @Input() public showError: boolean;
  @Input() public errorText: string;
  @ViewChild('videoInput') fileInput: ElementRef;
  public acceptedFilesString = 'video/*';


    constructor(private renderer: Renderer, private _dialog: MatDialog) {
    }

    ngOnInit() {
      this.element.valid = true;
      this.src = "";
      this.showError = false;
      if (this.element.value.originalSource && this.element.value.originalSource !== '') {
          this.src = this.element.value.originalSource;
      } else if (this.element.value && this.element.value !== {} && this.element.value.data && this.element.value.data.name) {
          this.src = this.element.value.data.name;
      }
    }

    openFile() {
        const event = new MouseEvent('click', {bubbles: true});
        this.renderer.invokeElementMethod(this.fileInput.nativeElement, 'dispatchEvent', [event]);
    }

    handleVideoUpload(event): void {
      let maxSize = 5242880;
      if (this.element.maxSize && this.element.maxSize !== '') {
          maxSize = this.element.maxSize;
      }
      let request = {
          uploadVideoObjectSrc: '',
          uploadVideoObjectFile: {}
      };
      this.showError = false;
        const file = event.target.files[0];
        const fileType = file.type;
        if (fileType.indexOf('video') > -1 || fileType.indexOf('mp4') > -1) {
            if (event.target.files[0].size > maxSize) {
              this.showError = true;
              if (this.element.maxSizeSentence && this.element.maxSizeSentence !== '') {
                  this.errorText = this.element.maxSizeSentence;
              } else {
                  this.errorText = 'Video can\'t exceed 5MB';
              }
                // this.showAlert(this.translation.GENERAL_ERRORS.VIDEO_MAX_SIZE, '');
            } else {
                const reader = new FileReader();
                this.element.value = {data: event.target.files[0], originalSource: ''};
                this.src = this.element.value.data.name;
            }
        } else {
            this.showError = true;
            this.errorText = 'Video format is not mp4';
        }
    }

    handleRemoveVideo() {
        this.src = "";
        this.element.value = {};
    }

    openVideoPopUp(video_src): void {
        event.stopPropagation();
        this._dialog.open(VideoDialogComponent, {
            data: {
                src: video_src
            }
        });
    }

}
