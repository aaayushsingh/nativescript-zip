export declare class Zip {
    static zip(folder: any, destination: any, keepParent: any, password: any): Promise<{}>;
    static zipWithProgress(folder: any, destination: any, progressCallback: any, keepParent: any, password: any): Promise<{}>;
    static unzipWithProgress(archive: string, destination: string, progressCallback: (progressPercent) => void, overwrite?: boolean, password?: string): Promise<any>;
    static unzip(archive: string, destination: string, overwrite?: boolean, password?: string): Promise<any>;
}
