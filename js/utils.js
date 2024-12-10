function getAddressParameters() {
  let parameters = {};

  const url = new URL(window.location.href);

  url.searchParams.forEach((value, key) => {
    parameters[key] = value;
  });

  return parameters;
}

function getCurrentLanguage() {
  const lang = localStorage.getItem("lang");
  if (!lang) {
    localStorage.setItem("lang", "UA");
    return "UA";
  }

  return lang;
}
