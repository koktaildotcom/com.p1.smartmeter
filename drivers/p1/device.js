'use strict';

const Homey = require('homey');

class P1Device extends Homey.Device {

  onInit() {
    console.log('P1 Device ready');
    this.settings = this.getSettings();
    this.meters = {};
    this.initMeters();

    this.registerEventListeners();
  }

  registerEventListeners() {
    this.homey.on('update.data', data => {
      this.getDriver().handleNewReadings(this, data);
    });
  }

  initMeters() {
    this.meters = {
      lastMeasureGas: 0, // 'measureGas' (m3)
      lastMeterGas: null, // 'meterGas' (m3)
      // lastMeterGasTm: 0,// timestamp of gas meter reading, e.g. 1514394325
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
  }

  async tryToAddCapability(capability) {
    return this.addCapability(capability);
  }

  async tryToRemoveCapability(capability) {
    return this.removeCapability(capability);
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
        console.log(`Setting ${key} with value ${value}`);
      })
      .catch(error => {
        console.error(`Setting ${key} with value ${value} gives an error:${error.message}`);
      });
  }

  /**
   * Update the state
   */
  updateDeviceState() {
    try {
      if (this.settings.include_gas) {
        this.setDeviceCapabilityValue('measure_gas', this.meters.lastMeasureGas);
        this.setDeviceCapabilityValue('meter_gas', this.meters.lastMeterGas);
      }
      this.setDeviceCapabilityValue('measure_power', this.meters.lastMeasurePower);
      this.setDeviceCapabilityValue('measure_power.consumed', this.meters.lastMeasurePowerConsumed);
      this.setDeviceCapabilityValue('meter_power', this.meters.lastMeterPower);
      if (this.settings.include_production) {
        this.setDeviceCapabilityValue('measure_power.produced', this.meters.lastMeasurePowerProduced);
        this.setDeviceCapabilityValue('meter_power.producedPeak', this.meters.lastMeterPowerPeakProduced);
        if (this.settings.include_off_peak) {
          this.setDeviceCapabilityValue('meter_power.producedOffPeak', this.meters.lastMeterPowerOffpeakProduced);
        }
      }
      if (this.settings.include_off_peak) {
        this.setDeviceCapabilityValue('meter_power.peak', this.meters.lastMeterPowerPeak);
        this.setDeviceCapabilityValue('meter_power.offPeak', this.meters.lastMeterPowerOffpeak);
        this.setDeviceCapabilityValue('meter_offpeak', this.meters.lastOffpeak);
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

}

module.exports = P1Device;
