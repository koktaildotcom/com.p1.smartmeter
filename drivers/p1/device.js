'use strict';

const Homey = require('homey');

class P1Device extends Homey.Device {

  onInit() {
    console.log('P1 Device ready');
    this.settings = this.getSettings();
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
    return this.addCapability(capability);
  }

  async tryToRemoveCapability(capability) {
    return this.removeCapability(capability);
  }

  handleNewReadings(current, data) {
    console.log(`handling new readings for ${this.getName()}`);
    // gas readings from device
    let meterGas = current.lastMeterGas;
    let measureGas = current.lastMeasureGas;
    let meterGasTm = current.lastMeterGasTm;

    if (data.hasOwnProperty('gas') && data.gas) {
      meterGas = data.gas.reading; // gas_cumulative_meter
      meterGasTm = Date.now() / 1000; // gas_meter_timestamp
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
          measureGas = Math.round(1000 * ((meterGas - current.lastMeterGas) / hoursPassed)) / 1000;
        }
        current.lastMeterGasTm = meterGasTm;
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

      const measurePowerAvg = current.lastMeasurePowerAvg;
      const meterPowerTm = Date.now() / 1000; // readings.tm;

      // constructed electricity readings
      const meterPower = (meterPowerOffpeak + meterPowerPeak) - (meterPowerOffpeakProduced + meterPowerPeakProduced);

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
      current.lastMeasureGas = measureGas;
      current.lastMeterGas = meterGas;
      current.lastMeterGasTm = meterGasTm;

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
    this.updateDeviceState(current);
  }

  // this method is called when the user has changed the device's settings in Homey.
  async onSettings(oldSettingsObj, newSettingsObj, changedKeysArr) {
    this.log(
      `${this.getData().id} ${this.getName()} device settings changed`,
    );

    for (const key of changedKeysArr) {
      switch (key) {
        case 'include_gas':
          if (newSettingsObj.include_gas) {
            await this.tryToAddCapability('measure_gas');
            await this.tryToAddCapability('meter_gas');
          } else {
            await this.tryToAddCapability('measure_gas');
            await this.tryToAddCapability('meter_gas');
          }
          break;
        case 'include_production':
          if (newSettingsObj.include_production) {
            await this.tryToAddCapability('measure_power.consumed');
            await this.tryToAddCapability('measure_power.produced');
            await this.tryToAddCapability('meter_power.producedPeak');
            if (newSettingsObj.include_off_peak) {
              await this.tryToAddCapability(
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
          break;
        case 'include_off_peak':
          if (newSettingsObj.include_off_peak) {
            await this.tryToAddCapability('meter_power.peak');
            await this.tryToAddCapability('meter_power.offPeak');
            if (newSettingsObj.include_production) {
              await this.tryToAddCapability(
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
          break;
        default:
          break;
      }
    }

    this.log(newSettingsObj);
    this.settings = newSettingsObj;

    return Promise.resolve(true);
  }

  /**
   * Set the CapabilityValue
   * @param key
   * @param value
   */
  setDeviceCapabilityValue(key, value) {
    this.setCapabilityValue(key, value)
      .then(() => {
        // console.log(`Setting ${key} with value ${value}`);
      })
      .catch(error => {
        console.error(`Setting ${key} with value ${value} gives an error:${error.message}`);
      });
  }

  /**
   * Update the state
   */
  updateDeviceState(data) {
    try {
      if (this.settings.include_gas) {
        this.setDeviceCapabilityValue('measure_gas', data.lastMeasureGas);
        this.setDeviceCapabilityValue('meter_gas', data.lastMeterGas);
      }
      this.setDeviceCapabilityValue('measure_power', data.lastMeasurePower);
      this.setDeviceCapabilityValue('measure_power.consumed', data.lastMeasurePowerConsumed);
      this.setDeviceCapabilityValue('meter_power', data.lastMeterPower);
      if (this.settings.include_production) {
        this.setDeviceCapabilityValue('measure_power.produced', data.lastMeasurePowerProduced);
        this.setDeviceCapabilityValue('meter_power.producedPeak', data.lastMeterPowerPeakProduced);
        if (this.settings.include_off_peak) {
          this.setDeviceCapabilityValue('meter_power.producedOffPeak', data.lastMeterPowerOffpeakProduced);
        }
      }
      if (this.settings.include_off_peak) {
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

}

module.exports = P1Device;
