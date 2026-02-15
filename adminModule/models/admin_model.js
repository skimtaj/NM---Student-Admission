const bcryptjs = require('bcryptjs');
const JWT = require('jsonwebtoken')
const mongoose = require('mongoose');
require('dotenv').config();

const adminSchema = mongoose.Schema({

    name: {

        type: String
    },

    mobile: {

        type: String
    },

    email: {

        type: String
    },

    password: {

        type: String
    },

    Tokens: [{

        token: {

            type: String
        }
    }]
});

adminSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcryptjs.hash(this.password, 10);
    }
    next();
});

adminSchema.methods.adminTokenGenerate = async function () {

    try {
        const token = JWT.sign({ _id: this._id.toString() }, process.env.Admin_Token_Password, { expiresIn: '365d' });
        this.Tokens = this.Tokens.concat({ token: token });
        await this.save();
        return token;
    }

    catch (err) {
        console.log('admin token generating error', err)
    }

}


const admin_model = mongoose.model('admin_model', adminSchema);

module.exports = admin_model; 
