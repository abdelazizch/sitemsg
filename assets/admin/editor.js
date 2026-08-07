(function () {
  var ImageFormat = Quill.import('formats/image');
  var ATTRIBUTES = ['alt', 'data-caption', 'src', 'width', 'height'];

  class ImageWithAttrs extends ImageFormat {
    static formats(domNode) {
      var formats = {};
      ATTRIBUTES.forEach(function (attr) {
        if (domNode.hasAttribute(attr)) formats[attr] = domNode.getAttribute(attr);
      });
      return formats;
    }
    format(name, value) {
      if (ATTRIBUTES.indexOf(name) > -1) {
        if (value) this.domNode.setAttribute(name, value);
        else this.domNode.removeAttribute(name);
      } else {
        super.format(name, value);
      }
    }
  }
  ImageWithAttrs.blotName = 'image';
  ImageWithAttrs.tagName = 'IMG';
  Quill.register(ImageWithAttrs, true);

  if (window.QuillBetterTable) {
    Quill.register({ 'modules/better-table': QuillBetterTable.default || window.QuillBetterTable }, true);
  }

  var toolbarOptions = [
    [{ header: [2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    ['blockquote', 'code-block'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link', 'image'],
    ['clean'],
  ];

  var modules = {
    toolbar: {
      container: toolbarOptions,
      handlers: { image: imageHandler },
    },
  };
  if (window.QuillBetterTable) {
    modules['better-table'] = { operationMenu: { items: {} } };
    modules.keyboard = { bindings: (QuillBetterTable.default || window.QuillBetterTable).keyboardBindings };
  }

  var quill = new Quill('#editor', {
    theme: 'snow',
    modules: modules,
  });

  window.__lmQuill = quill;

  function uploadImage(file, onDone) {
    var formData = new FormData();
    formData.append('image', file);
    fetch('/api/admin/upload', { method: 'POST', body: formData })
      .then(function (res) {
        return res.json().then(function (data) {
          if (!res.ok) throw new Error(data.error || "Échec de l'upload.");
          return data;
        });
      })
      .then(onDone)
      .catch(function (err) {
        alert("Erreur lors de l'upload de l'image : " + err.message);
      });
  }

  function imageHandler() {
    var input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();
    input.onchange = function () {
      var file = input.files[0];
      if (!file) return;
      var range = quill.getSelection(true);
      uploadImage(file, function (data) {
        quill.insertEmbed(range.index, 'image', data.url, 'user');
        quill.setSelection(range.index + 1);
      });
    };
  }

  quill.root.addEventListener('drop', function (e) {
    if (!e.dataTransfer || !e.dataTransfer.files || !e.dataTransfer.files.length) return;
    e.preventDefault();
    var file = e.dataTransfer.files[0];
    if (!file.type.startsWith('image/')) return;
    var range = quill.getSelection(true) || { index: quill.getLength() };
    uploadImage(file, function (data) {
      quill.insertEmbed(range.index, 'image', data.url, 'user');
      quill.setSelection(range.index + 1);
    });
  });

  // --- Alt text / caption popover on image click ---
  var popover = document.createElement('div');
  popover.style.cssText =
    'position:absolute; z-index:1000; background:#fff; border:1px solid rgba(0,0,0,.2); border-radius:8px; padding:10px; box-shadow:0 6px 18px rgba(0,0,0,.15); display:none; width:260px;';
  popover.innerHTML =
    '<label style="font-size:.8rem; font-weight:600; display:block; margin-bottom:4px;">Texte alternatif</label>' +
    '<input type="text" id="lmImgAlt" style="width:100%; margin-bottom:8px; padding:4px 6px;">' +
    '<label style="font-size:.8rem; font-weight:600; display:block; margin-bottom:4px;">Légende (optionnelle)</label>' +
    '<input type="text" id="lmImgCaption" style="width:100%; margin-bottom:8px; padding:4px 6px;">' +
    '<button type="button" id="lmImgApply" class="btn btn-or" style="padding:4px 10px; min-height:auto;">Appliquer</button>';
  document.body.appendChild(popover);

  var currentImg = null;
  quill.root.addEventListener('click', function (e) {
    if (e.target.tagName !== 'IMG') {
      popover.style.display = 'none';
      return;
    }
    currentImg = e.target;
    var rect = currentImg.getBoundingClientRect();
    popover.style.top = window.scrollY + rect.bottom + 6 + 'px';
    popover.style.left = window.scrollX + rect.left + 'px';
    popover.style.display = 'block';
    document.getElementById('lmImgAlt').value = currentImg.getAttribute('alt') || '';
    document.getElementById('lmImgCaption').value = currentImg.getAttribute('data-caption') || '';
  });

  document.addEventListener('click', function (e) {
    if (e.target.id === 'lmImgApply' && currentImg) {
      currentImg.setAttribute('alt', document.getElementById('lmImgAlt').value);
      var caption = document.getElementById('lmImgCaption').value;
      if (caption) currentImg.setAttribute('data-caption', caption);
      else currentImg.removeAttribute('data-caption');
      popover.style.display = 'none';
    } else if (e.target !== popover && !popover.contains(e.target) && e.target.tagName !== 'IMG') {
      popover.style.display = 'none';
    }
  });

  // --- Sync content into the hidden field before submit ---
  var form = document.querySelector('form.admin-form');
  if (form) {
    form.addEventListener('submit', function () {
      document.getElementById('content_html_field').value = quill.root.innerHTML;
    });
  }
})();
