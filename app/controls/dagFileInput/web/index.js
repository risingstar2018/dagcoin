const getStream = (file) => {
  const fs = window.require('fs');
  return new Promise((resolve, reject) => {
    resolve(fs.createReadStream(file.path));
  });
};

const select = () => new Promise((resolve, reject) => {
  const x = document.createElement('input');
  x.setAttribute('type', 'file');
  x.click();

  x.onchange = () => {
    if (x.files.length) {
      resolve(x.files[0]);
    } else {
      reject();
    }
  };
});

export { select, getStream };
