const Homey = require('homey');

class P1Driver extends Homey.Driver {

    onInit() {
        this._flowTriggers = [];
        this._flowTriggeredAt = [];
        this._flowTriggerTimeouts = [];
        this.registerFlowCards();
        this.loadFlowTriggerTimeouts();
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

    loadFlowTriggerTimeouts() {
        let timeoutSettings = [
            'measure_power.consumed.changed',
            'meter_power.consumed.changed',
            'measure_power.generated.changed',
            'meter_power.generated.changed',
            'meter_gas.measure.changed',
            'meter_gas.consumed.changed'
        ];

        for (var i in timeoutSettings) {
            let timeout = Number(Homey.ManagerSettings.get(timeoutSettings[i].replace('changed', 'timeout')));

            if (timeout !== null) {
                this._flowTriggerTimeouts[timeoutSettings[i]] = timeout;
            } else {
                this._flowTriggerTimeouts[timeoutSettings[i]] = 1;
            }
        }

        console.log('Loaded settings', this._flowTriggerTimeouts);

        let driver = this;

        Homey.ManagerSettings.on('set', function (key) {
            console.log('Setting "' + key + '" updated to "' + Homey.ManagerSettings.get(key) + '"');
            driver._flowTriggerTimeouts[key.replace('timeout', 'changed')] = Homey.ManagerSettings.get(key);
        });
    }

    getFlowTriggerTimeout(triggerName) {
        if (triggerName in this._flowTriggerTimeouts) {
            return this._flowTriggerTimeouts[triggerName];
        }

        throw new Error('timeout setting not found by key "' + triggerName + '"');
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

        for (let i in triggers) {
            this._flowTriggers[triggers[i]] = new Homey.FlowCardTriggerDevice(triggers[i]).register();
        }
    }

    triggerChangedFlow(triggerName, device, tokens, state) {
        if (triggerName in this._flowTriggers && this.shouldTriggerFlow(triggerName)) {
            this._flowTriggers[triggerName]
                .trigger(device, tokens, state)
                .then(this.log)
                .catch(this.error);

            this.updateFlowTriggeredAt(triggerName);
        }
    }

    updateFlowTriggeredAt(triggerName) {
        this._flowTriggeredAt[triggerName] = new Date();
    }

    shouldTriggerFlow(triggerName) {
        let lastTriggeredAt = this._flowTriggeredAt[triggerName];

        if (typeof lastTriggeredAt === 'undefined') {
            return true;
        }

        let timeoutInSeconds = this.getFlowTriggerTimeout(triggerName),
            shouldNotRunBefore = new Date(lastTriggeredAt.getTime() + Number(timeoutInSeconds)),
            now = new Date();

        return shouldNotRunBefore < now;
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