export function cleanInputsArray(ids) {
    ids.forEach(function (id) {
        const element = document.getElementById(id);

        if (element.tagName == 'INPUT') {
            element.value = '';
        }

        if (element.tagName == 'TEXTAREA') {
            element.value = '';
        }

        if (element.tagName == 'SELECT') {
            element.selectedIndex = 0;
        }       
    });
}

export function filterByInput(idTable) {
    const valueInput = event.target.value.trim().toLowerCase();
    const rows = document.querySelectorAll(idTable + ' tbody tr');

    rows.forEach(function (row) {
        const rowContent = row.textContent.trim().toLowerCase();
        row.style.display = rowContent.includes(valueInput) ? '' : 'none';
    });
}