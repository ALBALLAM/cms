import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoComponent } from './video.component';
import { SharedModule } from '../../shared/shared.module';
import { FormBuilder } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('VideoComponent', () => {
  let component: VideoComponent;
  let fixture: ComponentFixture<VideoComponent>;
  const formBuilder: FormBuilder = new FormBuilder();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, BrowserAnimationsModule],
      providers: [
        {provide: FormBuilder, useValue: formBuilder}
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoComponent);
    component = fixture.componentInstance;
    component.name = 'name';
    component.label = 'Label';
    component.required = true;
    component.hint = 'field hint';
    component.group = formBuilder.group({
      name: null
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create mat-form-field', () => {
    const matField = document.getElementsByTagName('mat-form-field');
    expect(matField.length !== 0).toBe(true);
  });

  it('should create input', () => {
    const input = document.querySelector('input[type="text"]');
    expect(input !== null).toBe(true);
  });
});
