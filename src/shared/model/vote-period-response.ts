/// <reference path="tsd.d.ts" />

interface VotePeriodResponse {
	years: {
		year: number;
		months: number[];
	}[]
}

export = VotePeriodResponse;
