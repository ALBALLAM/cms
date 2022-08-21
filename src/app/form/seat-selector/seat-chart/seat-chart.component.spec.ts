import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SeatChartComponent } from './seat-chart.component';

describe('SeatChartComponent', () => {
  let component: SeatChartComponent;
  let fixture: ComponentFixture<SeatChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SeatChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SeatChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
