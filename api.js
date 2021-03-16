'use strict';

const Homey = require('homey');

module.exports = {

  async postUpdate({ homey, body }) {
    return homey.emit('update.data', body);
  },

  async postUpdateDsmrReader({ homey, body }) {
    const data = homey.app.parseDSMRData(body);
    return homey.emit('update.data', data);
  },

};
