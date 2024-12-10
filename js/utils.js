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

async function getStatusByIdAsync(id) {
  const response = await fetch(`./statuses.json`);
  const items = await response.json();
  return items.find((item) => item.id == id);
}

async function getStatusesAsync() {
  const response = await fetch(`./statuses.json`);
  const items = await response.json();
  return items;
}

async function updateStatusAsync(id, statusId) {
  const items = await fetch(`./items.json`);
  const itemsJson = await items.json();

  const item = itemsJson.drones.find((item) => item.id == id);
  item.status = statusId;

  try {
    await fetch(`./items.json`, {
      method: "PATCH",
      body: JSON.stringify(itemsJson),
    });
  } catch {
    console.log(
      "ERROR: data can`t changes in github pages using JSON. Need to server with database."
    );
  }
}

function devMode(url) {
  console.log(window.location.href);
  const REPO_LINKS = "course_work_mj/";
  const THIS_URL = window.location.href;
  if (THIS_URL.includes("localhost") || THIS_URL.includes(url)) {
    console.log("DEV MODE");
    const links = document.querySelectorAll("a");
    links.forEach((link) => {
      if (link.href.includes(REPO_LINKS)) {
        link.href = link.href.replace(REPO_LINKS, "");
      }
    });
  }
}
