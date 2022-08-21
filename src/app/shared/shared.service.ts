import {Injectable} from '@angular/core';
import {Subject}    from 'rxjs/Subject';

@Injectable()
export class SharedService {
	private subject = new Subject<string>();
	subjectObservable = this.subject.asObservable();

	initializeTopBar():void{
		const object = {
			component: 'sign-in',
			action: 'initialize'
		};
		this.subject.next(JSON.stringify(object));
	}

	current():void{
		const object = {
			component: 'sign-in',
			action: 'initialize'
		};
		this.subject.next(JSON.stringify(object));
	}
}
