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

        for (const trigger of triggers) {
            this._flowTriggers[trigger] = new Homey.FlowCardTriggerDevice(trigger).register();
        }
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

    triggerMeasurePowerConsumedChangedFlow(device, tokens) {
        this.triggerChangedFlow('measure_power.consumed.changed', device, tokens);
    }

    triggerMeterPowerConsumedChangedFlow(device, tokens) {
        this.triggerChangedFlow('meter_power.consumed.changed', device, tokens);
    }

    triggerMeasurePowerGeneratedChangedFlow(device, tokens) {
        this.triggerChangedFlow('measure_power.generated.changed', device, tokens);
    }

    triggerMeterPowerGeneratedChangedFlow(device, tokens) {
        this.triggerChangedFlow('meter_power.generated.changed', device, tokens);
    }

    triggerMeasureGasChangedFlow(device, tokens) {
        this.triggerChangedFlow('meter_gas.measure.changed', device, tokens);
    }

    triggerMeterGasChangedFlow(device, tokens) {
        this.triggerChangedFlow('meter_gas.consumed.changed', device, tokens);
    }
}

module.exports = P1Driver;