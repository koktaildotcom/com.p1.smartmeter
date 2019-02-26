const Homey = require('homey');

class P1Driver extends Homey.Driver {

    onInit() {
        this.registerFlowCards();
    }

    onPairListDevices(data, callback) {
        let devices = [
            {
                "name": "P1 smart meter",
                "data": {
                    "id": "p1-smartmeter"
                },
            },
        ];
        callback(null, devices);
    }

    registerFlowCards() {
        this._flowTriggerMeasurePowerConsumedChanged = new Homey.FlowCardTriggerDevice('measure_power.consumed.changed')
            .register()
        this._flowTriggerMeterPowerConsumedChanged = new Homey.FlowCardTriggerDevice('meter_power.consumed.changed')
            .register()
    }

    triggerMeasurePowerConsumedChangedFlow(device, tokens, state) {
        this._flowTriggerMeasurePowerConsumedChanged
            .trigger(device, tokens, state)
            .then(this.log)
            .catch(this.error)
    }

    triggerMeterPowerConsumedChangedFlow(device, tokens, state) {
        this._flowTriggerMeterPowerConsumedChanged
            .trigger(device, tokens, state)
            .then(this.log)
            .catch(this.error)
    }
}

module.exports = P1Driver;