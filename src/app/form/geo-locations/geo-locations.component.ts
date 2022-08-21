import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {Field} from '../form.interface';
declare var $: any;

@Component({
  selector: 'app-geo-locations',
  templateUrl: './geo-locations.component.html',
  styleUrls: ['./geo-locations.component.scss']
})
export class GeoLocationsComponent implements OnInit{
  @Input() element: Field;
  @Output() eventEmitter: EventEmitter<any> = new EventEmitter<any>();
  @Output() customEventEmitter: EventEmitter<any> = new EventEmitter<any>();
  public userSettings: any;
  @ViewChild('geoLocationInput') geoLocationInput;


  ngOnInit() {
    this.userSettings = {
      inputPlaceholderText: 'Location',
      inputString: this.element.value && this.element.value.name ? this.element.value.name : ''
    };
  }

  autoCompleteCallback1(selectedData: any) {
    if (selectedData.data) {
      this.element.value = {
        name: selectedData.data.name,
        longitude: selectedData.data.geometry.location.lng,
        latitude: selectedData.data.geometry.location.lat
      };
      this.geoLocationInput.locationInput = selectedData.data.name;
    }
    this.eventEmitter.emit(this.element.value);
  }

  openLocation(){
    document.getElementById('search_places').click();
    // $('#search_places').click();
    // this.geoLocationInput.click();
  }
}
