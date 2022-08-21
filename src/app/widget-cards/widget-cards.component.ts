import {AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {CommunicationService} from '../communication/communication.service';
import {ApiService} from '../api/api.service';
import {debounceTime, distinctUntilChanged, map} from 'rxjs/operators';
import {fromEvent} from 'rxjs';
import {FormBuilder, FormGroup} from '@angular/forms';

@Component({
    selector: 'app-widget-cards',
    templateUrl: './widget-cards.component.html',
    styleUrls: ['./widget-cards.component.scss']
})
export class WidgetCardsComponent implements OnInit, AfterViewInit {
    @Input() public data;
    @Input() public tableTitle;
    @Input() public pageUrl;
    @Input() public fields;
    @Input() public blocks;
    public showDetails = false;
    public detailsResponse: any;
    public selectedWidget: any;
    public fieldsObject: any;
    public blocksObject: any;
    public searchCandidates: string;
    public detailsArray: any[];
    @ViewChild('searchElement') searchElement: ElementRef;
    @Output() eventEmitter: EventEmitter<any> = new EventEmitter<any>();
    seniorityElement: any;
    skillsElement: any;
    searchForm: FormGroup;
    skillsOptions = [];
    showFilters: boolean;

    constructor(private _communicationService: CommunicationService,
                private _apiService: ApiService, private _formBuilder: FormBuilder) {
    }

    ngOnInit() {
        this.getSkillsOptions();
        this.data.forEach(element => {
            if (element.bio && element.bio.length > 80) {
                element.bio = element.bio.substring(0, 80) + '...';
            }
        });
        this.formatFields();
        this.formatBlocks();
    }

    ngAfterViewInit() {
        if (this.searchElement) {
            const obj = fromEvent(this.searchElement.nativeElement, 'input').pipe(
                map((event: Event) => (<HTMLInputElement>event.target).value),
                debounceTime(1000),
                distinctUntilChanged()
            );
            obj.subscribe(data => this.eventEmitter.emit({searchWord: this.searchCandidates}));
        }
    }

    getSkillsOptions() {
        this._communicationService.showLoading(true);
        this._apiService.sendApi('get', '/skill/list', '', true, false)
            .subscribe(data => {
                    this.skillsOptions = data;
                },
                (error) => {
                    this._communicationService.showLoading(false);
                    this._communicationService.showError(error.status);
                }, () => {
                    this.initializeFilters();
                    this.showFilters = true;
                    this._communicationService.showLoading(false);
                });
    }

    initializeFilters() {
        this.searchForm = this._formBuilder.group({
            seniorityElement: [],
            skillsElement: [],
        });

        this.seniorityElement = {
            label: "Seniority",
            group: this.searchForm,
            identifier: "seniorityElement",
            required: false,
            type: "multi-select",
            options: [
                {
                    "text": "Junior",
                    "value": "junior"
                },
                {
                    "text": "Mid",
                    "value": "mid"
                },
                {
                    "text": "Senior",
                    "value": "senior"
                },
                {
                    "text": "Senior Plus",
                    "value": "Senior Plus"
                },
                {
                    "text": "Tech Lead",
                    "value": "Tech Lead"
                }
            ]
        };

        this.skillsElement = {
            label: "Skills",
            group: this.searchForm,
            identifier: "skillsElement",
            required: false,
            type: "multi-select",
            options: this.skillsOptions
        };
    }


    onSearch() {
        const eventValue = {
            seniority: this.searchForm.controls.seniorityElement.value,
            skills: this.searchForm.controls.skillsElement.value
        };
        this.eventEmitter.emit(eventValue);
    }

    viewDetailsFunction(employee_id) {
        this.selectedWidget.availability = true;
        this._communicationService.showLoading(true);

        this._apiService.sendApi('get', this.pageUrl + '/' + employee_id, '', true, false)
            .subscribe(data => {
                    this.detailsResponse = data;
                },
                (error) => {
                    this._communicationService.showLoading(false);
                    this._communicationService.showError(error.status);
                }, () => {
                    this.prepareDetailsPage();
                });
    }

    formatFields() {
        this.fieldsObject = {};
        this.fields.forEach(field => {
            if (this.fieldsObject[field.identifier] === undefined) {
                this.fieldsObject[field.identifier] = field;
            }
        });
    }

    formatBlocks() {
        this.blocksObject = {};
        this.blocks.forEach(block => {
            if (this.fieldsObject[block.identifier] === undefined) {
                this.blocksObject[block.identifier] = block;
            }
        });
    }

    _calculateAge(dob) { // birthday is a date
        let birthday = new Date(dob);
        let ageDifMs = Date.now() - birthday.getTime();
        let ageDate = new Date(ageDifMs); // miliseconds from epoch
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    }

    getAvailibility(availibility) {
        let avDate = new Date(availibility);
        let dateNow = new Date();

        let months;
        months = (avDate.getFullYear() - dateNow.getFullYear()) * 12;
        months -= dateNow.getMonth() + 1;
        months += avDate.getMonth();
        return months <= 0 ? 0 : months;
    }

    prepareDetailsPage() {
        this.detailsArray = [];
        let fieldsArray;
        let blockConf;
        let arrayName, value;

        Object.keys(this.detailsResponse).forEach(key => {
            blockConf = this.blocksObject[key];
            if (this.detailsResponse[key] !== {} && key !== '_id' && key !== 'profileInfo') {
                switch (blockConf.type) {
                    case 'list':
                        fieldsArray = [];
                        Object.keys(this.detailsResponse[key]).forEach(keyElement => {
                            if (this.fieldsObject[keyElement]) {
                                value = this.detailsResponse[key][keyElement];
                                if (this.fieldsObject[keyElement].type === 'multi-select') {
                                    arrayName = '';
                                    this.detailsResponse[key][keyElement].forEach(valueElement => {
                                        if (arrayName === '') {
                                            arrayName = valueElement;
                                        } else {
                                            arrayName = arrayName + ', ' + valueElement;
                                        }
                                    });
                                    value = arrayName;
                                } else if (this.fieldsObject[keyElement].type === 'array') { //added temporary for the skills
                                    value = '';
                                    this.detailsResponse[key][keyElement].forEach(valueElement => {
                                        if (valueElement.level && valueElement.level > 0) {
                                            fieldsArray.push({
                                                type: this.fieldsObject[keyElement].type,
                                                label: valueElement.skill,
                                                value: valueElement.level
                                            });
                                        }
                                    });
                                }
                                if (value && value !== '') {
                                    fieldsArray.push({
                                        order: this.fieldsObject[keyElement].order,
                                        type: this.fieldsObject[keyElement].type,
                                        label: this.fieldsObject[keyElement].label,
                                        value: value
                                    });
                                }
                            }
                        });
                        break;
                    case 'card':
                        fieldsArray = this.detailsResponse[key][blockConf.child];
                        break;
                }
                if (fieldsArray && fieldsArray.length > 0) {
                    this.detailsArray.push({
                        blockType: blockConf.type,
                        blockTitle: blockConf.label,
                        blockFields: fieldsArray
                    });
                }
            }
        });
        this._communicationService.showLoading(false);
        this.showDetails = true;
    }
}
