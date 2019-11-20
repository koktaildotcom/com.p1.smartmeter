const Homey = require('homey');

class P1Device extends Homey.Device {

    round(number) {
        return Math.round(number * 100) / 100
    }

    onInit() {
        this._driver = this.getDriver();
        this.handleNewReadings = this._driver.handleNewReadings.bind(this);
        // this.watchDogCounter = 10;
        // const settings = this.getSettings();
        this.meters = {};
        this.initMeters();

        this.registerEventListeners(this);
    }

    registerEventListeners(device) {
        Homey.on('update.data', function (data) {
            device.handleNewReadings(data);
        });
    }

    initMeters() {
		this.meters = {
			// lastMeasureGas: 0,										// 'measureGas' (m3)
			// lastMeterGas: null, 									    // 'meterGas' (m3)
			// lastMeterGasTm: 0,										// timestamp of gas meter reading, e.g. 1514394325
            lastMeasurePower: 0,									// 'measurePower' (W) (consumed - produced)
            lastMeasurePowerConsumed: 0,                            // 'measure_power.consumed' (W)
            lastMeasurePowerProduced: 0,                            // 'measure_power.produced' (W)
			lastMeasurePowerAvg: 0,								    // '2 minute average measurePower' (kWh)
			lastMeterPower: null,									// 'meterPower' (kWh)
			lastMeterPowerPeak: null,							    // 'meterPower_peak' (kWh)
			lastMeterPowerOffpeak: null,					        // 'meterPower_offpeak' (kWh)
			lastMeterPowerPeakProduced: null,			            // 'meterPower_peak_produced' (kWh)
			lastMeterPowerOffpeakProduced: null,	                // 'meterPower_offpeak_produced' (kWh)
			lastMeterPowerTm: null, 							    // timestamp epoch, e.g. 1514394325
			lastMeterPowerInterval: null,					        // 'meterPower' at last interval (kWh)
			lastMeterPowerIntervalTm: null, 			            // timestamp epoch, e.g. 1514394325
            lastOffpeak: null,										// 'meterPower_offpeak' (true/false)
		};
	}

    updateDeviceState() {
        try {
			// this.setCapabilityValue('measure_gas', this.meters.lastMeasureGas);
			// this.setCapabilityValue('meter_gas', this.meters.lastMeterGas);
            this.setCapabilityValue('measure_power', this.meters.lastMeasurePower);
            this.setCapabilityValue('measure_power.consumed', this.meters.lastMeasurePowerConsumed);
            this.setCapabilityValue('measure_power.produced', this.meters.lastMeasurePowerProduced);
            this.setCapabilityValue('meter_power', this.meters.lastMeterPower);
			this.setCapabilityValue('meter_power.peak', this.meters.lastMeterPowerPeak);
			this.setCapabilityValue('meter_power.offPeak', this.meters.lastMeterPowerOffpeak);
			this.setCapabilityValue('meter_power.producedPeak', this.meters.lastMeterPowerPeakProduced);
			this.setCapabilityValue('meter_power.producedOffPeak', this.meters.lastMeterPowerOffpeakProduced);
			this.setCapabilityValue('meter_offPeak', this.meters.lastOffpeak);
        } catch (error) {
            this.error(error);
        }
    }
}

module.exports = P1Device