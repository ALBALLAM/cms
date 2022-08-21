import { TestBed, inject } from '@angular/core/testing';

import { RefreshTokenService } from './refresh-token.service';
import { HttpClientModule } from '@angular/common/http';

describe('RefreshTokenService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [RefreshTokenService]
    });
  });

  it('should be created', inject([RefreshTokenService], (service: RefreshTokenService) => {
    expect(service).toBeTruthy();
  }));
});
