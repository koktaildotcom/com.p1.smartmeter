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

};
