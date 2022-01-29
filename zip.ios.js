"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("tns-core-modules/file-system");
var Zip = (function () {
    function Zip() {
    }
    Zip.zip = function (folder, destination, keepParent, password) {
        return this.zipWithProgress(folder, destination, function () {
        }, keepParent, password);
    };
    Zip.zipWithProgress = function (folder, destination, progressCallback, keepParent, password) {
        return new Promise(function (resolve, reject) {
            if (!fs.Folder.exists(folder)) {
                return reject('Folder does not exist, invalid folder path: ' + folder);
            }
            var worker;
            if (global['TNS_WEBPACK']) {
                var WorkerScript = require('nativescript-worker-loader!./zip-worker-ios');
                worker = new WorkerScript();
            }
            else {
                worker = new Worker('./zip-worker-ios');
            }
            worker.postMessage({
                action: 'zip',
                folder: folder,
                destination: destination,
                keepParent: keepParent,
                password: password
            });
            worker.onmessage = function (msg) {
                if (msg.data.progress !== undefined) {
                    progressCallback(msg.data.progress);
                }
                else if (msg.data.result !== undefined) {
                    if (msg.data.result) {
                        resolve();
                    }
                    else {
                        reject(msg.data.err);
                    }
                }
                else {
                    reject('zip-worker-ios failed');
                }
            };
            worker.onerror = function (err) {
                console.log('An unhandled error occurred in worker: ' +
                    err.filename +
                    ', line: ' +
                    err.lineno);
                reject(err.message);
            };
        });
    };
    Zip.unzipWithProgress = function (archive, destination, progressCallback, overwrite, password) {
        return new Promise(function (resolve, reject) {
            if (!fs.File.exists(archive)) {
                return reject("File does not exist, invalid archive path: " + archive);
            }
            var worker;
            if (global['TNS_WEBPACK']) {
                var WorkerScript = require('nativescript-worker-loader!./zip-worker-ios');
                worker = new WorkerScript();
            }
            else {
                worker = new Worker('./zip-worker-ios');
            }
            worker.postMessage({
                action: 'unzip',
                archive: archive,
                destination: destination,
                overwrite: overwrite,
                password: password
            });
            worker.onmessage = function (msg) {
                if (msg.data.progress !== undefined) {
                    progressCallback(msg.data.progress);
                }
                else if (msg.data.result !== undefined) {
                    if (msg.data.result) {
                        resolve();
                    }
                    else {
                        reject(msg.data.err);
                    }
                }
                else {
                    reject('zip-worker-ios failed');
                }
            };
            worker.onerror = function (err) {
                console.log("An unhandled error occurred in worker: " + err.filename + ", line: " + err.lineno);
                reject(err.message);
            };
        });
    };
    Zip.unzip = function (archive, destination, overwrite, password) {
        return new Promise(function (resolve, reject) {
            try {
                if (password || overwrite) {
                    SSZipArchive.unzipFileAtPathToDestinationOverwritePasswordError(archive, destination, overwrite, password);
                }
                else {
                    SSZipArchive.unzipFileAtPathToDestination(archive, destination);
                }
                resolve();
            }
            catch (ex) {
                reject(ex);
            }
        });
    };
    return Zip;
}());
exports.Zip = Zip;
//# sourceMappingURL=zip.ios.js.map