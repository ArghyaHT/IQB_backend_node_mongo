const mongoose = require("mongoose")

const iconsModel = new mongoose.Schema({
    icons: [
        {
            name:{
                type: String
            },
            public_id: {
                type: String
            },
            url: {
                type: String,
            }
        }
    ]
})

const Icons = mongoose.model('Icons', iconsModel);

module.exports = Icons;