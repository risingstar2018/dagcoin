const select = () => {
    return new Promise((resolve, reject) => {
        const x = document.createElement("input");
        x.setAttribute("type", "file");
        x.click();

        x.onchange = () =>  {
            if (x.files.length) {
                resolve(x.files[0]);
            } else {
                reject();
            }
        };
    })
};

export {select};
