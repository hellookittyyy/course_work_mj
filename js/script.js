const MAX_ITEMS_PER_PAGE = 6;

async function loadPage() {
  devMode("http://127.0.0.1/");
  checkTheme();

  const page = document.getElementById("index_page");

  if (page) {
    const lang = getCurrentLanguage();

    const statuses = await getStatusesAsync();
    const params = getAddressParameters();
    const type = params.type ? params.type.toLowerCase() : "drones";
    if (type == "drones") {
      const statusFilter = document.getElementById("status-filter");
      statusFilter.classList.remove("hidden");
      const langStatusFilter = document.getElementById("lang-status");
      langStatusFilter.classList.remove("hidden");

      if (statusFilter && statusFilter.childElementCount == 1) {
        statusFilter.innerHTML = "";
        const allOption = document.createElement("option");
        allOption.id = "all";
        allOption.selected = true;
        allOption.value = "all";
        allOption.text = "All";
        statusFilter.appendChild(allOption);
        statuses.forEach((status) => {
          const option = document.createElement("option");
          option.value = status.id;
          option.text = status[lang.toLowerCase()];
          statusFilter.appendChild(option);
        });
      }
    }

    sort();
  }

  await loadLanguage();
}

function drawItemCards(page, items) {
  document.querySelector(".drones").innerHTML = "";
  for (
    let i = (page - 1) * MAX_ITEMS_PER_PAGE;
    i < Math.min(page * MAX_ITEMS_PER_PAGE, items.length);
    i++
  ) {
    const item = items[i];
    createItemCard(item);
  }
}

async function createItemCard(item) {
  const lang = getCurrentLanguage().toUpperCase();
  const language = await fetch(`./lang.json`).then((response) =>
    response.json()
  );

  const data = language[lang];
  const currency = data.currency;
  const amountText = data.amount;

  const itemCard = document.createElement("div");
  itemCard.classList.add("drone-card");
  const images = document.createElement("div");
  images.classList.add("images");
  const mainImage = document.createElement("img");
  mainImage.classList.add("main-image");
  mainImage.src = `./images/${item.image}`;
  images.appendChild(mainImage);
  const topRightImages = document.createElement("div");
  topRightImages.classList.add("top-right-images");
  const itemLink = document.createElement("a");
  itemLink.href = "#";
  topRightImages.appendChild(itemLink);
  const itemImage = document.createElement("img");
  itemImage.classList.add("drone");
  itemImage.src = "./icons/screw-driver.svg";
  itemLink.appendChild(itemImage);
  // <a><img class="compare" src="./icons/compare.svg" /></a>
  const compareLink = document.createElement("a");
  compareLink.href = "#";
  topRightImages.appendChild(compareLink);
  const compareImage = document.createElement("img");
  compareImage.classList.add("compare");
  compareImage.src = "./icons/compare.svg";
  //my code
  compareLink.onclick = () => {
    let ids = localStorage["selected_ids"];
    if (ids) {
      if (ids.split(",").length > 1) {
        alert("Comparison is full");
      } else if (!ids.split(",").includes(item.id + "")) {
        localStorage["selected_ids"] += "," + item.id;
      }
    } else {
      localStorage["selected_ids"] = item.id;
    }
  };
  compareLink.appendChild(compareImage);
  // <a><img class="add_to_analitic" src="./icons/plus.svg" /></a>
  const addLink = document.createElement("a");
  addLink.href = "#";
  topRightImages.appendChild(addLink);
  const addImage = document.createElement("img");
  addImage.classList.add("add_to_analitic");
  addImage.src = "./icons/plus.svg";
  addLink.appendChild(addImage);
  images.appendChild(topRightImages);
  const text = document.createElement("div");
  text.classList.add("text");
  const h6 = document.createElement("h6");

  const params = getAddressParameters();
  const outputItems = params.type ? params.type.toLowerCase() : "drones";

  const link = document.createElement("a");
  link.href = `./item.html?id=${item.id}&type=${outputItems}`;
  link.textContent = item.name;
  h6.appendChild(link);
  text.appendChild(h6);
  const info = document.createElement("div");
  info.classList.add("info");
  const price = document.createElement("p");
  const currencySpan = document.createElement("span");
  currencySpan.id = "lang-currency";
  currencySpan.textContent = currency;
  price.textContent = `${item.price} `;
  price.appendChild(currencySpan);
  info.appendChild(price);
  if (outputItems === "drones") {
    const statuses = await getStatusesAsync();
    const statusSelect = document.createElement("select");
    statusSelect.id = "status";
    statusSelect.onchange = () =>
      updateStatusAsync(item.id, statusSelect.value);
    for (let i = 0; i < statuses.length; i++) {
      const option = document.createElement("option");
      option.value = statuses[i].id;
      option.textContent = statuses[i][lang.toLowerCase()];
      statusSelect.appendChild(option);
    }
    statusSelect.value = item.status;
    info.appendChild(statusSelect);
  }

  text.appendChild(info);
  itemCard.appendChild(images);
  itemCard.appendChild(text);
  document.querySelector(".drones").appendChild(itemCard);
}

