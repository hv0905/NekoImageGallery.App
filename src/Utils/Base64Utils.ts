function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                // reader.result 格式为 "data:[<mime type>];base64,<data>"
                // 如果只需要 base64 部分，可以拆分一下：
                const base64Data = reader.result.split(',')[1];
                resolve(base64Data);
            } else {
                reject(new Error("读取 Blob 数据失败"));
            }
        };
        reader.onerror = () => reject(reader.error!);
    });
}