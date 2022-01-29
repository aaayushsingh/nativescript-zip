declare let lastProgressPercent: any;
declare let debugEnabled: boolean;
declare function unzipRequest(request: {
    action: string;
    archive: string;
    destination: string;
    overwrite: boolean;
    password: string;
}): void;
declare function onUnzipProgress(entry: any, zipFileInfo: any, entryNumber: any, entriesTotal: any): void;
declare function onUnzipCompletion(path: any, succeeded: any, err: any): void;
declare function debug(arg: any): void;
declare function zipRequest(request: any): void;
declare function onZipProgress(entryNumber: any, entriesTotal: any): void;
