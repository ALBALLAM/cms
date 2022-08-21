export interface SignInApiResponse {
	first_name: string;
	last_name: string;
	token: string;
	side_menu: any;
}

export interface SignInApiRequest {
	email: string;
	password: string;
}