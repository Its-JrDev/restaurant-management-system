function CheckboxField(opts) {
  const id = opts.id;
  const label = opts.label || "";
  const checked = opts.checked || false;
  const dataField = opts.dataField || id;

  let html = '<label class="flex items-center gap-2 cursor-pointer" for="' + id + '">';
  html +=
    '<input type="checkbox" id="' +
    id +
    '" name="' +
    id +
    '" data-field="' +
    dataField +
    '" class="sr-only peer"' +
    (checked ? " checked" : "") +
    ">";
  html +=
    '<span class="checkbox-box w-[18px] h-[18px] border-[1.5px] border-brand-300 rounded ' +
    "flex items-center justify-center bg-brand-50 transition-all duration-100 shrink-0 " +
    'peer-checked:bg-brand-500 peer-checked:border-brand-500">';
  html +=
    '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="opacity-0 peer-checked:opacity-100 transition-opacity duration-100"><polyline points="20 6 9 17 4 12"/></svg>';
  html += "</span>";
  html +=
    '<span class="text-sm font-medium leading-loose text-neutral-900 select-none">' +
    label +
    "</span>";
  html += "</label>";
  return html;
}

function initCheckboxField(_id) {
  // Tailwind peer-checked handles the visual state
}

window.CheckboxField = CheckboxField;
window.initCheckboxField = initCheckboxField;

export default CheckboxField;
