const url = './docs/pdf.pdf';

let pdfDoc = null,
    pageNum = 1,
    pageIsRendering = false,
    scale =  1.5,
    pageNumIsPending = null;

// const scale = 1.5,
    const canvas = document.querySelector('#pdf-render'),
    ctx = canvas.getContext('2d');

//Render Page
const renderPage = num => {
     pageIsRendering = true;
     
     //Get the page
     pdfDoc.getPage(num).then( page => {
        //  console.log(page);
        //Set scale
        const viewport = page.getViewport({ scale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderCtx = {
            canvasContext : ctx,
            viewport
        }
        page.render(renderCtx).promise.then( () => {
            pageIsRendering = false;
            
            if(pageNumIsPending !== null) {
                renderPage(pageNumIsPending);
                pageNumIsPending = null;
            }
        });

        //output current page
        // document.querySelector('#page-num').textContent = num;
        document.querySelector('#current_page').value = num;
     })
}

//check for pages rendering
const queueRenderPage = num => {
    if(pageIsRendering){
        pageIsRendering = num;
    } else {
        renderPage(num);
    }
} 

//show prev Page
const showPrevPage = () => {
    if(pageNum <= 1 || pageNum == 1){
        return
    } else {
        pageNum --;
        queueRenderPage(pageNum);
    }
}

//Show Next Page
const showNextPage = () => {
    if (pageNum >= pdfDoc.numPages) {
        return;
    } else {
        pageNum ++;
        queueRenderPage(pageNum);
    }
}

//Get Document
pdfjsLib.getDocument(url).promise.then(pdfDoc_ => {
    pdfDoc = pdfDoc_;  
    // console.log(pdfDoc);

    document.querySelector('#page-count').textContent = pdfDoc.numPages;
    document.querySelector('#file-path').textContent = url;
    renderPage(pageNum)
}).catch(err => {
    //display error
    const div = document.createElement('div');
    div.className = 'error';
    div.appendChild(document.createTextNode(err.message));
    document.querySelector('body').insertBefore(div, canvas);

    //Remove top-nav
    document.querySelector('.top-bar').style.display = 'none';

});

//Button Events

document.querySelector('#prev-page').addEventListener('click', showPrevPage);
document.querySelector('#next-page').addEventListener('click', showNextPage);


//To jump to desired page
document.querySelector('#current_page').addEventListener('keypress', (e) => {
    // console.log(e);

    var code = (e.keyCode ? e.keyCode : e.which);

    if(code == 13) {
        const desiredPage = document.querySelector('#current_page').valueAsNumber;

        if(desiredPage >= 1 && desiredPage <= pdfDoc.numPages){
            renderPage(desiredPage);
        }
    }

});

//Zoom In on click
document.querySelector('#zoomIn').addEventListener('click', () => {
    scale = scale + 0.5;
    renderPage(pageNum);
});

//Zoom Out on click
document.querySelector('#zoomOut').addEventListener('click', () => {
    if(scale <= 0.5) return;

    scale = scale - 0.5;
    renderPage(pageNum);
})