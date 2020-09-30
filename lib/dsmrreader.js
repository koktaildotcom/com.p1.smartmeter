'use strict';

const parser = require('node-dsmr/lib/parser');

class DsmrReader {

  parseData(body) {
    const outputArray = body.telegram.split('\n');
    const output = parser(outputArray);

    const data = {
      meterType: output.meterModel,
      version: output.dsmrVersion,
      timestamp: output.dsmrVersion,
    };

    if (output.power) {
      data.electricity = {
        received: {
          tariff1: {
            reading: output.power.totalConsumed1,
            unit: 'kWh',
          },
          tariff2: {
            reading: output.power.totalConsumed2,
            unit: 'kWh',
          },
          actual: {
            reading: output.power.actualConsumed,
            unit: 'kW',
          },
        },
        delivered: {
          tariff1: {
            reading: output.power.totalProduced1,
            unit: 'kWh',
          },
          tariff2: {
            reading: output.power.totalProduced2,
            unit: 'kWh',
          },
          actual: {
            reading: output.power.actualProduced,
            unit: 'kW',
          },
        },
        tariffIndicator: output.power.activeTariff,
        switchPosition: output.power.switchPosition,
        voltageSags: {
          L1: output.power.voltageSagsL1,
          L2: output.power.voltageSagsL2,
          L3: output.power.voltageSagsL3,
        },
        voltageSwell: {
          L1: output.power.voltageSwellsL1,
          L2: output.power.voltageSwellsL2,
          L3: output.power.voltageSwellsL3,
        },
        instantaneous: {
          current: {
            L1: {
              reading: output.power.instantaneousCurrentL1,
              unit: 'A',
            },
            L2: {
              reading: output.power.instantaneousCurrentL2,
              unit: 'A',
            },
            L3: {
              reading: output.power.instantaneousCurrentL3,
              unit: 'A',
            },
          },
          power: {
            positive: {
              L1: {
                reading: output.power.instantaneousProducedElectricityL1,
                unit: 'kW',
              },
              L2: {
                reading: output.power.instantaneousProducedElectricityL2,
                unit: 'kW',
              },
              L3: {
                reading: output.power.instantaneousProducedElectricityL3,
                unit: 'kW',
              },
            },
            negative: {
              L1: {
                reading: output.power.instantaneousConsumedElectricityL1,
                unit: 'kW',
              },
              L2: {
                reading: output.power.instantaneousConsumedElectricityL2,
                unit: 'kW',
              },
              L3: {
                reading: output.power.instantaneousConsumedElectricityL3,
                unit: 'kW',
              },
            },
          },
        },
      };
    }

    if (output.gas) {
      data.gas = {
        deviceType: '003',
        equipmentId: output.gas.equipmentId,
        timestamp: output.gas.timestamp,
        reading: output.gas.totalConsumed,
        unit: 'm3',
        valvePosition: output.gas.valvePosition,
      };
    }

    return data;
  }

}

module.exports = DsmrReader;
