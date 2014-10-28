{
    "name"         : "node-red-contrib-ldap",
    "version"      : "0.0.1",
    "description"  : "A NFC node for Node-RED",
    "dependencies": {
        nfc: "https://github.com/hardillb/node-nfc/archive/master.tar.gz"
    },
    license: "Apache",
    "repository" : {
        "type":"git",
        "url":"https://github.com/hardillb/node-red-contrib-nfc.git"
    },
    "keywords": [ "node-red", "NFC" ],
    "node-red"     : {
        "nodes": {
            "nfc": "nfc.js"
        }
    },
    "author": {
        "name": "Benjamin Hardill",
        "email": "hardillb@gmail.com",
        "url": "http://www.hardill.me.uk/wordpress/"
    }
}