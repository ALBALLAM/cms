import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GeoLocationsComponent } from './geo-locations.component';

describe('GeoLocationsComponent', () => {
  let component: GeoLocationsComponent;
  let fixture: ComponentFixture<GeoLocationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GeoLocationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeoLocationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
