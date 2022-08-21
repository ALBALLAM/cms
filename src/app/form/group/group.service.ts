import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {Subject} from 'rxjs/Subject';

@Injectable()
export class GroupService {
	private subject = new Subject<any>();

	constructor() {
	}

	removeComponent(data): void {
		this.subject.next(data);
	}

	getData(): Observable<any> {
		return this.subject.asObservable();
	}

	notifyRemove(data):void{
		this.subject.next(data);
	}
}

