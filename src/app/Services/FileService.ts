/**
 * `FileAs` - An enum of all possible FileReader read as methods.
 * @public
 * @enum
 */
export enum FileAs {
    /**
     * effects the FileReader.readAsURL method.
     */
    url,
    /**
     * effects the FileReader.readAsText method.
     */
    text,
    /**
     * effects the FileReader.readAsArrayBuffer method.
     */
    arrayBuffer,
    /**
     * effects the FileReader.readAsBinaryString method.
     */
    binaryString
}


/**
 * Read every file as promised based solution.
 * @public
 */
export class FileHandler {

    //#region Methods

    /**
     *
     * @param blob . The given data.
     * @param as das given as param {@link FileAs}
     */
    public static read(blob: Blob, as: FileAs): Promise<string | ArrayBuffer | null> {

        return new Promise<string | ArrayBuffer | null>((resolve, reject): any => {
            const reader = new FileReader();

            reader.onload = (e): void => resolve(e.target!.result);
            reader.onerror = (e): void => reject(new Error(`Failed to reading file '${String(e.target!.result)}'`));

            switch (as) {
                case FileAs.arrayBuffer:
                    reader.readAsArrayBuffer(blob);
                    break;
                case FileAs.text:
                    reader.readAsText(blob);
                    break;
                case FileAs.url:
                    reader.readAsDataURL(blob);
                    break;
                case FileAs.binaryString:
                    reader.readAsBinaryString(blob);
                    break;
                default:
                    throw new Error('Invalid ass type :)');
            }
        });
    }

    //#endregion

}


