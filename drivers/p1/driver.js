'use strict';

const Homey = require('homey');

module.exports = class P1Driver extends Homey.Driver {

  onInit() {
    console.log('P1 Driver ready');
    this._flowTriggers = [];
    const triggers = [
      'power.changed',
      'meter_tariff.changed',
    ];

    for (const trigger of triggers) {
      this._flowTriggers[trigger] = this.homey.flow.getDeviceTriggerCard(trigger);
    }
  }

  onPair(session) {
    session.on('validate', async (data, callback) => {
      try {
        console.log('save button pressed in frontend');
        const { name } = data;
        const hasGas = data.includeGas;
        const hasOffPeak = data.includeOffPeak;
        const hasProduction = data.includeProduction;
        const device = {
          name,
          data: { id: 'p1' },
          settings: {
            include_gas: hasGas,
            include_off_peak: hasOffPeak,
            include_production: hasProduction,
          },
          capabilities: [],
        };
        if (data.includeGas) {
          device.capabilities.push('measure_gas');
          device.capabilities.push('meter_gas');
        }
        device.capabilities.push('measure_power');
        if (data.includeProduction) {
          device.capabilities.push('measure_power.consumed');
          device.capabilities.push('measure_power.produced');
        }
        device.capabilities.push('meter_power');
        if (data.includeOffPeak) {
          device.capabilities.push('meter_power.peak');
          device.capabilities.push('meter_power.offPeak');
        }
        if (data.includeProduction) {
          device.capabilities.push('meter_power.producedPeak');
        }
        if (data.includeProduction && data.includeOffPeak) {
          device.capabilities.push('meter_power.producedOffPeak');
        }
        if (data.includeOffPeak) {
          device.capabilities.push('meter_offpeak');
        }
        callback(null, JSON.stringify(device)); // report success to frontend
      } catch (error) {
        this.error('Pair error', error);
        callback(error);
      }
    });
  }

};
