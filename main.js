const getSKUs = async(link) => {
    try {
        let SKUs = [];
        const res = await fetch(`https://stark-brushlands-36367.herokuapp.com/${link}`, {cache: "no-cache"});
        const resText = await res.text();
        const parser = new DOMParser();
        const parsedHTML = parser.parseFromString(resText, 'text/html');
        const SKUContainer = parsedHTML.querySelectorAll('.each-sku');

        let index = 0;
        document.querySelector('.qa-results').innerHTML = `<div class="loader"><span></span></div>`;
        for(const sku of SKUContainer){
            index++;
            document.querySelector('.progress').innerHTML = `<span>Checking ${index} / ${SKUContainer.length}</span>`

            let params = new URLSearchParams(sku.querySelector('a.sku-namecategory').search);
            const link = params.get('EdpNo');
            const ItemNo = sku.querySelector('a.sku-namecategory + p').innerText.split('|')[0].split(':')[1];
            const image = sku.querySelector('a.itemImage img').src;
            //const fetchImg = await fetch(`https://stark-brushlands-36367.herokuapp.com/${image}`);
            const checkImg = /no_image/g.test(image)
            const withCloserLook = await checkSKUImages(params.get('EdpNo'))

            SKUs.push({
                edp: link,
                item: ItemNo.trim(),
                withCloserLook: withCloserLook,
                withImg: checkImg ? 'NO' : 'YES'
                //fetchImg.status === 404 ? 'NO' : 'YES'
            })
        }
        if(SKUs.length > 0){
            const tableContent = SKUs.map(s => `<tr>
                <td><a href="https://www.tigerdirect.com/applications/SearchTools/item-details.asp?EdpNo=${s.edp}" target="_blank">${s.item}</a></td>
                <td><span class=${s.withImg === 'NO' && 'cnet'}>${s.withImg}</span></td>
                <td><span class=${s.withCloserLook === false && 'cnet'}>${s.withCloserLook}</span></td>  
            </tr>`).join('');
            document.querySelector('.qa-results').insertAdjacentHTML('afterbegin', `<table class="featured-skus" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                <th>Item#:</th>
                <th>With Image</th>
                <th>With Closer Look Up</th>
            </tr> ${tableContent} </table>`);
        }
        document.querySelector('.progress').innerHTML = '';
        document.querySelector('.qa-results .loader') && document.querySelector('.qa-results .loader').remove() 
    } catch (error) {
        document.querySelector('.progress').innerHTML = '';
        document.querySelector('.qa-results').innerHTML = error;
        console.log(error)
    } 
}

const checkSKUImages = async(edp) => {
    try {
        const res = await fetch(`https://stark-brushlands-36367.herokuapp.com/https://www.tigerdirect.com/applications/searchtools/item-Details.asp?EdpNo=${edp}`, {cache: "no-cache"});
        const resText = await res.text();
        // const parser = new DOMParser();
        // const parsedHTML = parser.parseFromString(resText, 'text/html');
        return /<h2>A Closer Look :<\/h2>/.test(resText)
    } catch (error) {
        return 'Unable to lookup on this SKU'
    }
}

const formButton = document.querySelector('.qa-form form button');
const qaForm = document.querySelector('.qa-form form');
const link = document.querySelector('.qa-form input#link');

qaForm.addEventListener('submit', (e) => {
    e.preventDefault();
    document.querySelector('.qa-results').innerHTML = '';
    getSKUs(link.value)
})
