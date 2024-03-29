const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Eamcet2018Schema = new Schema({
    SNO: Number,
    inst_code: String,
    inst_name: String,
    type: String,
    REG: String,
    DIST: String,
    PLACE: String,
    COED: String,
    AFFLIATED: String,
    ESTD: Number,
    branch_code: {
        type: Array
    },
    OC_BOYS: Number,
    OC_GIRLS: Number,
    SC_BOYS: Number,
    SC_GIRLS: Number,
    ST_BOYS: Number,
    ST_GIRLS: Number,
    BCA_BOYS: Number,
    BCA_GIRLS: Number,
    BCB_BOYS: Number,
    BCB_GIRLS: Number,
    BCC_BOYS: Number,
    BCC_GIRLS: Number,
    BCD_BOYS: Number,
    BCD_GIRLS: Number,
    BCE_BOYS: Number,
    BCE_GIRLS: Number,
});

module.exports = mongoose.model('2018', Eamcet2018Schema);