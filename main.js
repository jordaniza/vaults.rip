const contentRoot = document.querySelector("#main-content");

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function parseTableRow(line) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function isTableDivider(cells) {
  return cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function renderTable(lines) {
  const rows = lines.map(parseTableRow);
  const headers = rows[0] ?? [];
  const bodyRows = rows.slice(1).filter((row) => !isTableDivider(row));

  const wrapper = document.createElement("div");
  wrapper.className = "table-wrap";

  const table = document.createElement("table");
  const head = document.createElement("thead");
  const headRow = document.createElement("tr");

  for (const header of headers) {
    const cell = document.createElement("th");
    cell.scope = "col";
    cell.textContent = header;
    headRow.append(cell);
  }

  head.append(headRow);
  table.append(head);

  const body = document.createElement("tbody");

  for (const row of bodyRows) {
    const tableRow = document.createElement("tr");
    const populatedCells = row.filter(Boolean);

    if (populatedCells.length === 1 && row[0]) {
      const cell = document.createElement("td");
      cell.className = "empty-state";
      cell.colSpan = headers.length;
      cell.textContent = row[0];
      tableRow.append(cell);
    } else {
      for (const value of row) {
        const cell = document.createElement("td");
        cell.textContent = value;
        tableRow.append(cell);
      }
    }

    body.append(tableRow);
  }

  table.append(body);
  wrapper.append(table);
  return wrapper;
}

function renderMarkdown(markdown) {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const fragment = document.createDocumentFragment();
  let section = null;

  for (let index = 0; index < lines.length; ) {
    const line = lines[index].trim();

    if (!line) {
      index += 1;
      continue;
    }

    if (line.startsWith("# ")) {
      const title = line.slice(2).trim();
      const id = slugify(title);

      section = document.createElement("section");
      section.id = id;
      section.setAttribute("aria-labelledby", `${id}-title`);

      if (id === "about") {
        section.className = "prose";
      }

      const heading = document.createElement("h2");
      heading.id = `${id}-title`;
      heading.textContent = title;

      if (id === "cases") {
        heading.className = "case-heading";
      }

      section.append(heading);
      fragment.append(section);
      index += 1;
      continue;
    }

    if (!section) {
      index += 1;
      continue;
    }

    if (line.startsWith("## ")) {
      const heading = document.createElement("h3");
      heading.textContent = line.slice(3).trim();
      section.append(heading);
      index += 1;
      continue;
    }

    if (line.startsWith("|")) {
      const tableLines = [];

      while (index < lines.length && lines[index].trim().startsWith("|")) {
        tableLines.push(lines[index]);
        index += 1;
      }

      section.append(renderTable(tableLines));
      continue;
    }

    const paragraphLines = [];

    while (
      index < lines.length &&
      lines[index].trim() &&
      !lines[index].trim().startsWith("#") &&
      !lines[index].trim().startsWith("|")
    ) {
      paragraphLines.push(lines[index].trim());
      index += 1;
    }

    const paragraph = document.createElement("p");
    paragraph.textContent = paragraphLines.join(" ");
    section.append(paragraph);
  }

  contentRoot.replaceChildren(fragment);

  if (window.location.hash) {
    requestAnimationFrame(() => {
      document
        .getElementById(decodeURIComponent(window.location.hash.slice(1)))
        ?.scrollIntoView();
    });
  }
}

async function loadContent() {
  try {
    const response = await fetch("./content/index.md");

    if (!response.ok) {
      throw new Error(`Content request failed with ${response.status}`);
    }

    renderMarkdown(await response.text());
  } catch (error) {
    console.error("Unable to load website content.", error);
  }
}

loadContent();
