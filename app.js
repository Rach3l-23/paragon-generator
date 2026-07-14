// ======================================
// CENNIK
// ======================================
const products = [
    {
        symbol: "PQ28",
        name: "Powerbank Ldnio PQ28",
        brutto: 80.00,
        vat: 0.23
    },
    {
        symbol: "PQ12",
        name: "Powerbank Ldnio PQ12",
        brutto: 90.00,
        vat: 0.23
    },
    {
        symbol: "PQ22",
        name: "Powerbank Ldnio PQ22",
        brutto: 100.00,
        vat: 0.23
    },
    {
        symbol: "PQ25",
        name: "Powerbank Ldnio PQ25",
        brutto: 60.00,
        vat: 0.23
    },
    {
        symbol: "PQ27",
        name: "Powerbank Ldnio PQ27",
        brutto: 160.00,
        vat: 0.23
    },
    {
        symbol: "PQ30",
        name: "Powerbank Ldnio PQ30",
        brutto: 120.00,
        vat: 0.23
    },
	{
        symbol: "PQ50",
        name: "Powerbank Ldnio PQ50",
        brutto: 140.00,
        vat: 0.23
    },
	{
    symbol: "PaczkomatS",
    name: "Koszt wysyłki PaczkomatS",
    brutto: 12.99,
    vat: 0.23
},
{
    symbol: "PaczkomatM",
    name: "Koszt wysyłki PaczkomatM",
    brutto: 16.99,
    vat: 0.23
},
{
    symbol: "PaczkomatL",
    name: "Koszt wysyłki PaczkomatL",
    brutto: 19.99,
    vat: 0.23
},
	{
    symbol: "ALLEGRO_P24",
    name: "Przesyłka Allegro Paczkomat",
    brutto: 12.99,
    vat: 0.23
},
{
    symbol: "KURIER",
    name: "Przesyłka kurierska",
    brutto: 16.99,
    vat: 0.23
}
];
// ======================================
// ELEMENTY HTML
// ======================================
const csvFile = document.querySelector("#csvFile");
const printPdf = document.querySelector("#printPdf");
const addRow = document.querySelector("#addRow");
const receiptDate = document.querySelector("#receiptDate");
const receiptNumber = document.querySelector("#receiptNumber");
const receiptRows = document.querySelector("#receiptRows");
const totalNetto = document.querySelector("#totalNetto");
const totalVat = document.querySelector("#totalVat");
const totalBrutto = document.querySelector("#totalBrutto");
// ======================================
// KONFIGURACJA
// ======================================
// ======================================
// DANE
// ======================================
let records = [];
// ======================================
// OBSŁUGA CSV
// ======================================
function detectDelimiter(text) {
  const firstLine = text.split(/\r?\n/)[0] || "";
  const counts = { ",": 0, ";": 0, "\t": 0 };
  let quoted = false;
  for (let i = 0; i < firstLine.length; i += 1) {
    const char = firstLine[i];
    const next = firstLine[i + 1];
    if (char === '"' && quoted && next === '"') {
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (!quoted && Object.hasOwn(counts, char)) {
      counts[char] += 1;
    }
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}
function splitCsvRows(text, delimiter = detectDelimiter(text)) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (char === '"' && quoted && next === '"') {
      cell += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === delimiter && !quoted) {
      row.push(cell.trim());
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(cell.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  row.push(cell.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}
function cleanText(value) {
  return String(value || "")
    .replace(/\uFEFF/g, "")
    .replace(/ÂĄ/g, "")
    .trim();
}
function normalize(value) {
  return cleanText(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}
function parseSimpleTable(rows) {
  const headers = rows.shift()?.map(normalize) ?? [];
  return rows.map((row) => {
    const record = {};
    headers.forEach((header, index) => {
      record[header] = cleanText(row[index]);
    });
    return record;
  });
}
function parseCsv(text) {
    const rows = splitCsvRows(text);
    if (!rows.length) return [];
    return parseSimpleTable(rows);
}
function loadCsv(text) {
    records = parseCsv(text);
    console.log(records);
}
// ======================================
// POMOCNICZE
// ======================================
function updateReceiptDate() {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yyyy = today.getFullYear();
	const saleDate = document.querySelector("#saleDate");
saleDate.value = new Date().toISOString().split("T")[0];
    receiptDate.textContent = `${dd}.${mm}.${yyyy}`;
}
function updateReceiptNumber() {
    const today = new Date();
    const yy = String(today.getFullYear()).slice(-2);
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    document.querySelector("#receiptPrefix").textContent =
        `${yy}/${mm}/${dd}/`;
}
// ======================================
// GENEROWANIE WIERSZY
// ======================================
function addReceiptRow() {
    const number = receiptRows.rows.length + 1;
    receiptRows.insertAdjacentHTML("beforeend", `
        <tr>
			<td class="lpCell">
				<button
					type="button"
					class="deleteRow">
					✖
				</button>
				<span class="rowNumber">${number}</span>
			</td>
               <td> <select class="productSelect">
                    <option value="">Wybierz produkt...</option>
                </select>
            </td>
            <td class="nettoPrice">0.00</td>
            <td>
                <select class="quantitySelect"></select>
            </td>
            <td class="nettoValue">0.00</td>
            <td class="vatRate">23%</td>
            <td class="vatValue">0.00</td>
            <td class="grossValue">0.00</td>
        </tr>
    `);
}
function prepareReceiptRow(row) {
    const productSelect = row.querySelector(".productSelect");
    const quantitySelect = row.querySelector(".quantitySelect");
    productSelect.innerHTML = '<option value="">Wybierz produkt...</option>';
    products.forEach(product => {
        productSelect.innerHTML += `
            <option value="${product.symbol}">
                ${product.name} (${product.brutto} PLN)
            </option>
        `;
    });
    quantitySelect.innerHTML = "";
    for (let i = 1; i <= 100; i++) {
        quantitySelect.innerHTML += `
            <option value="${i}">
                ${i}
            </option>
        `;
    }
    productSelect.addEventListener("change", () => {
        updateReceiptRow(row);
    });
    quantitySelect.addEventListener("change", () => {
        updateReceiptRow(row);
    });
}
// ======================================
// WYPEŁNIANIE LIST
// ======================================
function fillProductLists() {
    const selects = document.querySelectorAll(".productSelect");
    selects.forEach(select => {
        select.innerHTML = '<option value="">Wybierz produkt...</option>';
        products.forEach(product => {
            select.innerHTML += `
                <option value="${product.symbol}">
					${product.name} (${product.brutto} PLN)
				</option>
            `;
        });
    });
}
function fillQuantityLists() {
    const selects = document.querySelectorAll(".quantitySelect");
    selects.forEach(select => {
        select.innerHTML = "";
        for (let i = 1; i <= 100; i++) {
            select.innerHTML += `
                <option value="${i}">
                    ${i}
                </option>
            `;
        }
    });
}
// ======================================
// OBSŁUGA ZDARZEŃ
// ======================================
function bindProductSelects() {
    const selects = document.querySelectorAll(".productSelect");
    selects.forEach(select => {
        select.addEventListener("change", function () {
            const row = this.closest("tr");
            updateReceiptRow(row);
        });
    });
}
function bindQuantitySelects() {
    const selects = document.querySelectorAll(".quantitySelect");
    selects.forEach(select => {
        select.addEventListener("change", function () {
            const row = this.closest("tr");
            updateReceiptRow(row);
        });
    });
}
function bindDeleteButtons() {
    document.querySelectorAll(".deleteRow").forEach(button => {
        button.onclick = () => {
			if(document.querySelectorAll("#receiptRows tr").length === 1){
				return;
			}
			button.closest("tr").remove();
			updateRowNumbers();
			updateReceiptTotals();
		};
    });
}
// ======================================
// OBLICZENIA
// ======================================
function updateReceiptRow(row) {
    const productSelect = row.querySelector(".productSelect");
    const quantitySelect = row.querySelector(".quantitySelect");
    const nettoPrice = row.querySelector(".nettoPrice");
    const nettoValue = row.querySelector(".nettoValue");
	const vatRate = row.querySelector(".vatRate");
	const vatValue = row.querySelector(".vatValue");
	const grossValue = row.querySelector(".grossValue");
    const product = products.find(p => p.symbol === productSelect.value);
    if (!product) {
        nettoPrice.textContent = "0.00";
        nettoValue.textContent = "0.00";
        return;
    }
    const quantity = Number(quantitySelect.value);
// cena jednostkowa brutto
const unitBrutto = product.brutto;
// cena jednostkowa netto
const unitNetto = unitBrutto / (1 + product.vat);
// VAT jednostkowy
const unitVat = unitBrutto - unitNetto;
// wartości dla ilości
const brutto = unitBrutto * quantity;
const netto = unitNetto * quantity;
const vat = unitVat * quantity;
// wyświetlanie
nettoPrice.textContent = unitNetto.toFixed(2);
nettoValue.textContent = netto.toFixed(2);
vatRate.textContent = `${product.vat * 100}%`;
vatValue.textContent = vat.toFixed(2);
grossValue.textContent = brutto.toFixed(2);
updateReceiptTotals();
}
function updateRowNumbers() {
    document.querySelectorAll("#receiptRows tr").forEach((row, index) => {
        row.querySelector(".rowNumber").textContent = index + 1;
    });
}
// ======================================
// SUMY
// ======================================
function updateReceiptTotals() {
    let netto = 0;
    let vat = 0;
    let brutto = 0;
    document.querySelectorAll("#receiptRows tr").forEach(row => {
        netto += Number(row.querySelector(".nettoValue").textContent);
        vat += Number(row.querySelector(".vatValue").textContent);
        brutto += Number(row.querySelector(".grossValue").textContent);
    });
    totalNetto.textContent = netto.toFixed(2);
    totalVat.textContent = vat.toFixed(2);
    totalBrutto.textContent = brutto.toFixed(2);
	const paidAmount = document.querySelector("#paidAmount");
	paidAmount.textContent = `${brutto.toFixed(2)} PLN`;
}
// ======================================
// LISTA ILOŚCI
// ======================================
csvFile.addEventListener("change", async (event) => {
  const [file] = event.target.files;
  if (!file) return;
  loadCsv(await file.text());
});
function preparePrintView() {
    document.querySelectorAll(".productSelect").forEach(select => {
        const span = document.createElement("span");
        span.className = "printSelectValue";
        const product = products.find(p => p.symbol === select.value);
		span.textContent = product ? product.name : "";
        select.after(span);
        select.style.display = "none";
    });
    document.querySelectorAll(".quantitySelect").forEach(select => {
        const span = document.createElement("span");
        span.className = "printSelectValue";
        span.textContent = select.value;
        select.after(span);
        select.style.display = "none";
    });
	// Data sprzedaży
	document.querySelectorAll(".saleDateInput").forEach(input => {

    const span = document.createElement("span");

    span.className = "printDateValue";

    const [year, month, day] = input.value.split("-");

    span.textContent = `${day}.${month}.${year}`;

    input.after(span);

    input.style.display = "none";

});
	// Forma płatności
	document.querySelectorAll(".paymentSelect").forEach(select => {

    const span = document.createElement("span");

    span.className = "printPaymentValue";

    span.textContent = select.options[select.selectedIndex].text;

    select.after(span);

    select.style.display = "none";

});
}
function restorePrintView() {

    document.querySelectorAll(".printSelectValue").forEach(span => span.remove());

    document.querySelectorAll(".productSelect, .quantitySelect").forEach(select => {
        select.style.display = "";
    });

    document.querySelectorAll(".printDateValue, .printPaymentValue")
        .forEach(span => span.remove());

    document.querySelectorAll(".saleDateInput").forEach(input => {
    input.style.display = "";
});

    document.querySelectorAll(".paymentSelect").forEach(select => {
        select.style.display = "";
    });

}
function validateReceipt() {

    const buyer = document
        .getElementById("buyerData")
        .value
        .trim();

    if (buyer === "") {

        alert("Uzupełnij dane nabywcy.");
        document.getElementById("buyerData").focus();

        return false;
    }

    const rows = document.querySelectorAll("#receiptRows tr");

    for (let i = 0; i < rows.length; i++) {

        const select = rows[i].querySelector(".productSelect");

        if (select.value === "") {

            alert(`Wybierz produkt w pozycji ${i + 1}.`);
            select.focus();

            return false;
        }
    }

    return true;
}
printPdf.addEventListener("click", () => {

    if (!validateReceipt()) return;

    preparePrintView();

    const oldTitle = document.title;
    document.title =
        `Paragon nr ${document.querySelector("#receiptPrefix").textContent}${receiptNumber.value}`;

    setTimeout(() => {
        window.print();
        document.title = oldTitle;
    }, 150);

});

window.addEventListener("afterprint", () => {
    restorePrintView();
});
addRow.addEventListener("click", () => {
    addReceiptRow();
    const row = receiptRows.lastElementChild;
    prepareReceiptRow(row);
	bindDeleteButtons();
});
// ======================================
// INICJALIZACJA
// ======================================
function initializeReceipt() {
    updateReceiptDate();
	updateReceiptNumber();
    addReceiptRow();
prepareReceiptRow(receiptRows.lastElementChild);
updateReceiptTotals();
}
initializeReceipt();
