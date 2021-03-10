'use strict';

const Homey = require('homey');

class P1Device extends Homey.Device {

  async onInit() {
    console.log('P1 Device ready');

    await this.checkCapabilities(await this.getSettings());

    this.meters = {
      lastMeasureGas: 0, // 'measureGas' (m3)
      lastMeterGasTm: 0, // timestamp of gas meter reading, e.g. 1514394325
      lastMeterGas: null, // 'meterGas' (m3)
      lastMeasurePower: 0, // 'measurePower' (W) (consumed - produced)
      lastMeasurePowerConsumed: 0, // 'measure_power.consumed' (W)
      lastMeasurePowerProduced: 0, // 'measure_power.produced' (W)
      lastMeasurePowerAvg: 0, // '2 minute average measurePower' (kWh)
      lastMeterPower: null, // 'meterPower' (kWh)
      lastMeterPowerPeak: null, // 'meterPower_peak' (kWh)
      lastMeterPowerOffpeak: null, // 'meterPower_offpeak' (kWh)
      lastMeterPowerPeakProduced: null, // 'meterPower_peak_produced' (kWh)
      lastMeterPowerOffpeakProduced: null, // 'meterPower_offpeak_produced' (kWh)
      lastMeterPowerTm: null, // timestamp epoch, e.g. 1514394325
      lastMeterPowerInterval: null, // 'meterPower' at last interval (kWh)
      lastMeterPowerIntervalTm: null, // timestamp epoch, e.g. 1514394325
      lastOffpeak: null, // 'meterPower_offpeak' (true/false)
    };

    this.registerEventListeners();
  }

  registerEventListeners() {
    this.homey.on('update.data', data => {
      this.handleNewReadings(this.meters, data);
    });
  }

  async tryToAddCapability(capability) {
    if (!this.hasCapability(capability)) {
      return this.addCapability(capability);
    }

    return Promise.resolve();
  }

  async tryToRemoveCapability(capability) {
    if (this.hasCapability(capability)) {
      return this.removeCapability(capability);
    }

    return Promise.resolve();
  }

