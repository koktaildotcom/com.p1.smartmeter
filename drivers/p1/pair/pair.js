/* eslint-disable prefer-destructuring */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

const homeyIsV2 = typeof Homey.showLoadingOverlay === 'function';
Homey.setTitle(__('pair.titleAM550'));

if (!homeyIsV2) {
	Homey.showLoadingOverlay = () => {
		$('#applySettings').prop('disabled', true);
	};
	Homey.hideLoadingOverlay = () => {
		$('#applySettings').prop('disabled', false);
	};
}

function applySettings() {
	// variables
	const deviceName = $('#deviceName').val();
	if (deviceName !== '') {
		const data = {
			name: deviceName,
			data: deviceName,
			includeOffPeak: $('#includeOffPeak').prop('checked'),
			includeProduction: $('#includeProduction').prop('checked'),
			includeGas: $('#includeGas').prop('checked'),
		};
		// Continue to back-end, pass along data
		Homey.emit('validate', data, (error, result) => {
			if (error) {
				Homey.alert(error.message, 'error');
			} else {
				// Homey.alert(`${__('pair.success')} ${result}`, 'info');
				const device = JSON.parse(result);
				Homey.addDevice(device, (err, res) => {
					if (err) { Homey.alert(err, 'error'); return; }
					setTimeout(() => {
						Homey.done();
					}, 5000);
				});
			}
		});
	} else {
		Homey.alert(__('pair.required'), 'error');
		// Homey.done();
	}
}

$(document).ready(() => {
	// console.log('doc is ready');
	discover();
});
