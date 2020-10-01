'use strict';

const Homey = require('homey');

module.exports = {
  async postUpdate({ body }) {
    console.log('Handle new post data in p1 update');
    this.homey.emit('update.data', body);

    return 'OK';
  },
  async postUpdateDsmrReader({ body }) {
    console.log('Handle new post data in p1 dsmrreader update');
    const DsmrReader = Homey.app.dsmrreader;
    this.homey.emit('update.data', DsmrReader.parseData(body));

    return 'OK';
  },
};
