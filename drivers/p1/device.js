const Homey = require('homey')

class P1Device extends Homey.Device {

    round (number) {
        return Math.round(number * 100) / 100
    }

    onInit () {
        console.log('P1 Device ready');
        this._driver = this.getDriver()
        this.handleNewReadings = this._driver.handleNewReadings.bind(this)
        this.settings = this.getSettings()
        this.meters = {}
        this.initMeters()

        this.registerEventListeners(this)
    }

    registerEventListeners (device) {
        Homey.on('update.data', function (data) {
            device.handleNewReadings(data)
        })
    }

    initMeters () {
        this.meters = {
            lastMeasureGas: 0,										// 'measureGas' (m3)
            lastMeterGas: null, 									    // 'meterGas' (m3)
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
        }
    }

    // this method is called when the user has changed the device's settings in Homey.
    async onSettings (oldSettingsObj, newSettingsObj, changedKeysArr) {
        this.log(
          `${this.getData().id} ${this.getName()} device settings changed`)

        await changedKeysArr.forEach(async (key) => {
            switch (key) {
                case 'include_gas':
                    if (newSettingsObj.include_gas) {
                        await this.addCapability('measure_gas')
                        await this.addCapability('meter_gas')
                    } else {
                        await this.removeCapability('measure_gas')
                        await this.removeCapability('meter_gas')
                    }
                    break
                case 'include_production':
                    if (newSettingsObj.include_production) {
                        await this.addCapability('measure_power.consumed')
                        await this.addCapability('measure_power.produced')
                        await this.addCapability('meter_power.producedPeak')
                        if (newSettingsObj.include_off_peak) {
                            await this.addCapability(
                              'meter_power.producedOffPeak')
                        }
                    } else {
                        await this.removeCapability('measure_power.consumed')
                        await this.removeCapability('measure_power.produced')
                        await this.removeCapability('meter_power.producedPeak')
                        await this.removeCapability(
                          'meter_power.producedOffPeak')
                    }
                    break
                case 'include_off_peak':
                    if (newSettingsObj.include_off_peak) {
                        await this.addCapability('meter_power.peak')
                        await this.addCapability('meter_power.offPeak')
                        if (newSettingsObj.include_production) {
                            await this.addCapability(
                              'meter_power.producedOffPeak')
                        }
                        await this.addCapability('meter_offpeak')
                    } else {
                        await this.removeCapability('meter_power.peak')
                        await this.removeCapability('meter_power.offPeak')
                        await this.removeCapability(
                          'meter_power.producedOffPeak')
                        await this.removeCapability('meter_offpeak')
                    }
                    break
                default:
                    break
            }
        })
        this.log(newSettingsObj)
        this.settings = newSettingsObj
        Promise.resolve(true)
    }

    updateDeviceState () {
        try {
            if (this.settings.include_gas) {
                this.setCapabilityValue('measure_gas', this.meters.lastMeasureGas)
                this.setCapabilityValue('meter_gas', this.meters.lastMeterGas)
            }
            this.setCapabilityValue('measure_power', this.meters.lastMeasurePower)
            this.setCapabilityValue('measure_power.consumed', this.meters.lastMeasurePowerConsumed)
            this.setCapabilityValue('meter_power', this.meters.lastMeterPower)
            if (this.settings.include_production) {
                this.setCapabilityValue('measure_power.produced', this.meters.lastMeasurePowerProduced)
                this.setCapabilityValue('meter_power.producedPeak', this.meters.lastMeterPowerPeakProduced)
                if (this.settings.include_off_peak) {
                    this.setCapabilityValue('meter_power.producedOffPeak', this.meters.lastMeterPowerOffpeakProduced)
                }
            }
            if (this.settings.include_off_peak) {
                this.setCapabilityValue('meter_power.peak', this.meters.lastMeterPowerPeak)
                this.setCapabilityValue('meter_power.offPeak', this.meters.lastMeterPowerOffpeak)
                this.setCapabilityValue('meter_offpeak', this.meters.lastOffpeak)
            }
        } catch (error) {
            this.error(error)
        }
    }
}

module.exports = P1Device
