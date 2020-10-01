'use strict';

const Homey = require('homey');

module.exports = class P1Driver extends Homey.Driver {

  onInit() {
    this._flowTriggers = [];
    this.registerFlowCards();
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

  handleNewReadings(device, data) {
    console.log(`handling new readings for ${this.getName()}`);
    // gas readings from device
    let meterGas = this.meters.lastMeterGas;
    let measureGas = this.meters.lastMeasureGas;
    let meterGasTm = this.meters.lastMeterGasTm;

    if (data.hasOwnProperty('gas') && data.gas) {
      meterGas = data.gas.reading; // gas_cumulative_meter
      meterGasTm = Date.now() / 1000; // gas_meter_timestamp
      // constructed gas readings
      if (this.meters.lastMeterGas !== meterGas) {
        if (this.meters.lastMeterGas !== null) {
          // first reading after init in hrs
          let hoursPassed = (meterGasTm - this.meters.lastMeterGasTm) / 3600;
          // too long ago; assume 1 hour interval
          if (hoursPassed > 1) {
            hoursPassed = 1;
          }
          // gas_interval_meter
          measureGas = Math.round(1000 * ((meterGas - this.meters.lastMeterGas) / hoursPassed)) / 1000;
        }
        this.meters.lastMeterGasTm = meterGasTm;
      }
    }

    if (data.hasOwnProperty('electricity') && data.electricity) {
      // electricity readings from device
      const meterPowerPeak = data.electricity.received.tariff2.reading;
      const meterPowerOffpeak = data.electricity.received.tariff1.reading;

      const meterPowerPeakProduced = data.electricity.delivered.tariff2.reading;
      const meterPowerOffpeakProduced = data.electricity.delivered.tariff1.reading;

      const measurePowerConsumed = this.round(
        (data.electricity.instantaneous.power.positive.L1.reading
          + data.electricity.instantaneous.power.positive.L2.reading
          + data.electricity.instantaneous.power.positive.L3.reading) * 1000,
      );

      const lastMeasurePowerProduced = this.round(
        (data.electricity.instantaneous.power.negative.L1.reading
          + data.electricity.instantaneous.power.negative.L2.reading
          + data.electricity.instantaneous.power.negative.L3.reading) * 1000,
      );

      const measurePower = measurePowerConsumed - lastMeasurePowerProduced;

      const measurePowerAvg = this.meters.lastMeasurePowerAvg;
      const meterPowerTm = Date.now() / 1000; // readings.tm;

      // constructed electricity readings
      const meterPower = (meterPowerOffpeak + meterPowerPeak) - (meterPowerOffpeakProduced + meterPowerPeakProduced);

      const offPeak = this.round(data.electricity.tariffIndicator) === 1;
      const measurePowerDelta = (measurePower - this.meters.lastMeasurePower);

      if (offPeak !== this.meters.lastOffpeak) {
        const tokens = {
          tariff: offPeak,
        };
        device.triggerChangedFlow('meter_tariff.changed', tokens);
      }

      if (measurePower !== this.meters.lastMeasurePower) {
        const tokens = {
          power: measurePower,
          power_delta: measurePowerDelta,
        };
        device.triggerChangedFlow('power.changed', tokens);
      }

      // store the new readings in memory
      this.meters.lastMeasureGas = measureGas;
      this.meters.lastMeterGas = meterGas;
      this.meters.lastMeterGasTm = meterGasTm;

      this.meters.lastMeasurePower = measurePower;
      this.meters.lastMeasurePowerConsumed = measurePowerConsumed;
      this.meters.lastMeasurePowerProduced = lastMeasurePowerProduced;
      this.meters.lastMeasurePowerAvg = measurePowerAvg;
      this.meters.lastMeterPower = meterPower;
      this.meters.lastMeterPowerPeak = meterPowerPeak;
      this.meters.lastMeterPowerOffpeak = meterPowerOffpeak;
      this.meters.lastMeterPowerPeakProduced = meterPowerPeakProduced;
      this.meters.lastMeterPowerOffpeakProduced = meterPowerOffpeakProduced;
      this.meters.lastMeterPowerTm = meterPowerTm;
      this.meters.lastOffpeak = offPeak;
    }

    // update the device state
    this.updateDeviceState();
  }

  registerFlowCards() {
    const triggers = [
      'power.changed',
      'meter_tariff.changed',
    ];

    for (const trigger of triggers) {
      this._flowTriggers[trigger] = this.homey.flow.getDeviceTriggerCard(trigger);
    }
  }

  round(number) {
    return Math.round(number * 100) / 100;
  }

};
