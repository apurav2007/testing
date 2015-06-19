//'use strict';

var app = angular.module('cartShop', ['credit-cards', 'angular-stripe', 'angularPayments']);

//function to create invoive
createInvoice = function ($scope) {
    $scope.invoice = {
        items: [{
                qty: 1,
                productId: $scope.products[$scope.defaultBuyId].Product.id,
                price: $scope.products[$scope.defaultBuyId].Product.price,
                indexMain: $scope.products[$scope.defaultBuyId],
            }]
    };
    return $scope.invoice;
}

//function to load product colors
getProductColor = function ($scope, $sce, $id) {
    var colorHtml = [];

    angular.forEach($scope.products[$id].Color, function (color) {
        colorHtml.push(color);
    }, this);
    return colorHtml;
}

//function to get product indexes
getProductIndex = function ($scope, name) {
    angular.forEach($scope.products, function (product, key) {
        if (product.Product.name == name) {
            return key
        }
    }, this);
}

//function to get product sizes
getProductSize = function ($scope, $id) {
    var sizeOptions = [];
    angular.forEach($scope.products[$id].Item.Size, function (size, key) {
        sizeOptions.push(size);
    })
    return sizeOptions;
}

app.controller('shoppingCartController', ['$scope', '$http', '$sce', 'stripe', '$window', function ($scope, $http, $sce, stripe, $window) {

        $window.Stripe.setPublishableKey('pk_test_saiYYlyCNgO2yZq6MuQw7EKX');

        $scope.fetchContent = function () {
            $http.get(SITEURL + 'tests/buy2')
                    .success(function (response) {
                        $scope.products = response.products;
                        $scope.defaultProduct = $scope.products[$scope.defaultBuyId];
                        $scope.invoice = createInvoice($scope);

                        //Calling this function out from success scope cause error
                        $scope.getCurrentProductPrice = function () {
                            return $scope.products[$scope.defaultBuyId].Product.price;
                        }

                        //Calling this function out from success scope cause error
                        $scope.cartTotal = function () {
                            var total = 0;
                            angular.forEach($scope.invoice.items, function (item) {
                                total += item.product_amt * item.quantity;
                            });
                            return total;
                        }

                        $scope.availColors = getProductColor($scope, $sce, $scope.defaultBuyId);

                        angular.forEach($scope.products, function (product, key) {
                            if (key == $scope.defaultBuyId) {
                                angular.forEach($scope.products[key].Size, function (size, key) {
                                    $scope.productSize = {key: size};
                                }, this);
                            }
                        }, this);

                        $scope.sizeOptions = getProductSize($scope, $scope.defaultBuyId);
//                        $window.Stripe.setPublishableKey = 'pk_test_saiYYlyCNgO2yZq6MuQw7EKX';
                    });
        }

//Read the data at very first time
        $scope.fetchContent();

        //store all of the form related information
        $scope.master = {};

        $scope.checkQty = function ($this) {
            console.log($this);
        }

        $scope.whatsthevalue = function ($this) {
            console.log($scope.productNameOptions);
        }

        $scope.removeItem = function (index) {
            $scope.invoice.items.splice(index, 1);
        }

        $scope.changeImgSrc = function ($id) {
            $scope.defaultBuyId = $id;
            $("#bigImage").attr('src', $scope.products[$id].img_url);
            $(".product_name").html($scope.products[$id].Product.name);
            $scope.availColors = getProductColor($scope, $sce, $id);
            $scope.sizeOptions = getProductSize($scope, $id);
            $scope.resetSelect();
        }

        $scope.getProductSizess = function (index) {
            $scope.sizeOptions = getProductSize($scope, index);
        }

        $scope.resetSelect = function () {
            $(".custom-select").each(function () {
                if ($(this).parent().is('span.select-wrapper')) {
                    $(this).unwrap();
                    $(this).next().remove();
                }
                $(this).wrap("<span class='select-wrapper'></span>");
                $(this).after("<span class='holder'>" + $(this).children("option:first").text() + "</span>");

            });
        }

        $scope.addItem = function ($params) {
            $http.get(SITEURL + 'tests/add_cart/')
                    .success(function (response) {
                        // The response is shipping price
                        if ($params.resetCart == true) {
                            $scope.invoice = {
                                items: [{
                                        quantity: 1,
                                        product_id: $scope.products[$scope.defaultBuyId].Product.id,
                                        product_name: $scope.products[$scope.defaultBuyId].Product.name,
                                        product_amt: $scope.products[$scope.defaultBuyId].Product.price,
                                        size_id: $scope.products[$scope.defaultBuyId].Item.Size[0].id,
                                        size_title: $scope.products[$scope.defaultBuyId].Item.Size[0].name,
                                        product_color_id: $scope.products[$scope.defaultBuyId].Color[0].id,
                                        color_name: $scope.products[$scope.defaultBuyId].Color[0].title,
                                    }]
                            };
                        } else {
                            $scope.invoice.items.push({
                                quantity: 1,
                                product_id: $scope.products[$scope.defaultBuyId].Product.id,
                                product_name: $scope.products[$scope.defaultBuyId].Product.name,
                                product_amt: $scope.products[$scope.defaultBuyId].Product.price,
                                size_id: $scope.products[$scope.defaultBuyId].Item.Size[0],
                                size_title: $scope.products[$scope.defaultBuyId].Item.Size[0].name,
                                product_color_id: $scope.products[$scope.defaultBuyId].Color[0],
                                color_name: $scope.products[$scope.defaultBuyId].Color[0].title,
                            });
                        }
                        $scope.shipping = response.shipping;
                    });

        }

        $scope.defaultBuy = function ($index) {
            $scope.defaultBuyId = $index;
        }

        $scope.cartItemPreview = function ($index) {
            var pp;
            angular.forEach($scope.invoice.items, function (item, key) {
                if (key == $index) {
                    pp = item.productId;
                }
            })

            angular.forEach($scope.products, function (product, key) {
                if (product.Product.id == pp) {
                    $scope['defaultBuyProduct']['img_url'] = $scope.products[key].img_url;
                    $scope['defaultBuyProduct']['title'] = $scope.products[key].Product.name;
                    $scope['defaultBuyProduct']['price'] = $scope.products[key].Product.price;
                }
            })

        }

        $scope.getDataDefaultBuy = function ($index) {
            $scope.defaultBuyProduct = {title: $scope.products[$scope.defaultBuyId].Product.name, img_url: $scope.products[$scope.defaultBuyId].img_url, price: $scope.products[$scope.defaultBuyId].Product.price};
        }

        //Main function to update cart products
        $scope.updateCartObject = function (index, newPid, size, sizeName, color, colorName) {
            var pID, price, name;

            angular.forEach($scope.products, function (product, key) {
                if (product.Product.id == newPid) {
                    price = product.Product.price;
                    name = product.Product.name;
                }
            })

            $scope.invoice.items[index].product_name = name;
            $scope.invoice.items[index].product_amt = price;
            $scope.invoice.items[index].product_id = newPid;

            if (size) {
                $scope.invoice.items[index].size_id = size;
                $scope.invoice.items[index].size_title = sizeName;
            }
            if (color) {
                $scope.invoice.items[index].product_color_id = color;
                $scope.invoice.items[index].color_name = colorName;
            }

            //console.log($scope.invoice.items[index]); 
        }


        $scope.paypalPay = function (user) {
            var email;
            if (user.email.$valid) {
                email = user.email.$modelValue;
            }
            $scope.cartData = {'OrderProduct': $scope.invoice.items, 'email': email, 'cartTotal': $scope.cartTotal(), 'shipping': $scope.shipping, 'campaign_id': $scope.campaignId};
            $http.post('paypal_pay', $scope.cartData)
                    .success(function (response) {
                        if (response.status) {
                            window.location.href = response.url;
                        } else {
                            $scope.paypalErrorMessage = response.message;
                        }
                    })
        }

        $scope.processForm = function (user) {
            if (user.$valid) {
                $scope.master['email'] = user.email.$modelValue;
                $scope.master['card'] = user.card.$modelValue;
                $scope.master['expire'] = user.expiry.$modelValue;
                if ($scope.usePaypalStrict) {
                    console.log($scope.cartData);
                    $http.post('paypal_pay', $scope.cartData)
                            .success(function (response) {
                                //response
                            })
                } else {
                    $scope.shippingForm = true;
                }
            } else {
                $scope.master = {};
                $scope.shippingForm = false;
            }

        }

        $scope.processShippingForm = function (userDetail) {
            $scope.cartData = [];

            if (userDetail.$valid) {
                $scope.stripChargeRequest = true;
                $scope.stripePaymentMessage = "Please don't close the window. Your payment is under processing.";
                $scope.stripePaymentMessageClass = "info";

                $scope.master['address'] = userDetail.address.$modelValue;
                $scope.master['county'] = userDetail.county.$modelValue;
                $scope.master['country'] = userDetail.country.$modelValue;
                $scope.master['zip'] = userDetail.zip.$modelValue;

            } else {
                return;
                console.log('error trigger');
            }

            $scope.cartData = {'OrderProduct': $scope.invoice.items, 'userDetail': $scope.master, 'cartTotal': $scope.cartTotal(), 'shipping': $scope.shipping, 'campaign_id': $scope.campaignId};

        }

        $scope.createToken = function () {
            var expire = $scope.master.expire.split('/');
            if ($scope.userDetail.$valid === true) {
                $window.Stripe.card.createToken({
                    number: $scope.master.card,
                    cvc: $scope.master.cvv,
                    exp_month: expire[0],
                    exp_year: expire[1],
                }, $scope.makepayment);

            }
        }

        $scope.makepayment = function (status, response) {
            if (response.error) {
                $scope.stripePaymentMessage = response.error.message;
                $scope.stripePaymentMessageClass = "danger";
                $scope.$apply(); // tell angular to update view
            } else {
                // response contains id and card, which contains additional card details
                var data = {token: response.id, data: $scope.cartData};

                $http.post('make_payment', data).success(function (data) {
                    if (data.status) {
                        $scope.stripePaymentMessage = data.message;
                        $scope.stripePaymentMessageClass = "success";
                        window.location.href = 'thanks';
                    } else {
                        $scope.stripePaymentMessage = data.message;
                        $scope.stripePaymentMessageClass = "danger";
                    }

                })
            }

        }

        $scope.goBack = function () {
            $scope.shippingForm = false;
        }

    }]);


//To handle cart form 
app.controller("formCtrl", ['$scope', function ($scope) {
        $scope.master = {};
        $scope.update = function (user) {
            $scope.master = angular.copy(user);
        }
    }]);

app.service('ngCart.fulfilment.paypal', ['$http', function ($http) {


    }]);


