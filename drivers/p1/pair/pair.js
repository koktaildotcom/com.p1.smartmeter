function pair() {
  const deviceName = $('#deviceName').val();

  Homey.showLoadingOverlay();

  const hasOffPeak = $('#includeOffPeak').prop('checked');
  const hasProduction = $('#includeProduction').prop('checked');
  const hasGas = $('#includeGas').prop('checked');

  if (deviceName !== '') {
    const device = {
      name: deviceName,
      data: { id: 'p1' },
      settings: {
        include_gas: hasGas,
        include_off_peak: hasOffPeak,
        include_production: hasProduction,
      },
      capabilities: [],
    };

    if (hasGas) {
      device.capabilities.push('measure_gas');
      device.capabilities.push('meter_gas');
    }
    device.capabilities.push('measure_power');
    if (hasProduction) {
      device.capabilities.push('measure_power.consumed');
      device.capabilities.push('measure_power.produced');
    }
    device.capabilities.push('meter_power');
    if (hasOffPeak) {
      device.capabilities.push('meter_power.peak');
      device.capabilities.push('meter_power.offPeak');
    }
    if (hasProduction) {
      device.capabilities.push('meter_power.producedPeak');
    }
    if (hasProduction && hasOffPeak) {
      device.capabilities.push('meter_power.producedOffPeak');
    }
    if (hasOffPeak) {
      device.capabilities.push('meter_offpeak');
    }
    Homey.createDevice(device)
      .then(() => {
        Homey.hideLoadingOverlay();
        Homey.done();
      })
      .catch(err => {
        Homey.hideLoadingOverlay();
        Homey.alert(err);
      });
  } else {
    Homey.alert(__('pair.required'), 'error');
  }
}
