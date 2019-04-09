const toastCenter = document.querySelector('#toast-center');
const toastTpl = document.querySelector('#toast-tpl');

/**
 * Use createSuccessToast or createErrorToast instead.
 */
function createToast(msg, type) {
  const clone = document.importNode(toastTpl.content, true);
  const toast = document.createElement('div');
  toast.classList.add('toast');
  toast.classList.add('text-white');
  toast.dataset.autohide = false;
  if (type === 'error') {
    toast.classList.add('bg-danger');
  } else {
    toast.classList.add('bg-success');
  }
  clone.querySelector('.toast-msg').textContent = msg;
  toast.appendChild(clone);
  toastCenter.appendChild(toast);
  return $(toast);
}

function createSuccessToast(msg) {
  return createToast(msg, 'success');
}

function createErrorToast(msg) {
  return createToast(msg, 'error');
}
