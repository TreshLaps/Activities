export const addOrUpdateQueryString = (url: string, name: string, value: string) => {
  var separator = url.indexOf('?') === -1 ? '?' : '&';
  var parameter = name + '=' + value;

  if (url.indexOf(name + '=') === -1) {
    var hashMatchPattern = /^(.+?)#(.+?)$/i;
    var hashMatch = url.match(hashMatchPattern);

    if (hashMatch != null) {
      // url contains a hash like: /url/to/content#some-hash
      return hashMatch[1] + separator + parameter + '#' + hashMatch[2];
    } else {
      return url + separator + parameter;
    }
  } else {
    url = url.replace(new RegExp(name + '=[^&]+'), parameter);
  }

  return url;
};

export const removeQueryString = (url: string, name: string) =>
  url.replace(new RegExp('[\\?|\\&]+' + name + '=[^&]+'), '');