  async handleNewReadings(current, data) {
    if (Object.prototype.hasOwnProperty.call(data, 'meterType')) {
      await this.updateSetting({ model: data.meterType });
    }

    if (Object.prototype.hasOwnProperty.call(data, 'gas') && data.gas) {
      let measureGas = current.lastMeasureGas;

      if (Object.prototype.hasOwnProperty.call(data.gas, 'reportedPeriod')) {
        // Calculate average gas per hour over reportedPeriod
        const timeDiffSeconds = data.gas.timestamp - current.lastMeterGasTm;
        if (timeDiffSeconds >= data.gas.reportedPeriod * 60) {
          if (this.meters.lastMeterGas !== null) {
            const gasDiff = data.gas.reading - this.meters.lastMeterGas;
            measureGas = (gasDiff / timeDiffSeconds) * 3600;
            measureGas = Math.round(1000 * measureGas) / 1000;
          }
          current.lastMeterGasTm = data.gas.timestamp;
        }
      } else {
        const meterGas = data.gas.reading; // gas_cumulative_meter
        const meterGasTm = Date.now() / 1000; // gas_meter_timestamp
        // constructed gas readings
        if (current.lastMeterGas !== meterGas) {
          if (current.lastMeterGas !== null) {
            // first reading after init in hrs
            let hoursPassed = (meterGasTm - current.lastMeterGasTm) / 3600;
            // too long ago; assume 1 hour interval
            if (hoursPassed > 1) {
              hoursPassed = 1;
            }
            // gas_interval_meter
            const measureGasRaw = ((meterGas - current.lastMeterGas) / hoursPassed);
            measureGas = Math.round(1000 * measureGasRaw) / 1000;
          }
          current.lastMeterGasTm = meterGasTm;
        }
      }
      current.lastMeterGas = data.gas.reading;
      current.lastMeasureGas = measureGas;
    }

    if (Object.prototype.hasOwnProperty.call(data, 'electricity') && data.electricity) {
      // electricity readings from device
      const meterPowerPeak = data.electricity.received.tariff2.reading;
      const meterPowerOffpeak = data.electricity.received.tariff1.reading;

      const meterPowerPeakProduced = data.electricity.delivered.tariff2.reading;
      const meterPowerOffpeakProduced = data.electricity.delivered.tariff1.reading;

      let positiveL1 = 0;
      let positiveL2 = 0;
      let positiveL3 = 0;
      let negativeL1 = 0;
      let negativeL2 = 0;
      let negativeL3 = 0;

      if (Object.prototype.hasOwnProperty.call(data.electricity.instantaneous.power.positive, 'L1')) {
        positiveL1 = data.electricity.instantaneous.power.positive.L1.reading;
      }
      if (Object.prototype.hasOwnProperty.call(data.electricity.instantaneous.power.positive, 'L2')) {
        positiveL2 = data.electricity.instantaneous.power.positive.L2.reading;
      }
      if (Object.prototype.hasOwnProperty.call(data.electricity.instantaneous.power.positive, 'L3')) {
        positiveL3 = data.electricity.instantaneous.power.positive.L3.reading;
      }

      if (Object.prototype.hasOwnProperty.call(data.electricity.instantaneous.power.negative, 'L1')) {
        negativeL1 = data.electricity.instantaneous.power.negative.L1.reading;
      }
      if (Object.prototype.hasOwnProperty.call(data.electricity.instantaneous.power.negative, 'L2')) {
        negativeL2 = data.electricity.instantaneous.power.negative.L2.reading;
      }
      if (Object.prototype.hasOwnProperty.call(data.electricity.instantaneous.power.negative, 'L3')) {
        negativeL3 = data.electricity.instantaneous.power.negative.L3.reading;
      }

      const measurePowerConsumed = this.round(
        (positiveL1 + positiveL2 + positiveL3) * 1000,
      );

      const lastMeasurePowerProduced = this.round(
        (negativeL1 + negativeL2 + negativeL3) * 1000,
      );

      const measurePower = measurePowerConsumed - lastMeasurePowerProduced;

      const measurePowerAvg = current.lastMeasurePowerAvg;
      const meterPowerTm = Date.now() / 1000; // readings.tm;

      // constructed electricity readings
      const meterPowerTotal = (meterPowerOffpeak + meterPowerPeak);
      const meterPowerProducedTotal = (meterPowerOffpeakProduced + meterPowerPeakProduced);
      const meterPower = meterPowerTotal + meterPowerProducedTotal;

      const offPeak = this.round(data.electricity.tariffIndicator) === 1;
      const measurePowerDelta = (measurePower - current.lastMeasurePower);

      if (offPeak !== current.lastOffpeak) {
        const tokens = {
          tariff: offPeak,
        };
        this.triggerChangedFlow('meter_tariff.changed', tokens);
      }

      if (measurePower !== current.lastMeasurePower) {
        const tokens = {
          power: measurePower,
          power_delta: measurePowerDelta,
        };
        this.triggerChangedFlow('power.changed', tokens);
      }

      // store the new readings in memory
      current.lastMeasurePower = measurePower;
      current.lastMeasurePowerConsumed = measurePowerConsumed;
      current.lastMeasurePowerProduced = lastMeasurePowerProduced;
      current.lastMeasurePowerAvg = measurePowerAvg;
      current.lastMeterPower = meterPower;
      current.lastMeterPowerPeak = meterPowerPeak;
      current.lastMeterPowerOffpeak = meterPowerOffpeak;
      current.lastMeterPowerPeakProduced = meterPowerPeakProduced;
      current.lastMeterPowerOffpeakProduced = meterPowerOffpeakProduced;
      current.lastMeterPowerTm = meterPowerTm;
      current.lastOffpeak = offPeak;
    }

    // update the device state
    await this.updateDeviceState(current);
  }

  /**
   *  this method is called when the user has changed the device's settings in Homey.
   */
  async onSettings({ oldSettings, newSettings, changedKeys }) {
    await this.checkCapabilities(newSettings);
  }

