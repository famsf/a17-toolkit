const addListener = (arr, func) => {
    var arrLength = arr.length;
    for (var i = 0; i < arrLength; i++) {
        arr[i].addEventListener('click', func, false);
    }
};

const removeListener = (arr, func) => {
    var arrLength = arr.length;
    for (var i = 0; i < arrLength; i++) {
        arr[i].removeEventListener('click', func);
    }
};

export { addListener, removeListener };
