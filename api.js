'use strict';

const Homey = require('homey');

module.exports = {
  async postUpdate({ body, homey }) {
    homey.emit('update.data', body);

    return 'OK';
  },
  async postUpdateDsmrReader({ body, homey }) {
    const DsmrReader = Homey.app.dsmrreader;
    homey.emit('update.data', DsmrReader.parseData(body));

    return 'OK';
  },
};
