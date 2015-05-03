/// <reference path="tsd.d.ts" />

interface VoterRecord {
	username: string;
	votes: number;
};

interface VotersResponse {
	result: VoterRecord[]
};
export = VotersResponse;
