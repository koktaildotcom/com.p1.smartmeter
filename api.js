const Homey = require('homey');

module.exports = [
    {
        method: 'POST',
        path: '/update',
        public: true,
        fn: function (args, callback) {
            if (args.hasOwnProperty('body')) {
                Homey.emit('update.data', args.body);

                callback(null, 'OK');
            }

            return callback( new Error('Cannot find body.') );
        },
    },
    {
        method: 'POST',
        path: '/update/dsmrreader',
        public: true,
        fn: function (args, callback) {
            if (args.hasOwnProperty('body')) {
                const DsmrReader = Homey.app.dsmrreader;
                Homey.emit('update.dsmrreaderdata', DsmrReader.parseData(args.body));

                callback(null, 'OK');
            }

            return callback( new Error('Cannot find body.') );
        },
    },
];
