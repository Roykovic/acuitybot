var exports = module.exports = {};

//General OAUTH
exports.grant_type = "authorization_code"
exports.url = "https://safe-ocean-30268.herokuapp.com";

//Salesforce OAUTH
exports.salesforce = {}
exports.salesforce.client_id = "3MVG9HxRZv05HarTorx5Mf0IjDgnpJGwNuO0DCiL0y070i3yFQiLuVegdzZ9oupv5F2AWU1rRT5fv9EpGGfb1"
exports.salesforce.client_secret = "236296553525088968"
exports.salesforce.callback_uri = "https://safe-ocean-30268.herokuapp.com/auth/salesforce"
exports.salesforce.url = "https://eu11.salesforce.com/services/data/v20.0/"

//IBM OAUTH
exports.ibm = {}
exports.ibm.client_id = "app_200049189_1511514432405"
exports.ibm.client_secret = "ad137be1630841a8ceba6f2928cae4bcc317887b2db3b9279c29e8974f586e9a2c1c2012a1b7a264d6bdf52bd6fd794fce0a397ad57878cd8a5ad4abdc0010a46643dfa9f7f2a3fbf1b20d8d13eb0bcb0860d3ed9c8aa60e6ea369a1445e75ca0af6b3944a0f876a7897f4ec69fe9101e8bde62bea3c4b498bc76d7bb824"
exports.ibm.callback_uri = "https://safe-ocean-30268.herokuapp.com/auth/ibm"
//IBM GENERAL
exports.ibm.url = "https://apps.ce.collabserv.com/"
exports.ibm.columns = Object.freeze({email:0, phone:2})

//MYSQL connection
exports.connection = {
	connectionLimit: "1",
    database: "ibmx_a6f1d89267096f1",
    host: "us-cdbr-sl-dfw-01.cleardb.net",
    user: "b332003fffc8cc",
    password: "d446664b"
}

//DialogFlow API
exports.accesToken = "5462b4a0987946ee967dbea809dd6676";