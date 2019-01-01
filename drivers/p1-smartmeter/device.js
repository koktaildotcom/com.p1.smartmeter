
const Homey = require('homey');

class P1Device extends Homey.Device {
    onInit () {
        const device = this;
        Homey.on('update.data', function (data) {

            console.log(data);

            let gasCurrent = 0;
            let gasNew = 0;
            let gasChange = 0;

            if (data.gas) {
                if (data.gas.reading) {
                    gasNew = Number(data.gas.reading);
                }

                gasCurrent = Number(device.getCapabilityValue('meter_gas.consumed'));
                gasChange = (gasNew - gasCurrent);
            }

            device.setCapabilityValue('meter_gas.consumed', data.gas.reading);
            device.setCapabilityValue('meter_gas.measure', gasChange);
            device.setCapabilityValue('measure_power.consumed', data.electricity.received.actual.reading * 1000);
            device.setCapabilityValue('measure_power.generated', data.electricity.delivered.actual.reading * 1000);
            device.setCapabilityValue('meter_power.consumed', data.electricity.received.tariff1.reading + data.electricity.received.tariff2.reading);
            device.setCapabilityValue('meter_power.generated', data.electricity.delivered.tariff1.reading + data.electricity.delivered.tariff2.reading);
        });
    }
}

module.exports = P1Device