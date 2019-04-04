const chai = require('chai');
const assert = require('chai').assert;
const expect = require('chai').expect;
const spies = require('chai-spies');
const ParkingGarage = require('../parking-garage.js');

chai.use(spies);

describe('ParkingGarage', () => {
	let garage;
	let vehicle;

	beforeEach(() => {
		garage = new ParkingGarage.Garage();
		vehicle = new ParkingGarage.Vehicle('car');
	})

	afterEach(() => {
  	garage.emptyGarage();
	});

	describe('Vehicle', () => {

		it('should instantiate a new Vehicle', () => {
			assert.isObject(vehicle);
		});

		it('should have a vehicle type', () => {
			assert.equal(vehicle.type, 'car');
		});
		
		it('should have a default locationId of null', () => {	
			assert.equal(vehicle.locationId, null);					
		});

		it('should have a required spot type', () => {
			const expected = [ 'compact', 'large' ]
			assert.deepEqual(vehicle.spotTypeRequired, expected);
		});

		it('should have an amount of spots needed', () => {
			const vehicle = new ParkingGarage.Vehicle('bus');
			assert.equal(vehicle.spotsNeeded, 5);
		});
		
		it('should not be parked by default', () => {
			assert.equal(vehicle.parked, false);
		});
		
		it('should have a vehicleId', () => {	
			assert.notEqual(vehicle.vehicleId, '');					
		});

		describe('validateVehicleType', () => {
			it('should return a valid type for motorcycles, cars, and busses', () => {	
				assert.equal(vehicle.type, 'car');					
			});

			it('should return an error for vehicles entered that are not motorcycles, cars, and busses', () => {
				vehicle = new ParkingGarage.Vehicle('invalid vehicle');	
				const expected = 'INVALID VEHICLE TYPE';
				assert.equal(vehicle.type, expected);		
			});
		});

		describe('getRequiredSpotType', () => {
			it('should return 3 parking spot options for motorcycles', () => {
				vehicle = new ParkingGarage.Vehicle('motorcycle');
				const expected = ['motorcycleSize', 'compact', 'large'];
				assert.deepEqual(vehicle.spotTypeRequired, expected);		
			});

			it('should return 2 parking spot options for cars', () => {
				const expected = ['compact', 'large'];
				assert.deepEqual(vehicle.spotTypeRequired, expected);		
			});

			it('should return 1 parking spot option for busses', () => {
				vehicle = new ParkingGarage.Vehicle('bus');	
				const expected = ['large'];	
				assert.deepEqual(vehicle.spotTypeRequired, expected);
			});

			it('should return 0 parking spot options by default', () => {
				vehicle = new ParkingGarage.Vehicle('');	
				const expected = [];	
				assert.deepEqual(vehicle.spotTypeRequired, expected);
			});
		});

		describe('getSpotsNeeded', () => {
			it('should return 1 spot for motorcycles', () => {
				vehicle = new ParkingGarage.Vehicle('motorcycle');
				assert.equal(vehicle.spotsNeeded, 1);					
			});

			it('should return 1 spot for cars', () => {
				assert.equal(vehicle.spotsNeeded, 1);					
			});

			it('should return 5 spots for busses', () => {
				vehicle = new ParkingGarage.Vehicle('bus');	
				assert.equal(vehicle.spotsNeeded, 5);					
			});

			it('should return 0 parking spot options by default', () => {
				vehicle = new ParkingGarage.Vehicle('');
				assert.equal(vehicle.spotsNeeded, 0);
			});
		});
	});

	describe('Garage', () => {
		it('should have an empty list of parked vehicles by default', () => {
			assert.deepEqual(garage.parkedVehicles, []);
		});
		
		it('should not be full by default', () => {
			assert.equal(garage.full, false);
		});
		
		it('should not show an error by default', () => {
			assert.equal(garage.parkingError, null);
		});

		it('should start with 5000 location ids', () => {
			assert.equal(garage.remainingLocationIds, 5000);
		});

		it('should start with 7500 total spots', () => {
			assert.equal(garage.remainingSpotsTotal, 7500);
		});

		it('should start with 2500 spots each for motorcycles, cars, and busses', () => {
			assert.equal(garage.remainingSpots.motorcycleSize, 2500)
			assert.equal(garage.remainingSpots.compact, 2500)
			assert.equal(garage.remainingSpots.large, 2500)
		});

		it('should start with 500 total rows', () => {
			assert.equal(garage.remainingRows, 500);
		});

		it('should start with 10 total levels', () => {
			assert.equal(garage.remainingLevels, 10);
		});

		it('should have a list of possible parking spot sizes for each vehicle type', () => {
			const expected = {
							motorcycle: ['motorcycleSize', 'compact', 'large'],
							car: ['compact', 'large'],
							bus: ['large']
						}
			assert.deepEqual(garage.spotSizes, expected)
		});

		describe('parkVehicle', () => {
			it('should show parking garage as full and display parking error if there are no spots left', () => {
				const expected = 'Parking structure is full. Sorry!'
				assert.equal(garage.full, false);
				assert.equal(garage.parkingError, null);

				garage.remainingSpotsTotal = 0; 
				garage.remainingRows = 0; 
				garage.remainingLevels = 0;

				garage.parkVehicle(vehicle);
				assert.equal(garage.full, true);
				assert.equal(garage.parkingError, expected);
			});

			it('should display parking error if entered vehicle is invalid', () => {
				const expected = 'INVALID VEHICLE TYPE. Please enter motorcycle, car, or bus.';
				assert.equal(garage.parkingError, null);

				vehicle = new ParkingGarage.Vehicle('invalid vehicle');
				garage.parkVehicle(vehicle);
				assert.equal(garage.parkingError, expected);
			});

			it('should set vehicle parked property to true if vehicle entry is valid and there are spaces', () => {
				garage.parkVehicle(vehicle);
				assert.equal(vehicle.parked, true);
			});

			it('should invoke decrementLocationTotals if vehicle entry is valid and there are spaces', () => {
				assert.equal(garage.remainingLocationIds, 5000);
				let spy = chai.spy.on(garage, 'decrementLocationTotals');

				garage.parkVehicle(vehicle);

				expect(spy).to.have.been.called();		
			});

			it('should add car to array of parked cars if vehicle entry is valid and there are spaces', () => {
				assert.deepEqual(garage.parkedVehicles[0], undefined);
				garage.parkVehicle(vehicle);
				assert.deepEqual(garage.parkedVehicles[0], vehicle);				
			});
		});

		describe('selectCorrectSpotType', () => {
			let vehicle1, vehicle2, vehicle3;
			beforeEach(() => {
				vehicle1 = new ParkingGarage.Vehicle('motorcycle');
				vehicle2 = new ParkingGarage.Vehicle('car');
				vehicle3 = new ParkingGarage.Vehicle('bus');
			})

			afterEach(() => {
		  	garage.emptyGarage();
			});

			it('should return first spot size option if spots are available', () => {
				const spotType1 = garage.selectCorrectSpotType(vehicle1)
				assert.equal(spotType1, 'motorcycleSize');

				const spotType2 = garage.selectCorrectSpotType(vehicle2)
				assert.equal(spotType2, 'compact');

				const spotType3 = garage.selectCorrectSpotType(vehicle3)
				assert.equal(spotType3, 'large');

			});
			
			it('should return second spot size option if no spots for first option are available, if second spots are available and if a second option exists', () => {

				garage.remainingSpots.motorcycleSize = 0;
				const spotType1 = garage.selectCorrectSpotType(vehicle1)
				assert.equal(spotType1, 'compact');

				garage.remainingSpots.compact = 0;
				const spotType2 = garage.selectCorrectSpotType(vehicle2)
				assert.equal(spotType2, 'large');

				garage.remainingSpots.large = 0;
				const spotType3 = garage.selectCorrectSpotType(vehicle3)
				assert.equal(spotType3, 'There are no available spots of this size.');				
			});
			
			it('should return third spot size option if no spots for second option are available, if third spots are available and if a third option exists', () => {
	
				garage.remainingSpots.motorcycleSize = 0;
				garage.remainingSpots.compact = 0;
				const spotType1 = garage.selectCorrectSpotType(vehicle1)
				assert.equal(spotType1, 'large');

				garage.remainingSpots.large = 0;
				const spotType2 = garage.selectCorrectSpotType(vehicle2)
				assert.equal(spotType2, 'There are no available spots of this size.');

				const spotType3 = garage.selectCorrectSpotType(vehicle3)
				assert.equal(spotType3, 'There are no available spots of this size.');				
			});
		});

		describe('decrementLocationTotals', () => {
			let vehicle1, vehicle2, vehicle3;
			beforeEach(() => {
				vehicle1 = new ParkingGarage.Vehicle('motorcycle');
				vehicle2 = new ParkingGarage.Vehicle('car');
				vehicle3 = new ParkingGarage.Vehicle('bus');
			})

			afterEach(() => {
		  	garage.emptyGarage();
			});

			it('should decrement totals for entered vehicle spot type if spots are available', () => {
				assert.equal(garage.remainingSpots.motorcycleSize, 2500);
				assert.equal(garage.remainingSpots.compact, 2500);
				assert.equal(garage.remainingSpots.large, 2500);

				garage.decrementLocationTotals(vehicle1, 'motorcycleSize');
				garage.decrementLocationTotals(vehicle2, 'compact');
				garage.decrementLocationTotals(vehicle3, 'large');

				assert.equal(garage.remainingSpots.motorcycleSize, 2499);
				assert.equal(garage.remainingSpots.compact, 2499);
				assert.equal(garage.remainingSpots.large, 2499);
			});

			it('should decrement remaining spots by the number of spots required for each vehicle', () => {
				assert.equal(garage.remainingSpotsTotal, 7500);

				garage.decrementLocationTotals(vehicle1, 'motorcycleSize');
				assert.equal(garage.remainingSpotsTotal, 7499);

				garage.decrementLocationTotals(vehicle2, 'compact');
				assert.equal(garage.remainingSpotsTotal, 7498);

				garage.decrementLocationTotals(vehicle3, 'large');
				assert.equal(garage.remainingSpotsTotal, 7493);
			});
			
			it('should decrement remaining location ids by 1', () => {
				assert.equal(garage.remainingLocationIds, 5000);

				garage.decrementLocationTotals(vehicle1, 'motorcycleSize');
				assert.equal(garage.remainingLocationIds, 4999);

				garage.decrementLocationTotals(vehicle2, 'compact');
				assert.equal(garage.remainingLocationIds, 4998);

				garage.decrementLocationTotals(vehicle3, 'large');
				assert.equal(garage.remainingLocationIds, 4997);				
			});
			
			it('should assign vehicle locationId in numerical order starting with 1', () => {
				assert.equal(vehicle1.locationId, null);
				assert.equal(vehicle2.locationId, null);
				assert.equal(vehicle3.locationId, null);

				garage.decrementLocationTotals(vehicle1, 'motorcycleSize');
				garage.parkedVehicles.push(vehicle1);
				assert.equal(vehicle1.locationId, 1);

				garage.decrementLocationTotals(vehicle2, 'compact');
				garage.parkedVehicles.push(vehicle2);
				assert.equal(vehicle2.locationId, 2);

				garage.decrementLocationTotals(vehicle3, 'large');
				garage.parkedVehicles.push(vehicle3);
				assert.equal(vehicle3.locationId, 3);	
			});
			
			it('should decrement remaining rows by 1 for each 15 spots removed', () => {
				const bus1 = new ParkingGarage.Vehicle('bus');
				const bus2 = new ParkingGarage.Vehicle('bus');
				const bus3 = new ParkingGarage.Vehicle('bus');
				assert.equal(garage.remainingSpotsTotal, 7500);
				assert.equal(garage.remainingRows, 500);

				garage.decrementLocationTotals(bus1);
				assert.equal(garage.remainingSpotsTotal, 7495);
				assert.equal(garage.remainingRows, 500);

				garage.decrementLocationTotals(bus2);
				assert.equal(garage.remainingSpotsTotal, 7490);
				assert.equal(garage.remainingRows, 500);

				garage.decrementLocationTotals(bus3);
				assert.equal(garage.remainingSpotsTotal, 7485);
				assert.equal(garage.remainingRows, 499);
			});
			
			it('should decrement remaining levels by 1 for each 50 levels removed', () => {
				const bus = new ParkingGarage.Vehicle('bus');

				assert.equal(garage.remainingLocationIds, 5000);
				assert.equal(garage.remainingRows, 500);
				assert.equal(garage.remainingLevels, 10);

				garage.remainingLocationIds = 4900;
				garage.remainingRows = 551;
				garage.remainingSpotsTotal = 7460;

				garage.decrementLocationTotals(bus);
				assert.equal(garage.remainingRows, 550);
				assert.equal(garage.remainingLevels, 9);
			});
		});

		describe('removeVehicle', () => {
			let vehicle1, vehicle2, vehicle3;
			beforeEach(() => {
				vehicle1 = new ParkingGarage.Vehicle('motorcycle');
				vehicle2 = new ParkingGarage.Vehicle('car');
				vehicle3 = new ParkingGarage.Vehicle('bus');
			})

			afterEach(() => {
		  	garage.emptyGarage();
			});

			it('should invoke selectCorrectSpotType', () => {
				let spy = chai.spy.on(garage, 'selectCorrectSpotType');

				garage.parkVehicle(vehicle);

				expect(spy).to.have.been.called();
			});

			it('should set vehicle parked status to false', () => {
				assert.equal(vehicle.parked, false);

				garage.parkVehicle(vehicle);
				assert.equal(vehicle.parked, true);

				garage.removeVehicle(vehicle);	
				assert.equal(vehicle.parked, false);
			});
			
			it('should remove car from list of parked cars', () => {
				assert.deepEqual(garage.parkedVehicles[0], undefined);

				garage.parkVehicle(vehicle);
				assert.deepEqual(garage.parkedVehicles[0], vehicle);

				garage.removeVehicle(vehicle);	
				assert.deepEqual(garage.parkedVehicles[0], undefined);
			});

			it('should increment remaining spots', () => {
				assert.equal(garage.remainingSpotsTotal, 7500);

				garage.parkVehicle(vehicle);
				assert.equal(garage.remainingSpotsTotal, 7499);

				garage.removeVehicle(vehicle);	
				assert.equal(garage.remainingSpotsTotal, 7500);	
			});
			
			it('should increment available location ids', () => {
				assert.equal(garage.remainingLocationIds, 5000);

				garage.parkVehicle(vehicle);
				assert.equal(garage.remainingLocationIds, 4999);

				garage.removeVehicle(vehicle);	
				assert.equal(garage.remainingLocationIds, 5000);		
			});

			it('should increment totals for entered vehicle spot type if spots are available', () => {
				garage.parkVehicle(vehicle1);
				garage.parkVehicle(vehicle2);
				garage.parkVehicle(vehicle3);

				assert.equal(garage.remainingSpots.motorcycleSize, 2499);
				assert.equal(garage.remainingSpots.compact, 2499);
				assert.equal(garage.remainingSpots.large, 2499);

				garage.removeVehicle(vehicle1);
				garage.removeVehicle(vehicle2);
				garage.removeVehicle(vehicle3);

				assert.equal(garage.remainingSpots.motorcycleSize, 2500);
				assert.equal(garage.remainingSpots.compact, 2500);
				assert.equal(garage.remainingSpots.large, 2500);
			});
		});

		describe('emptyGarage', () => {
			it('should reset parked vehicles, full status, parking error, location ids and available spots, rows, and levels', () => {
				garage.parkedVehicles = ['car', 'bus'];
				garage.full = true;
				garage.parkingError = 'Parking lot full';
				garage.remainingLocationIds = 10;
				garage.remainingSpots = { motorcycleSize: 30, compact: 300, large: 2 };
				garage.remainingSpotsTotal = 3500;
				garage.remainingRows = 200;
				garage.remainingLevels = 4;


				garage.emptyGarage();
				assert.deepEqual(garage.parkedVehicles, []);
				assert.equal(garage.full, false);
				assert.equal(garage.parkingError, null);
				assert.equal(garage.remainingLocationIds, 5000);
				garage.remainingSpots = { motorcycleSize: 2500, compact: 2500, large: 2500 };
				assert.equal(garage.remainingSpotsTotal, 7500);
				assert.equal(garage.remainingRows, 500);
				assert.equal(garage.remainingLevels, 10);
			});
		});

		describe('getSpotSizes', () => {
			it('should return an object with possible parking spot sizes for each vehicle type', () => {
				const expected = {
								motorcycle: ['motorcycleSize', 'compact', 'large'],
								car: ['compact', 'large'],
								bus: ['large']
							}
				assert.deepEqual(garage.spotSizes, expected)
			});
		});
	});

});