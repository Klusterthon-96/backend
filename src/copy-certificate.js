/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require("fs-extra");
const path = require("path");

const srcCertificateFolder = path.join(__dirname, "certificate");
const destCertificateFolder = path.join(__dirname, "../", "dist", "certificate");

const copyMLFolder = path.join(__dirname, "ML");
const destMLFolder = path.join(__dirname, "../", "dist", "ML");

// Copy certificate folder
fs.copySync(srcCertificateFolder, destCertificateFolder);

// Copy ML folder
fs.copySync(copyMLFolder, destMLFolder);
