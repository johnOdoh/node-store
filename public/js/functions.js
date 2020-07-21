const cart = document.getElementById('cart');
const cartTotal = document.getElementById('cart-total');
const products = document.getElementsByClassName('myCart');
const updateBtns = document.getElementsByClassName('updateCart');
const prices = document.getElementsByClassName('itemPrice');
const prods = document.getElementsByClassName('prod');
const tprices = document.getElementsByClassName('itemTotal');

for (let btn of updateBtns) {
    btn.style.display = 'none';
}

function cartSum() {
    let total = 0;
    for (let i = 0; i < tprices.length; i++) {
        let tprice = tprices[i];
        let price = tprice.innerText.replace('$', '');
        total += +price;
    }
    cartTotal.innerText = '$' + total.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

const remove = btn => {
    event.preventDefault();
    const url = btn.href;
    fetch(url, {
            method: 'GET'
        })
        .then(response => {
            if (!response.ok) {
                throw Error();
            }
            return response.json()
        })
        .then(data => {
            if (data.message === 'Deleted') {
                btn.parentNode.parentNode.remove()
                document.getElementById('cart-length').innerText = data.length
                cartSum()
            }
        })
        .catch(err => {
            alert('There was an error, try again!')
            window.location.reload(true)
        })
}

const update = () => {
    for (let i = 0; i < products.length; i++) {
        let product = products[i];
        const initValue = product.value;
        product.addEventListener('change', (event) => {
            let btn = event.target;
            if (btn.value !== initValue) {
                btn.parentElement.nextElementSibling.nextElementSibling.nextElementSibling.style.display = 'block';
            } else {
                btn.parentElement.nextElementSibling.nextElementSibling.nextElementSibling.style.display = 'none';
            }
        })
    }
}
update();

const submit1 = btn => {
    event.preventDefault()
    const csrf = btn.parentNode.querySelector('input[name="_csrf"]').value
    const id = btn.parentNode.querySelector('input[name="id"]').value
    const size = btn.parentNode.previousElementSibling.querySelector('select[name="size"]').value
    if (size == '') {
        return alert('Please choose a size')
    }
    addToCart(csrf, id, size)
}

const submit2 = btn => {
    event.preventDefault()
    const csrf = btn.parentNode.querySelector('input[name="_csrf"]').value
    const id = btn.parentNode.querySelector('input[name="id"]').value
    const size = btn.parentNode.querySelector('input[name="size"]').value
    if (size == '') {
        return alert('Please choose a size')
    }
    addToCart(csrf, id, size)
}

const submit3 = btn => {
    event.preventDefault();
    const container = btn.parentNode.parentNode.parentNode;
    const qty = container.querySelector('input[name="qty"]').value
    const id = container.querySelector('input[name="id"]').value
    const size = container.querySelector('input[name="size"]').value
    const csrf = btn.parentNode.querySelector('input[name="_csrf"]').value
    const price = container.querySelector('.itemPrice').innerText.replace('\$', '')
    console.log(price)

    fetch('/cart', {
            method: 'POST',
            headers: {
                'csrf-token': csrf,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: id,
                size: size,
                qty: qty
            })
        })
        .then(data => {
            if (!data.ok) {
                throw Error();
            }
            return data.json();
        })
        .then(response => {
            btn.parentNode.parentNode.style.display = 'none';
            container.querySelector('input[name="qty"]').value = qty
            container.querySelector('.itemTotal').innerText = '$' + (qty * price).toFixed(2)
            update()
            alert('Product Updated!')
            cartSum()
        })
        .catch(err => {
            alert('There was an error, try again!')
            window.location.reload(true)
        })
}

const submit = (btn) => {
    event.preventDefault();
    const csrf = btn.parentNode.querySelector('input[name="_csrf"]').value
    const id = btn.parentNode.parentNode.previousElementSibling.querySelector('input[name="id"]').value
    const qty = btn.parentNode.parentNode.previousElementSibling.querySelector('input[name="qty"]').value
    let size = btn.parentNode.parentNode.previousElementSibling.querySelector('select[name="size"]')
    if (size === null) {
        size = 'null';
    } else {
        size = size.value;
    }
    if (size == '0') {
        return alert('Please choose a size')
    }
    addToCart(csrf, id, size, qty)
}

const addToCart = (csrf, id, size, qty = undefined) => {
    fetch('/cart', {
            method: 'POST',
            headers: {
                'csrf-token': csrf,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: id,
                size: size,
                qty: qty
            })
        })
        .then(data => {
            if (!data.ok) {
                throw Error(data.statusText);
            }
            return data.json()
        })
        .then(response => {
            document.getElementById('cart-length').innerText = response.length
            alert('Product added!')
        })
        .catch(err => {
            alert('Product not added!')
            console.log(err)
        })
}

//Checkout
function checkout() {
    const radioDiv = document.querySelector('#radios')
    const shippingCost = document.querySelector('#shipping-cost')
    const grandTotal = document.querySelector('#grand-total')
    const orderSummary = document.querySelector('#order-summary')
    const radios = radioDiv.querySelectorAll('input[name="shippingOption"]')

    radios.forEach(element => {
        element.addEventListener('change', () => {
            shippingCost.innerHTML = '$' + element.value
            sum()
        })
    })

    const sum = () => {
        let total = 0;
        orderSummary.querySelectorAll('.val').forEach(element => {
            const val = element.innerHTML.replace('\$', '')
            total += +val
        })
        grandTotal.innerHTML = '$' + total.toLocaleString(undefined, { maximumFractionDigits: 2 })
    }
    sum()
}