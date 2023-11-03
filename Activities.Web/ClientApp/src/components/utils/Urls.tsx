export const addOrUpdateQueryString = (
    url: string,
    name: string,
    value: string
) => {
    const separator = url.indexOf('?') === -1 ? '?' : '&';
    const parameter = `${name}=${value}`;

    if (url.indexOf(`${name}=`) === -1) {
        const hashMatchPattern = /^(.+?)#(.+?)$/i;
        const hashMatch = hashMatchPattern.exec(url);

        if (hashMatch != null) {
            // url contains a hash like: /url/to/content#some-hash
            return `${hashMatch[1] + separator + parameter}#${hashMatch[2]}`;
        }
        return url + separator + parameter;
    }
    url = url.replace(new RegExp(`${name}=[^&]+`), parameter);

    return url;
};

export const removeQueryString = (url: string, name: string) =>
    url.replace(new RegExp(`[\\?|\\&]+${name}=[^&]+`), '');
