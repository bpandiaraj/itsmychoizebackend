const {
    Mongoose
} = require('mongoose');
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate");
const multitenantPool = {};
const config = require("./config.js");

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
    console.log
    const mCon = multitenantPool[showId];
    if (mCon) {
        if (!mCon.modelSchemas[modelName]) {
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
    mongoose.connection.on('error', err => console.log("err ", err));
    mongoose.connection.once('open', () => console.log("Database connected"));
    return mongoose;
};

exports.getModelByShow = (showId, modelName, schema) => {
    const tenantDb = getTenantDB(showId, modelName, schema);
    return tenantDb.model(modelName);
};