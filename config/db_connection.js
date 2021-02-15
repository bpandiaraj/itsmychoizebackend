const { Mongoose } = require('mongoose');
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate");
const multitenantPool = {};
const config = require("./config.js");
const logger = require("./logger");

const mongoOptions = {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    autoIndex: true,
    poolSize: 10,
    bufferMaxEntries: 0,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 30000,
};

const getTenantDB = function getConnections(showId, modelName, schema) {
    const mCon = multitenantPool[showId];
    if (mCon) {
        if (!mCon.modelSchemas[modelName]) {
            logger.info(`Successfully connected to the database with DB ${showId} schema ${modelName}`)
            schema.plugin(mongooseAggregatePaginate);
            mCon.model(modelName, schema);
        }
        return mCon;
    }

    const mongoose = new Mongoose();
    const url = `mongodb://localhost:27017/${showId}`;
    mongoose.connect(url, mongoOptions);
    multitenantPool[showId] = mongoose;
    schema.plugin(mongooseAggregatePaginate);
    mongoose.model(modelName, schema);
    mongoose.connection.on('error', err => logger.error("Could not connect to the database. Exiting now..."));
    mongoose.connection.once('open', () => logger.info(`Successfully created and connected to the database with DB ${showId} schema ${modelName}`));
    return mongoose;
};

exports.getModelByShow = (showId, modelName, schema) => {
    const tenantDb = getTenantDB(showId, modelName, schema);
    return tenantDb.model(modelName);
};