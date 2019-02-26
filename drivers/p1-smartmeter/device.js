const Homey = require('homey');

class P1Device extends Homey.Device {

    round(number) {
        return Math.round(number * 100) / 100
    }

    onInit() {
        let device = this;
        device._driver = this.getDriver();
        device.registerEventListeners(device);
    }

    registerEventListeners(device) {
        Homey.on('update.data', function (data) {
            device.processData(data)
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
                meter_gas_update_date: updateDate.toISOString()
            });
        } else {
            // if not yet set update the setting
            updateDate = new Date(update);
        }

        let gasCurrent = 0;
        let gasNew = 0;
        let gasChange = 0;

        if (updateDate < new Date(now.getTime() - (1000 * 60 * 60))) {
            if (data.gas) {
                if (data.gas.reading) {
                    gasNew = Number(data.gas.reading);
                }

                gasCurrent = Number(device.getCapabilityValue('meter_gas.consumed'));
                gasChange = (gasNew - gasCurrent);
            }

            device.updateCapabilityValue('meter_gas.measure', gasChange);
        }

        device.updateCapabilityValue('meter_gas.consumed', device.round(data.gas.reading));
        device.updateCapabilityValue('measure_power.consumed', device.round(data.electricity.received.actual.reading * 1000));
        device.updateCapabilityValue('measure_power.generated', device.round(data.electricity.delivered.actual.reading * 1000));
        device.updateCapabilityValue('meter_power.consumed', device.round(data.electricity.received.tariff1.reading + data.electricity.received.tariff2.reading));
        device.updateCapabilityValue('meter_power.generated', device.round(data.electricity.delivered.tariff1.reading + data.electricity.delivered.tariff2.reading));
    }

    updateCapabilityValue(capability, value) {
        let device = this,
            state = {},
            currentValue = device.getCapabilityValue(capability);

        device.setCapabilityValue(capability, value);

        if (value !== currentValue) {
            switch (capability) {
                case 'measure_power.consumed':
                    device._driver.triggerMeasurePowerConsumedChangedFlow(device, {
                        "measure_power.consumed": value
                    }, state);
                    break;
                case 'meter_power.consumed':
                    device._driver.triggerMeterPowerConsumedChangedFlow(device, {
                        "meter_power.consumed": value
                    }, state);
                    break;
            }
        }
    }
}

module.exports = P1Device