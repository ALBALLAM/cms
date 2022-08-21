import { TestBed, inject } from '@angular/core/testing';

import { ErrorInterceptor } from './error-interceptor.service';
import { MAT_DIALOG_DATA } from '@angular/material';
import { SharedModule } from '../../modules/shared/shared.module';
import { RouterTestingModule } from '@angular/router/testing';

describe('ErrorInterceptor', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, RouterTestingModule],
      providers: [
        ErrorInterceptor,
        {provide: MAT_DIALOG_DATA, useValue: {}}]
    });
  });

  it('should be created', inject([ErrorInterceptor], (service: ErrorInterceptor) => {
    expect(service).toBeTruthy();
  }));
});
