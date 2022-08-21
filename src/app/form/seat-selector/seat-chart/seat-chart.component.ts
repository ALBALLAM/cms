/* tslint:disable */

import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
    selector: 'app-seat-chart',
    templateUrl: './seat-chart.component.html',
    styleUrls: ['./seat-chart.component.scss']
})
export class SeatChartComponent implements OnInit {

    @Input() public zone = {
        color: '#000000'
    };
    @Input() public seatConfig;
    @Input() public direction = 'ltr';
    @Input() public currentLang;
    public disableMiddleSeatsPick = false;
    public seatmap = [];
    public seatChartConfig = {
        showRowsLabel: true,
        showRowWisePricing: false,
        newSeatNoForRow: true
    };
    public cart = {
        selectedSeats: [],
        seatstoStore: [],
        seatsforDisplay: [],
        totalamount: 0,
        cartId: '',
        eventId: 0
    };
    @Output() public selectSeatEvent = new EventEmitter();

    constructor() {
    }

    public ngOnInit() {
        this.processSeatChart(this.seatConfig);
    }

    public processSeatChart(map_data = []) {

        if (map_data.length > 0) {
            let seatNoCounter = 1;
            for (let __counter = 0; __counter < map_data.length; __counter++) {
                if (this.seatChartConfig.newSeatNoForRow) {
                    seatNoCounter = 1;
                }
                let row_label = '';
                const item_map = map_data[__counter].seats;
                row_label = 'Row ' + map_data[__counter].name + ' : ' + map_data[__counter].seat_price;

                const mapObj = {
                    seatRowLabel: map_data[__counter].name,
                    direction: map_data[__counter].direction,
                    seats: [],
                    seatPricingInformation: row_label
                };
                let totalItemCounter = 1;
                item_map.forEach(map_element => {
                    row_label = '';
                    const seatObj = {
                        key: map_data[__counter].name + '_' + totalItemCounter,
                        price: map_element.zone_price,
                        status: map_element.status,
                        zone_id: map_element.zone_id,
                        zone_color: map_element.zone_color,
                        zone_price: map_element.zone_price,
                        zone_name: map_element.zone_name,
                        seat_id: map_element.seat_id
                    };
                    if (seatObj.status !== 'empty') {
                        seatObj['seatLabel'] = map_data[__counter].name + ' ' + seatNoCounter;
                        if (seatNoCounter < 10) {
                            seatObj['seatNo'] = '0' + seatNoCounter;
                        } else {
                            seatObj['seatNo'] = '' + seatNoCounter;
                        }
                        seatNoCounter++;
                        totalItemCounter++;
                    } else {
                        seatObj['seatLabel'] = '';
                    }
                    mapObj['seats'].push(seatObj);
                });
                this.seatmap.push(mapObj);
            }
        }
    }

    public checkIfActionAllowed(seatObject, row) {
        let allowSelect = false;
        for (let i = 0; i < row.seats.length; i++) {
            if (row.seats[i].seatNo === seatObject.seatNo) {
                if (i !== 0 && i !== row.seats.length - 1) {
                    let previousRow = row.seats[i - 1].status;
                    let nextRow = row.seats[i + 1].status;
                    let isPreviousSeatUnavailabe = previousRow === 'reserved' || previousRow === 'booked';
                    let isNextSeatUnavailabe = nextRow === 'reserved' || nextRow === 'booked';
                    if (seatObject.status === 'available') {
                        if (isPreviousSeatUnavailabe || isNextSeatUnavailabe || previousRow === 'empty' || nextRow === 'empty') {
                            allowSelect = true;
                            break;
                        }
                    }
                    if (seatObject.status === 'booked') {
                        allowSelect = false;

                        // if the previous seat if an empty seat then we check on the next seats to allow the unselection
                        if (previousRow === 'empty') {
                            allowSelect = this.checkNextSeats(i, row);
                        }
                        // if the next seat if an empty seat then we check on the previous seats to allow the unselection
                        else if (nextRow === 'empty') {
                            allowSelect = this.checkPreviousSeats(i, row);
                        }
                        // if the previous seat if an reserved seat then we check on the next seats to allow the unselection
                        else if (previousRow === 'reserved') {
                            allowSelect = this.checkNextSeats(i, row);
                        }
                        // if the next seat if an reserved seat then we check on the previous seats to allow the unselection
                        else if (nextRow === 'reserved') {
                            allowSelect = this.checkPreviousSeats(i, row);
                        }
                        else {
                            // if the next seat is booked or available or the previous seat is booked or available then we check on these conditions
                            allowSelect = true;
                            if ((previousRow === 'booked' && nextRow === 'booked')
                                || (previousRow === 'empty' && nextRow === 'booked')
                                || (previousRow === 'booked' && nextRow === 'empty')
                                || (previousRow === 'reserved' && nextRow === 'booked')
                                || (previousRow === 'booked' && nextRow === 'reserved')) {
                                allowSelect = false;
                            }
                        }
                    }
                } else {
                    if (seatObject.status === 'available') {
                        allowSelect = true;
                        break;
                    }
                    else {
                        if (i === 0) {
                            allowSelect = this.checkNextSeats(i, row);
                        } else if (i === row.seats.length - 1) {
                            allowSelect = this.checkPreviousSeats(i, row);
                        }
                    }
                }
            }
        }
        return allowSelect;
    }

