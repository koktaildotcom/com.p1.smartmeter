const Homey = require('homey');

class P1Driver extends Homey.Driver {

    onInit() {
        this._flowTriggers = [];
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
        let triggers = [
            'measure_power.consumed.changed',
            'meter_power.consumed.changed',
            'measure_power.generated.changed',
            'meter_power.generated.changed',
            'meter_gas.measure.changed',
            'meter_gas.consumed.changed'
        ];

        for (var i in triggers) {
            this._flowTriggers[triggers[i]] = new Homey.FlowCardTriggerDevice(triggers[i]).register();
        }
    }

    triggerChangedFlow(triggerName, device, tokens, state) {
        this._flowTriggers[triggerName]
            .trigger(device, tokens, state)
            .then(this.log)
            .catch(this.error);
    }

    triggerMeasurePowerConsumedChangedFlow(device, tokens, state) {
        this.triggerChangedFlow('measure_power.consumed.changed', device, tokens, state);
    }

    triggerMeterPowerConsumedChangedFlow(device, tokens, state) {
        this.triggerChangedFlow('meter_power.consumed.changed', device, tokens, state);
    }

    triggerMeasurePowerGeneratedChangedFlow(device, tokens, state) {
        this.triggerChangedFlow('measure_power.generated.changed', device, tokens, state);
    }

    triggerMeterPowerGeneratedChangedFlow(device, tokens, state) {
        this.triggerChangedFlow('meter_power.generated.changed', device, tokens, state);
    }

    triggerMeasureGasChangedFlow(device, tokens, state) {
        this.triggerChangedFlow('meter_gas.measure.changed', device, tokens, state);
    }

    triggerMeterGasChangedFlow(device, tokens, state) {
        this.triggerChangedFlow('meter_gas.consumed.changed', device, tokens, state);
    }
}

module.exports = P1Driver;