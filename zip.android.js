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
        if (keepParent === void 0) { keepParent = true; }
        return new Promise(function (resolve, reject) {
            if (!fs.Folder.exists(folder)) {
                return reject('Folder does not exist, invalid folder path: ' + folder);
            }
            try {
                if (fs.File.exists(destination)) {
                    var f = fs.File.fromPath(destination);
                    f.remove().then(function (result) {
                        var temp = fs.knownFolders.temp();
                        var tempDestinationPath = fs.path.join(temp.path, 'archive.zip');
                        var zipFile = new net.lingala.zip4j.core.ZipFile(tempDestinationPath);
                        zipFile.setRunInThread(true);
                        if (password) {
                            zipFile.setPassword(password);
                        }
                        var parameters = new net.lingala.zip4j.model.ZipParameters();
                        parameters.setCompressionMethod(net.lingala.zip4j.util.Zip4jConstants.COMP_DEFLATE);
                        parameters.setCompressionLevel(net.lingala.zip4j.util.Zip4jConstants.DEFLATE_LEVEL_NORMAL);
                        zipFile.createZipFileFromFolder(folder, parameters, false, 0);
                        var monitor_1 = zipFile.getProgressMonitor();
                        var progressInterval_1 = setInterval(function () {
                            if (monitor_1.getState() === net.lingala.zip4j.progress.ProgressMonitor.STATE_BUSY) {
                                if (progressCallback)
                                    progressCallback(monitor_1.getPercentDone());
                            }
                            else {
                                var result_1 = monitor_1.getResult();
                                if (result_1 === net.lingala.zip4j.progress.ProgressMonitor.RESULT_SUCCESS) {
                                    var sourceFile = fs.File.fromPath(tempDestinationPath);
                                    var destinationFile = fs.File.fromPath(destination);
                                    var source = sourceFile.readSync(function (error) {
                                        reject('error');
                                    });
                                    destinationFile.writeSync(source, function (error) {
                                        reject('error');
                                    });
                                    resolve();
                                    temp.clear();
                                }
                                else if (result_1 === net.lingala.zip4j.progress.ProgressMonitor.RESULT_ERROR) {
                                    reject(monitor_1.getException()
                                        ? monitor_1.getException().getMessage()
                                        : 'error');
                                }
                                else {
                                    reject('cancelled');
                                }
                                clearInterval(progressInterval_1);
                            }
                        }, Zip.ProgressUpdateRate);
                    }, function (error) {
                        reject(error);
                    });
                }
                else {
                    var zipFile = new net.lingala.zip4j.core.ZipFile(destination);
                    zipFile.setRunInThread(true);
                    if (password) {
                        zipFile.setPassword(password);
                    }
                    var parameters = new net.lingala.zip4j.model.ZipParameters();
                    parameters.setCompressionMethod(net.lingala.zip4j.util.Zip4jConstants.COMP_DEFLATE);
                    parameters.setCompressionLevel(net.lingala.zip4j.util.Zip4jConstants.DEFLATE_LEVEL_NORMAL);
                    zipFile.createZipFileFromFolder(folder, parameters, false, 0);
                    var monitor_1_1 = zipFile.getProgressMonitor();
                    var progressInterval_1_1 = setInterval(function () {
                        if (monitor_1_1.getState() === net.lingala.zip4j.progress.ProgressMonitor.STATE_BUSY) {
                            if (progressCallback)
                                progressCallback(monitor_1_1.getPercentDone());
                        }
                        else {
                            var result = monitor_1_1.getResult();
                            if (result === net.lingala.zip4j.progress.ProgressMonitor.RESULT_SUCCESS) {
                                resolve();
                            }
                            else if (result === net.lingala.zip4j.progress.ProgressMonitor.RESULT_ERROR) {
                                reject(monitor_1_1.getException()
                                    ? monitor_1_1.getException().getMessage()
                                    : 'error');
                            }
                            else {
                                reject('cancelled');
                            }
                            clearInterval(progressInterval_1_1);
                        }
                    }, Zip.ProgressUpdateRate);
                }
            }
            catch (ex) {
                reject(ex);
            }
        });
    };
    Zip.unzipWithProgress = function (archive, destination, progressCallback, overwrite, password) {
        if (!fs.File.exists(archive)) {
            return Promise.reject("File does not exist, invalid archive path: " + archive);
        }
        return new Promise(function (resolve, reject) {
            try {
                var zipFile = new net.lingala.zip4j.core.ZipFile(archive);
                zipFile.setRunInThread(true);
                if (zipFile.isEncrypted() && password) {
                    zipFile.setPassword(password);
                }
                var d = new java.io.File(destination);
                if (!d.exists()) {
                    d.mkdirs();
                }
                var fileHeaders = zipFile.getFileHeaders();
                if (fileHeaders) {
                    var length_1 = fileHeaders.size();
                    for (var i = 0; i < length_1; i++) {
                        var header = fileHeaders.get(i);
                        if (header.isDirectory()) {
                            if (d.exists()) {
                                var f = new java.io.File(destination, header.getFileName());
                                f.mkdirs();
                                zipFile.extractFile(header, f.toString());
                            }
                        }
                    }
                }
                var monitor_2 = zipFile.getProgressMonitor();
                zipFile.extractAll(destination);
                var progressInterval_2 = setInterval(function () {
                    if (monitor_2.getState() === net.lingala.zip4j.progress.ProgressMonitor.STATE_BUSY) {
                        if (progressCallback)
                            progressCallback(monitor_2.getPercentDone());
                    }
                    else {
                        var result = monitor_2.getResult();
                        if (result === net.lingala.zip4j.progress.ProgressMonitor.RESULT_SUCCESS) {
                            resolve();
                        }
                        else if (result === net.lingala.zip4j.progress.ProgressMonitor.RESULT_ERROR) {
                            reject(monitor_2.getException()
                                ? monitor_2.getException().getMessage()
                                : 'error');
                        }
                        else {
                            reject('cancelled');
                        }
                        clearInterval(progressInterval_2);
                    }
                }, Zip.ProgressUpdateRate);
            }
            catch (ex) {
                reject(ex);
            }
        });
    };
    Zip.unzip = function (archive, destination, overwrite, password) {
        return this.unzipWithProgress(archive, destination, function () {
        }, overwrite, password);
    };
    Zip.ProgressUpdateRate = 100;
    return Zip;
}());
exports.Zip = Zip;
//# sourceMappingURL=zip.android.js.map