    // function to check on the seats after the selected seat (if the direct next seat is available then he can unselect the seat,
    // if all next seats are booked and he arrives at a reserved seat or empty seat or at the end of the theater then he can unselect the seat
    public checkNextSeats(selectedSeatIndex, row) {
        let allowSelect = false;
        for (let x = selectedSeatIndex + 1; x < row.seats.length; x++) {
            if (row.seats[x].status === 'available') {
                if (x === selectedSeatIndex + 1) {
                    allowSelect = true;
                }
                break;
            }
            if (row.seats[x].status === 'reserved' || row.seats[x].status === 'empty' || x === row.seats.length - 1) {
                allowSelect = true;
                break;
            }
        }
        return allowSelect;
    }

    // function to check on the seats before the selected seat (if the direct previous seat is available then he can unselect the seat,
    // if all previous seats are booked and he arrives at a reserved seat or empty seat or at the beginning of the theater then he can unselect the seat
    public checkPreviousSeats(selectedSeatIndex, row) {
        let allowSelect = false;
        for (let x = selectedSeatIndex - 1; x > -1; x--) {
            if (row.seats[x].status === 'available') {
                if (x === selectedSeatIndex - 1) {
                    allowSelect = true;
                }
                break;
            }
            if (row.seats[x].status === 'reserved' || row.seats[x].status === 'empty' || x === 0) {
                allowSelect = true;
                break;
            }
        }
        return allowSelect;
    }

    public selectSeat(seatObject, seatrow) {
        let allowSelect = false;
        if (this.disableMiddleSeatsPick) {
            allowSelect = this.checkIfActionAllowed(seatObject, seatrow);
        }
        if (!this.disableMiddleSeatsPick || (this.disableMiddleSeatsPick && allowSelect)) {
            if (seatObject.status === 'available') {
                seatObject.status = 'booked';
                this.cart.selectedSeats.push(seatObject.seatLabel);
                this.cart.seatstoStore.push({zone: seatObject.zone_id, seats: seatObject.seat_id});
                this.cart.seatsforDisplay.push({
                    row: seatObject.key.split('_')[0],
                    seat: seatObject.key.split('_')[1],
                    price: seatObject.price,
                    color: seatObject.zone_color
                });
                this.cart.totalamount += seatObject.price;
            } else if (seatObject.status = 'booked') {
                seatObject.status = 'available';
                let seatIndex = this.cart.selectedSeats.indexOf(seatObject.seatLabel);
                if (seatIndex > -1) {
                    this.cart.selectedSeats.splice(seatIndex, 1);
                    this.cart.seatstoStore.splice(seatIndex, 1);
                    this.cart.seatsforDisplay.splice(seatIndex, 1);
                    this.cart.totalamount -= seatObject.price;
                }

            }
            this.selectSeatEvent.emit(this.cart);
        }
    }

}