  async checkCapabilities(settings) {
    if (settings.include_gas) {
      await this.tryToAddCapability('measure_gas');
      await this.tryToAddCapability('meter_gas');
    } else {
      await this.tryToRemoveCapability('measure_gas');
      await this.tryToRemoveCapability('meter_gas');
    }

    if (settings.include_production) {
      await this.tryToAddCapability('measure_power.consumed');
      await this.tryToAddCapability('measure_power.produced');
      await this.tryToAddCapability('meter_power.producedPeak');
      if (settings.include_off_peak) {
        await this.tryToAddCapability(
          'meter_power.producedOffPeak',
        );
      } else {
        await this.tryToRemoveCapability(
          'meter_power.producedOffPeak',
        );
      }
    } else {
      await this.tryToRemoveCapability('measure_power.consumed');
      await this.tryToRemoveCapability('measure_power.produced');
      await this.tryToRemoveCapability('meter_power.producedPeak');
      await this.tryToRemoveCapability(
        'meter_power.producedOffPeak',
      );
    }

    if (settings.include_off_peak) {
      await this.tryToAddCapability('meter_power.peak');
      await this.tryToAddCapability('meter_power.offPeak');
      if (settings.include_production) {
        await this.tryToAddCapability(
          'meter_power.producedOffPeak',
        );
      } else {
        await this.tryToRemoveCapability(
          'meter_power.producedOffPeak',
        );
      }
      await this.tryToAddCapability('meter_offpeak');
    } else {
      await this.tryToRemoveCapability('meter_power.peak');
      await this.tryToRemoveCapability('meter_power.offPeak');
      await this.tryToRemoveCapability(
        'meter_power.producedOffPeak',
      );
      await this.tryToRemoveCapability('meter_offpeak');
    }
  }

  /**
   * Set the CapabilityValue
   *
   * @param key
   * @param value
   */
  setDeviceCapabilityValue(key, value) {
    this.setCapabilityValue(key, value)
      .then(() => {
        console.log(`Setting ${key} with value ${value}`);
      })
      .catch(error => {
        console.error(`Setting ${key} with value ${value} gives an error:${error.message}`);
      });
  }

  /**
   * Update the state
   */
  async updateDeviceState(data) {
    try {
      if (await this.getSetting('include_gas')) {
        this.setDeviceCapabilityValue('measure_gas', data.lastMeasureGas);
        this.setDeviceCapabilityValue('meter_gas', data.lastMeterGas);
      }
      this.setDeviceCapabilityValue('measure_power', data.lastMeasurePower);
      this.setDeviceCapabilityValue('measure_power.consumed', data.lastMeasurePowerConsumed);
      this.setDeviceCapabilityValue('meter_power', data.lastMeterPower);
      if (await this.getSetting('include_production')) {
        this.setDeviceCapabilityValue('measure_power.produced', data.lastMeasurePowerProduced);
        this.setDeviceCapabilityValue('meter_power.producedPeak', data.lastMeterPowerPeakProduced);
        if (await this.getSetting('include_off_peak')) {
          this.setDeviceCapabilityValue('meter_power.producedOffPeak', data.lastMeterPowerOffpeakProduced);
        }
      }
      if (await this.getSetting('include_off_peak')) {
        this.setDeviceCapabilityValue('meter_power.peak', data.lastMeterPowerPeak);
        this.setDeviceCapabilityValue('meter_power.offPeak', data.lastMeterPowerOffpeak);
        this.setDeviceCapabilityValue('meter_offpeak', data.lastOffpeak);
      }
    } catch (error) {
      this.error(error);
    }
  }

  triggerChangedFlow(triggerName, tokens) {
    this.driver.ready().then(() => {
      const triggers = this.driver._flowTriggers;
      if (triggerName in triggers) {
        triggers[triggerName].trigger(this, tokens).then(() => {
          console.log(`triggered ${triggerName} with success!`);
        }).catch(error => {
          console.log(`triggered ${triggerName} failed: ${error}`);
        });
      }
    });
  }

  round(number) {
    return Math.round(number * 100) / 100;
  }

  async updateSetting(setting) {
    const settings = await this.getSettings();
    return this.setSettings({ ...settings, ...setting });
  }

}

module.exports = P1Device;
