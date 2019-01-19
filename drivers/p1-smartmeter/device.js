
const Homey = require('homey');

class P1Device extends Homey.Device {

    round (number) {
        return Math.round(number * 100) / 100
    }

    onInit () {
        const device = this;
        Homey.on('update.data', function (data) {

            let now = new Date();
            let update = device.getSetting('meter_gas_update_date');

            // if not yet set update the setting
            if (null === update) {
                update = new Date();
                device.setSettings({
                    meter_gas_update_date: update
                });
            }

            // add an hour
            update.setTime(update.getTime() + (1 * 60 * 60 * 1000));

            let gasCurrent = 0;
            let gasNew = 0;
            let gasChange = 0;

            if (update <= now) {
                if (data.gas) {
                    if (data.gas.reading) {
                        gasNew = Number(data.gas.reading);
                    }

                    gasCurrent = Number(device.getCapabilityValue('meter_gas.consumed'));
                    gasChange = (gasNew - gasCurrent);
                }

                device.setCapabilityValue('meter_gas.measure', gasChange);
            }

            device.setCapabilityValue('meter_gas.consumed', device.round(data.gas.reading));
            device.setCapabilityValue('measure_power.consumed', device.round(data.electricity.received.actual.reading * 1000));
            device.setCapabilityValue('measure_power.generated', device.round(data.electricity.delivered.actual.reading * 1000));
            device.setCapabilityValue('meter_power.consumed', device.round(data.electricity.received.tariff1.reading + data.electricity.received.tariff2.reading));
            device.setCapabilityValue('meter_power.generated', device.round(data.electricity.delivered.tariff1.reading + data.electricity.delivered.tariff2.reading));
        });
    }
}

module.exports = P1Device