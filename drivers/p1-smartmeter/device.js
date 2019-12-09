const Homey = require('homey');

class P1Device extends Homey.Device {

    round(number) {
        return Math.round(number * 100) / 100
    }

    onInit() {
        let device = this;
        device._driver = this.getDriver();
        device.registerEventListeners(device);

        if (!device.hasCapability('measure_power')) {
            device.addCapability('measure_power')
        }
    }

    registerEventListeners(device) {
        Homey.on('update.data', function (data) {
            device.processData(data);
        });
    }

    processData(data) {
        let device = this;
        let now = new Date();
        let update = device.getSetting('meter_gas_update_date');
        let updateDate = null;

        if (null === update) {
            updateDate = new Date();
            device.setSettings({
                meter_gas_update_date: updateDate.getTime()
            });
        } else {
            // if not yet set update the setting
            updateDate = new Date(update);
        }

        if (updateDate < new Date(now.getTime() - (1000 * 60 * 60))) {
            let gasCurrent = 0;
            let gasNew = 0;
            let gasChange = 0;
            if (data.hasOwnProperty('gas')) {
                if (data.gas.reading) {
                    gasNew = Number(data.gas.reading) * 1000;
                }
                gasCurrent = Number(device.getCapabilityValue('meter_gas.consumed')) * 1000;

                gasChange = (gasNew - gasCurrent) / 1000;

                if (gasChange > 0) {
                    device.updateCapabilityValue('meter_gas.measure', gasChange);

                    device.setSettings({
                        meter_gas_update_date: now.getTime()
                    });
                }
            }
        }

        if (data.hasOwnProperty('electricity')) {
        let measurePowerConsumed = device.round(data.electricity.received.actual.reading * 1000),
            measurePowerGenerated = device.round(data.electricity.delivered.actual.reading * 1000),
            measurePower = measurePowerConsumed - measurePowerGenerated,
            meterGasConsumed = device.round(data.gas.reading),
            meterPowerConsumed = device.round(data.electricity.received.tariff1.reading + data.electricity.received.tariff2.reading),
            meterPowerGenerated = device.round(data.electricity.delivered.tariff1.reading + data.electricity.delivered.tariff2.reading);

            device.updateCapabilityValue('measure_power', measurePower);
            device.updateCapabilityValue('meter_gas.consumed', meterGasConsumed);
            device.updateCapabilityValue('measure_power.consumed', measurePowerConsumed);
            device.updateCapabilityValue('measure_power.generated', measurePowerGenerated);
            device.updateCapabilityValue('meter_power.consumed', meterPowerConsumed);
            device.updateCapabilityValue('meter_power.generated', meterPowerGenerated);
        }
    }

    updateCapabilityValue(capability, value) {
        let device = this,
            currentValue = device.getCapabilityValue(capability);

        device.setCapabilityValue(capability, value);

        if (value !== currentValue) {
            switch (capability) {
                case 'measure_power':
                    device._driver.triggerMeasurePowerConsumedChangedFlow(device, {
                        "measure_power": value
                    });
                    break;
                case 'measure_power.consumed':
                    device._driver.triggerMeasurePowerConsumedChangedFlow(device, {
                        "measure_power.consumed": value
                    });
                    break;
                case 'meter_power.consumed':
                    device._driver.triggerMeterPowerConsumedChangedFlow(device, {
                        "meter_power.consumed": value
                    });
                    break;
                case 'measure_power.generated':
                    device._driver.triggerMeasurePowerGeneratedChangedFlow(device, {
                        "measure_power.generated": value
                    });
                    break;
                case 'meter_power.generated':
                    device._driver.triggerMeterPowerGeneratedChangedFlow(device, {
                        "meter_power.generated": value
                    });
                    break;
                case 'meter_gas.measure':
                    device._driver.triggerMeasureGasChangedFlow(device, {
                        "meter_gas.measure": value
                    });
                    break;
                case 'meter_gas.consumed':
                    device._driver.triggerMeterGasChangedFlow(device, {
                        "meter_gas.consumed": value
                    });
                    break;
            }
        }
    }
}

module.exports = P1Device