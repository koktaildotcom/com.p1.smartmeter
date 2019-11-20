const Homey = require('homey');

class P1Driver extends Homey.Driver {
    
    onInit() {
        this._flowTriggers = [];
        this.registerFlowCards();
    }

    onPairListDevices(data, callback) {
        let devices = [
            {
                "name": "Iska AM550 P1 smart meter (ESMR 5.0)",
                "data": {
                    "id": "ISKA-AM550"
                },
            },
        ];
        callback(null, devices);
    }

    registerFlowCards() {
        let triggers = [
            'power.changed',
            'meter_tarif.changed'
        ];

        for (const trigger of triggers) {
            this._flowTriggers[trigger] = new Homey.FlowCardTriggerDevice(trigger).register();
        }
    }
    
    handleNewReadings(data) {	// call with device as this
        let device = this;
		// this.log(`handling new readings for ${this.getName()}`);
		// gas readings from device
		// let meterGas = this.meters.lastMeterGas;
		// let measureGas = this.meters.lastMeasureGas;
		// if (readings.g !== undefined) {
		// 	meterGas = readings.g.gas; // gas_cumulative_meter
		// 	const meterGasTm = Date.now() / 1000; // gas_meter_timestamp
		// 	// constructed gas readings
		// 	if (this.meters.lastMeterGas !== meterGas) {
		// 		if (this.meters.lastMeterGas !== null) {	// first reading after init
		// 			let hoursPassed = (meterGasTm - this.meters.lastMeterGasTm) / 3600;	// hrs
		// 			if (hoursPassed > 1.5) { // too long ago; assume 1 hour interval
		// 				hoursPassed = 1;
		// 			}
		// 			measureGas = Math.round(1000 * ((meterGas - this.meters.lastMeterGas) / hoursPassed)) / 1000; // gas_interval_meter
		// 		}
		// 		this.meters.lastMeterGasTm = meterGasTm;
		// 	}
		// }

		// electricity readings from device
		const meterPowerPeak = data.electricity.received.tariff2.reading;
        const meterPowerOffpeak = data.electricity.received.tariff1.reading;
		const meterPowerPeakProduced = data.electricity.delivered.tariff2.reading;
		const meterPowerOffpeakProduced = data.electricity.delivered.tariff1.reading;
        
        let measurePowerConsumed = device.round((data.electricity.instantaneous.power.positive.L1.reading +
                                                data.electricity.instantaneous.power.positive.L2.reading +
                                                data.electricity.instantaneous.power.positive.L3.reading) * 1000);
        let lastMeasurePowerProduced = device.round((data.electricity.instantaneous.power.negative.L1.reading +
                                                data.electricity.instantaneous.power.negative.L2.reading +
                                                data.electricity.instantaneous.power.negative.L3.reading) * 1000);
        let measurePower = measurePowerConsumed - lastMeasurePowerProduced;
        
        let measurePowerAvg = this.meters.lastMeasurePowerAvg;
        const meterPowerTm = Date.now() / 1000; // readings.tm;
        
        // constructed electricity readings
		const meterPower = (meterPowerOffpeak + meterPowerPeak) - (meterPowerOffpeakProduced + meterPowerPeakProduced);
        let offPeak = this.meters.lastOffpeak;
        if(device.round(data.electricity.tariffIndicator) === 1)
        {
            offPeak = true;
        }
        else
        {
            offPeak = false;
        }

		// measurePowerAvg 2 minutes average based on cumulative meters
		// if (this.meters.lastMeterPowerIntervalTm === null) {	// first reading after init
		// 	this.meters.lastMeterPowerInterval = meterPower;
		// 	this.meters.lastMeterPowerIntervalTm = meterPowerTm;
		// }
		// if ((meterPowerTm - this.meters.lastMeterPowerIntervalTm) >= 120) {
		// 	measurePowerAvg = Math.round((3600000 / 120) * (meterPower - this.meters.lastMeterPowerInterval));
		// 	this.meters.lastMeterPowerInterval = meterPower;
		// 	this.meters.lastMeterPowerIntervalTm = meterPowerTm;
        // }
        // correct measurePower with average measurePower_produced in case point_meter_produced is always zero
		// if (measurePower === 0 && measurePowerAvg < 0) {
		// 	measurePower = measurePowerAvg;
        // }
        
		const measurePowerDelta = (measurePower - this.meters.lastMeasurePower);
		// trigger the custom trigger flowcards
		if (offPeak !== this.meters.lastOffpeak) {
            const tokens = { 
                tariff: offPeak 
            };
            device._driver.triggerChangedFlow('meter_tarif.changed', device, tokens);
            
            // this.tariffChangedTrigger
			// 	.trigger(this, tokens)
			// 	.catch(this.error);
			// .then(this.error('Tariff change flow card triggered'));
		}
		if (measurePower !== this.meters.lastMeasurePower) {
			const tokens = {
				power: measurePower,
				power_delta: measurePowerDelta,
            };
            device._driver.triggerChangedFlow('power.changed', device, tokens);
            
            // this.powerChangedTrigger
			// 	.trigger(this, tokens)
			// 	.catch(this.error);
			// .then(this.error('Power change flow card triggered'));
            
            // update the ledring screensavers
			// this._ledring.change(this.getSettings(), measurePower);
        }
        
		// store the new readings in memory
		// this.meters.lastMeasureGas = measureGas;
		// this.meters.lastMeterGas = meterGas;
		// this.meters.lastMeterGasTm = meterGasTm || this.meters.lastMeterGasTm;

        this.meters.lastMeasurePower = measurePower;
        this.meters.lastMeasurePowerConsumed = measurePowerConsumed;
        this.meters.lastMeasurePowerProduced = lastMeasurePowerProduced;
		this.meters.lastMeasurePowerAvg = measurePowerAvg;
		this.meters.lastMeterPower = meterPower;
		this.meters.lastMeterPowerPeak = meterPowerPeak;
		this.meters.lastMeterPowerOffpeak = meterPowerOffpeak;
		this.meters.lastMeterPowerPeakProduced = meterPowerPeakProduced;
		this.meters.lastMeterPowerOffpeakProduced = meterPowerOffpeakProduced;
		this.meters.lastMeterPowerTm = meterPowerTm;
		this.meters.lastOffpeak = offPeak;
		// update the device state
		// this.log(this.meters);
		this.updateDeviceState();
	}

    triggerChangedFlow (triggerName, device, tokens) {
        if (triggerName in this._flowTriggers) {
            this._flowTriggers[triggerName]
                .trigger(device, tokens)
            .then(() => {
                console.log('triggered ' + triggerName + ' with success!');
            })
            .catch((error) => {
                console.log('triggered ' + triggerName + ' failed: ' + error);
            });
        }
    }
}

module.exports = P1Driver;