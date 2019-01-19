
const Homey = require('homey');

Date.prototype.addHours = function(h) {
    this.setTime(this.getTime() + (h*60*60*1000));
    return this;
}

class P1Device extends Homey.Device {
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

            update.addHours(1);

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

            device.setCapabilityValue('meter_gas.consumed', data.gas.reading);
            device.setCapabilityValue('measure_power.consumed', data.electricity.received.actual.reading * 1000);
            device.setCapabilityValue('measure_power.generated', data.electricity.delivered.actual.reading * 1000);
            device.setCapabilityValue('meter_power.consumed', data.electricity.received.tariff1.reading + data.electricity.received.tariff2.reading);
            device.setCapabilityValue('meter_power.generated', data.electricity.delivered.tariff1.reading + data.electricity.delivered.tariff2.reading);
        });
    }
}

module.exports = P1Device