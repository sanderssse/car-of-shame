
let previousCartState = {};

document.addEventListener("DOMContentLoaded", function () {
    Ecwid.OnAPILoaded.add(function () {
      Ecwid.Cart.clear();
      console.log("Корзина очищена при загрузке страницы");
    });
  });

window.addEventListener("beforeunload", function (e) {
    const confirmationMessage = "Вы уверены, что хотите покинуть страницу?";
    e.returnValue = confirmationMessage; 
    return confirmationMessage;
});

function handleClick(id, el) {

    if (el.dataset.cooldown === "true") {
        console.log("Подожди перед повторным нажатием");
        return;
    }

    addToCart(id, el);

    el.dataset.cooldown = "true";
    el.classList.add('clicked-once'); 

    setTimeout(() => {
        el.dataset.cooldown = "false";
        el.classList.remove('clicked-once');
    }, 2000);
}

function addToCart(id, el) {
    Ecwid.OnAPILoaded.add(function() {
    Ecwid.Cart.get(function (cartBefore) {
      
      const itemBefore = cartBefore.items.find(item => item.product.id === id);
      const quantityBefore = itemBefore ? itemBefore.quantity : 0;
  
      Ecwid.Cart.addProduct({
        id: id,
        quantity: 1,
        callback: function (success, product, cartAfterAdd) {
          if (success) {
            
            setTimeout(() => {
              Ecwid.Cart.get(function (cartAfter) {
                const itemAfter = cartAfter.items.find(item => item.product.id === id);
                const quantityAfter = itemAfter ? itemAfter.quantity : 0;
  
                if (quantityAfter >= quantityBefore + 1) {
                  console.log(`✅ Товар "${product.name}" добавлен в корзину (теперь ${quantityAfter} шт.)`);
                  checkForCar(); 
                } else {
                  console.warn(`⚠️ Ожидалось ${quantityBefore + 1} шт., но сейчас ${quantityAfter} — скорее всего, товар ${product.name} закончился на складе`);
                }
              });
            }, 500);
          } else {
            console.error("❌ Ошибка при добавлении товара в корзину");
          }
        }
      });
    });
  });
}

function checkForCar() {
    setTimeout(() => {
        Ecwid.Cart.get(function(cart) {
            let wheelsCount = 0;

            for (let item of cart.items) {
                if (item.product.id === 741248041) {
                    wheelsCount += item.quantity;
                }
            }
            if (cart.items.length === 4 && wheelsCount >= 2) {
                document.getElementById("carImg").style.display = "none";
                document.getElementById("header").textContent = "Вы собрали автомобиль 🚗🎉";
                document.getElementById("instruction").textContent = "Перезагрузите страницу или удалите товары, чтобы попробовать снова.";
            } else {
                document.getElementById("carImg").style.display = "block";
                document.getElementById("header").textContent = "Собери автомобиль!";
                document.getElementById("instruction").textContent = "Тебе понадобятся два колеса, лобовое стекло, фара и капот.";
            }
        });
    }, 300); 
}


Ecwid.OnCartChanged.add(function(cart) {
    const currentCartState = {};

    cart.items.forEach(item => {
        currentCartState[item.product.id] = item.quantity;
    });

    for (let id in previousCartState) {
        const prevQty = previousCartState[id];
        const currentQty = currentCartState[id] || 0;

        if (currentQty < prevQty) {
            const removedQty = prevQty - currentQty;
            console.log(`❌ Удалено ${removedQty} шт. товара с ID ${id}`);
            setTimeout(() => {
                checkForCar();
            }, 3000);
        }
        if (currentQty > prevQty) {
            setTimeout(() => {
                checkForCar();
            }, 3000);
        }
    }
    previousCartState = currentCartState;
});


