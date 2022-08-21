import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Field} from '../form.interface';
import {CommunicationService} from '../../communication/communication.service';
import {ApiService} from '../../api/api.service';

@Component({
    selector: 'app-seat-selector',
    templateUrl: './seat-selector.component.html',
    styleUrls: ['./seat-selector.component.css']
})
export class SeatSelectorComponent implements OnInit {
    @Input() element: Field;
    @Input() floatLabel: boolean;
    @Output() eventEmitter: EventEmitter<any> = new EventEmitter<any>();
    @Output() customEventEmitter: EventEmitter<any> = new EventEmitter<any>();
    additionalClass: any;
    public zones = [];
    public seatsConfig = [];
    public seatsToDiplay = [];
    public totalAmount = 0;
    public totalAmountExchange = 0;
    public zonesAvailable = [];
    public zonesAvailabilityObj = {};

    constructor(private _communicationService: CommunicationService, private _apiService: ApiService) {
    }

    ngOnInit() {
        this.getSeatsAndZones();

    }

    chooseSeating(event) {
        this.seatsToDiplay = event.seatsforDisplay;
        this.totalAmount = event.totalamount;
        if (this.element.oldAmount) {
            this.totalAmountExchange = event.totalamount;
            this.totalAmount = parseFloat(event.totalamount) - parseFloat(this.element.oldAmount);
        }
        this.element.group.get(this.element.identifier).setValue(event.seatstoStore);
        this.element.value = event.seatstoStore;
        this.eventEmitter.emit({
            'id': this.element.identifier,
            'value': event.seatstoStore,
            'grp': this.element['field_group']
        });

        this.element['change'] = true;
        this.element.group.get(this.element.identifier).markAsTouched();
    }

    public getSeatsAndZones() {
        this.zonesAvailable = [];
        this._communicationService.showLoading(true);
        if (this.element.getData) {
            let url = this.element.getData;
            if (this.element.selectedId) {
                if (url.indexOf('?') < 0) {
                    url += '?';
                } else {
                    url += '&';
                }
                url += 'id=' + this.element.selectedId;
            }
            this._apiService.sendApi('get', url, '', true, false)
                .subscribe(response => {
                        this.zones = response['zones'];
                        this.seatsConfig = response['seats'];
                    },
                    (err) => {
                        this.getPageErrorCallback(err);
                    }, () => {
                        this.element.group.get(this.element.identifier).setValue([]);
                        this.element.value = [];
                        this.eventEmitter.emit({
                            'id': this.element.identifier,
                            'value': [],
                            'grp': this.element['field_group']
                        });
                        for (const row of this.seatsConfig) {
                            for (const seatObj of row.seats) {
                                if (seatObj.status === 'available') {
                                    if (this.zonesAvailabilityObj[seatObj.zone_id]) {
                                        this.zonesAvailabilityObj[seatObj.zone_id]['seats_available']++;
                                    } else {
                                        this.zonesAvailabilityObj[seatObj.zone_id] = {
                                            color: seatObj.zone_color,
                                            price: seatObj.zone_price,
                                            id: seatObj.zone_id,
                                            name: seatObj.zone_name,
                                            seats_available: 1
                                        };
                                    }
                                }
                            }
                        }
                        for(const key in this.zonesAvailabilityObj) {
                            this.zonesAvailable.push(this.zonesAvailabilityObj[key]);
                        }
                        this._communicationService.showLoading(false);
                    });
        }
    }

    private getPageErrorCallback(error): void {
        this._communicationService.showLoading(false);
        this._communicationService.showError(error.status);
    }
}
