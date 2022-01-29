var lastProgressPercent;
var debugEnabled = true;
debug("ZipWorker.Init");
global.onmessage = function (msg) {
  var request = msg.data;
  if (request.action === "zip") {
    zipRequest(request);
  } else if (request.action === "unzip") {
    unzipRequest(request);
  }
};
global.onerror = function (err) {
  debug("ZipWorker.Error: " + err);
  global.postMessage({ result: false, err: err });
  close();
};
function unzipRequest(request) {
  var archivePath = request.archive;
  var destinationPath = request.destination;
  var overwrite = request.overwrite || true;
  var password = request.password || null;
  debug("ZipWorker.unzip - archive=" + archivePath);
  var result =
    SSZipArchive.unzipFileAtPathToDestinationOverwritePasswordProgressHandlerCompletionHandler(
      archivePath,
      destinationPath,
      overwrite,
      password,
      onUnzipProgress,
      onUnzipCompletion
    );
}
function onUnzipProgress(entry, zipFileInfo, entryNumber, entriesTotal) {
  if (entriesTotal > 0) {
    var percent = Math.floor((entryNumber / entriesTotal) * 100);
    if (percent !== lastProgressPercent) {
      lastProgressPercent = percent;
      global.postMessage({ progress: percent });
    }
  }
}
function onUnzipCompletion(path, succeeded, err) {
  if (succeeded) {
    global.postMessage({ result: true });
  } else {
    global.postMessage({
      result: false,
      err: err ? err.localizedDescription : "Unknown error",
    });
  }
  close();
}
function debug(arg) {
  if (debugEnabled && console && console.log) {
    console.log(arg);
  }
}
function zipRequest(request) {
  var folderPath = request.folder;
  var destinationPath = request.destination;
  var keepParent = request.keepParent || true;
  var password = request.password || null;
  debug(
    "ZipWorker.zip - folder=" +
      folderPath +
      "\n" +
      "ZipWorker.zip - destinationPath=" +
      destinationPath
  );
  var fs = require("@nativescript/core/file-system");
  var temp = fs.knownFolders.temp();
  var tempDestinationPath = temp.getFile("archive.zip");
  debug("ZipWorker.zip - tempFolder= " + tempDestinationPath.path);
  var result =
    SSZipArchive.createZipFileAtPathWithContentsOfDirectoryKeepParentDirectoryCompressionLevelPasswordAESProgressHandler(
      tempDestinationPath.path,
      folderPath,
      keepParent,
      -1,
      password,
      true,
      onZipProgress
    );
  debug("ZipWorker.zip - after create in temp folder with result=" + result);
  if (!result) {
    global.postMessage({
      result: false,
      err: "Error creating zip file.",
    });
    close();
  } else {
    var sourceFile = fs.File.fromPath(tempDestinationPath.path);
    var destinationFile = fs.File.fromPath(destinationPath);
    var source = sourceFile.readSync(function (error) {
      global.postMessage({
        result: false,
        err: "Error creating zip file.",
      });
      temp.clear().then(
        function () {
          close();
        },
        function (error) {
          close();
        }
      );
    });
    destinationFile.writeSync(source, function (error) {
      global.postMessage({
        result: false,
        err: "Error creating zip file.",
      });
      temp.clear().then(
        function () {
          close();
        },
        function (error) {
          close();
        }
      );
    });
    global.postMessage({ result: true });
    temp.clear().then(
      function () {
        close();
      },
      function (error) {
        close();
      }
    );
  }
}
function onZipProgress(entryNumber, entriesTotal) {
  if (entriesTotal > 0) {
    var percent = Math.floor((entryNumber / entriesTotal) * 100);
    debug("ZipWorker.zip - zipProgress= " + percent);
    if (percent !== lastProgressPercent) {
      lastProgressPercent = percent;
      global.postMessage({ progress: percent });
    }
  }
}
//# sourceMappingURL=zip-worker-ios.js.map
