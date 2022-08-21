import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material';

@Component({
  selector: 'app-video-dialog',
  templateUrl: './video-dialog.component.html',
  styleUrls: ['./video-dialog.component.scss']
})
export class VideoDialogComponent implements OnInit {

  public allowDownload = true;

  constructor(@Inject(MAT_DIALOG_DATA) public data) {
  }

  public ngOnInit() {
  }
}