function drawPagination(pages, page) {
  const pagination = document.getElementsByClassName("pagination")[0];
  pagination.innerHTML = "";

  for (let i = 1; i <= pages; i++) {
    const button = document.createElement("button");
    button.textContent = i;

    button.onclick = () => {
      const url = new URL(window.location.href);
      url.searchParams.set("page", i);
      window.history.pushState({}, "", url);
      loadPage(i);
    };
    if (i === parseInt(page)) {
      button.classList.add("active");
    }
    pagination.appendChild(button);
  }
}

async function getFilteredDronesAsync() {
  const filter = document.querySelector("#status-filter").value;
  const allItems = await fetch("./items.json").then((response) =>
    response.json()
  );

  const params = getAddressParameters();
  let outputItems = params.type ? params.type.toLowerCase() : "drones";
  const items = allItems[outputItems];

  if (filter === "all") {
    return items;
  } else {
    return items.filter((item) => item.status === parseInt(filter));
  }
}

async function sort() {
  const drones = await getFilteredDronesAsync();

  const sortType = document.querySelector("#sort").value;
  const sortedDrones = drones.sort((a, b) => {
    if (sortType === "rating") {
      return b.rating - a.rating;
    } else if (sortType === "descending") {
      return b.price - a.price;
    } else if (sortType === "ascending") {
      return a.price - b.price;
    }
  });

  const params = getAddressParameters();
  let page = params.page ? params.page : 1;

  const pages = Math.ceil(sortedDrones.length / MAX_ITEMS_PER_PAGE);
  if (page > pages) {
    page = pages;
    const url = new URL(window.location.href);
    url.searchParams.set("page", page);
    window.history.pushState({}, "", url);
    loadPage(page);
  }

  drawPagination(pages, page);
  drawItemCards(page, sortedDrones);
}

function setHeaderLang(lang) {
  const langSwitch = document.getElementById("language");

  if (langSwitch) {
    langSwitch.value = lang;
  }
}

async function loadLanguage() {
  const lang = getCurrentLanguage();

  setHeaderLang(lang);

  const language = await fetch(`./lang.json`).then((response) =>
    response.json()
  );

  const data = language[lang];
  console.log(data);

  Object.keys(data).forEach((key) => {
    const elements = document.querySelectorAll(`[id="lang-${key}"]`);

    elements.forEach((element) => {
      element.innerHTML = data[key];
    });
  });
}

function changeLanguage() {
  const lang = document.getElementById("language").value;
  localStorage.setItem("lang", lang);
  loadLanguage();
}

function checkTheme() {
  const theme = localStorage.getItem("theme");
  const body = document.querySelector("body");

  if (theme === "dark" && !body.classList.contains("dark-theme")) {
    changeTheme();
  }
}

function changeTheme() {
  const body = document.querySelector("body");
  body.classList.toggle("dark-theme");

  if (body.classList.contains("dark-theme")) {
    localStorage.setItem("theme", "dark");
  } else {
    localStorage.setItem("theme", "light");
  }
}

// window.addEventListener("load", loadPage);
document.addEventListener("DOMContentLoaded", loadPage);
