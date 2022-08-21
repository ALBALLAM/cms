import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoDialogComponent } from './video-dialog.component';
import { SharedModule } from '../../modules/shared/shared.module';
import { MAT_DIALOG_DATA } from '@angular/material';

describe('VideoDialogComponent', () => {
  let component: VideoDialogComponent;
  let fixture: ComponentFixture<VideoDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule],
      providers: [
        {provide: MAT_DIALOG_DATA, useValue: {}}
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
