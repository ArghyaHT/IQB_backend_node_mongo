const createSalonSettings =  async(req, res) =>{
    res.send("this is create salon Settings route")
}


const getSalonSettings = async(req, res) =>{
    res.send("this is get salon Settings route ")
}


const updateSalonSettings = async(req, res) =>{
    res.send("this is update salon settings route")
}

const deleteSalonSettings = async(req, res) =>{
    res.send("this is delete salon settings route")
}



module.exports = {
    createSalonSettings,
    getSalonSettings,
    updateSalonSettings,
    deleteSalonSettings,
}