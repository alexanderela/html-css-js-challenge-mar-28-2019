const uuidv4 = require('uuid/v4');

class Vehicle {
	constructor(type) {
		this.type = this.validateVehicleType(type);
		this.locationId = null;
		this.spotTypeRequired = this.getRequiredSpotType();
		this.spotsNeeded = this.getSpotsNeeded();
		this.parked = false;
		this.vehicleId = uuidv4();
	}

	validateVehicleType(vehicleCandidate) {
		let vehicleType = '';
		const acceptedVehicles = ['motorcycle', 'car', 'bus'];

		for(let i = 0; i < acceptedVehicles.length; i++) {
			if(acceptedVehicles[i] === vehicleCandidate) {
				vehicleType = acceptedVehicles[i];
			};
		};

		if(vehicleType !== '') {
			return vehicleType;
		} else {
			return 'INVALID VEHICLE TYPE'
		}
	};

	getRequiredSpotType() {
		let acceptedSpotTypes;
		const vehicleSpotTypes = {
															motorcycle: ['motorcycleSize', 'compact', 'large'],
															car: ['compact', 'large'],
															bus: ['large']
														};

		for(let key in vehicleSpotTypes) {
			if(key !== this.type) {
				acceptedSpotTypes = [];
			} else {
				acceptedSpotTypes = vehicleSpotTypes[key];
				break;
			}
		}

		return acceptedSpotTypes;
	};

	getSpotsNeeded() {
		switch(this.type) {
			case 'motorcycle':
				return 1
			case 'car':
				return 1
			case 'bus':
				return 5
			default:
				return 0
		};
	};
};

class Garage {
	constructor() {
		this.parkedVehicles = [];
		this.full = false;
		this.parkingError = null;
		this.remainingLocationIds = 5000;
		this.remainingSpotsTotal = 7500;
		this.remainingSpots = { motorcycleSize: 2500, compact: 2500, large: 2500 };
		this.remainingRows = 500;
		this.remainingLevels = 10;
		this.spotSizes = this.getSpotSizes();
	}

	parkVehicle(vehicleCandidate) {
		if(this.remainingSpotsTotal === 0 
			&& this.remainingRows === 0 
			&& this.remainingLevels === 0) {

			this.full = true;
			this.parkingError = 'Parking structure is full. Sorry!';

		} else if (vehicleCandidate.type === 'INVALID VEHICLE TYPE') {
			this.parkingError = 'INVALID VEHICLE TYPE. Please enter motorcycle, car, or bus.';

		} else {
			vehicleCandidate.parked = true;

			const correctSpotType = this.selectCorrectSpotType(vehicleCandidate);

			this.decrementLocationTotals(vehicleCandidate, correctSpotType);

			this.parkedVehicles.push(vehicleCandidate);
		};
	};

	selectCorrectSpotType(vehicle) {
		const { spotSizes, remainingSpots } = this;

		const size1 = spotSizes[vehicle.type][0];
		const size2 = spotSizes[vehicle.type][1];
		const size3 = spotSizes[vehicle.type][2];

		const spotOption1 = remainingSpots[size1];
		const spotOption2 = remainingSpots[size2];
		const spotOption3 = remainingSpots[size3];

		if(spotOption1 !== 0) {
			return size1;
		} else if (spotOption2 !== undefined && spotOption2 !== 0) {
			return size2;
		} else if (spotOption3 !== undefined && spotOption3 !== 0) {
			return size3;
		} else {
			return 'There are no available spots of this size.';
		}
	}

		decrementLocationTotals(vehicle, correctSpotType) {
			if (correctSpotType !== 'There are no available spots of this size.') {
				this.remainingSpots[correctSpotType]--;
			} 

			this.remainingSpotsTotal -= vehicle.spotsNeeded;
			this.remainingLocationIds--;
			vehicle.locationId = 5000 - this.remainingLocationIds;

			if(this.remainingSpotsTotal % 15 === 0) {
				this.remainingRows--;
			};

			if(this.remainingRows % 50 === 0) {
				this.remainingLevels--;
			};
		};

	removeVehicle(vehicleToRemove) {
		const filteredVehicles = this.parkedVehicles.filter(vehicle => {
			return vehicle.vehicleId !== vehicleToRemove.vehicleId;
		});

		const correctSpotType = this.selectCorrectSpotType(vehicleToRemove);

		vehicleToRemove.parked = false;
		this.parkedVehicles = filteredVehicles;
		this.remainingSpotsTotal += vehicleToRemove.spotsNeeded;
		this.remainingLocationIds++;
		this.remainingSpots[correctSpotType]++;
	}

	emptyGarage() {

		this.parkedVehicles = [];
		this.full = false;
		this.parkingError = null;
		this.remainingLocationIds = 5000;
		this.remainingSpots = { motorcycleSize: 2500, compact: 2500, large: 2500 };
		this.remainingSpotsTotal = 7500;
		this.remainingRows = 500;
		this.remainingLevels = 10;
	};

	getSpotSizes() {
		return 	 {
							motorcycle: ['motorcycleSize', 'compact', 'large'],
							car: ['compact', 'large'],
							bus: ['large']
						};
	};
};

module.exports = {
	Vehicle: Vehicle,
	Garage: Garage,
};