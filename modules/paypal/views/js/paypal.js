
{if $PayPal_in_context_checkout == 1}
	window.paypalCheckoutReady = function() {
	        paypal.checkout.setup("{$PayPal_in_context_checkout_merchant_id}", {
	            environment: {if $PAYPAL_SANDBOX}"sandbox"{else}"production"{/if},
	            click: function(event) {
	                event.preventDefault();

	                paypal.checkout.initXO();
	                updateFormDatas();
				    var str = '';
					if($('#paypal_payment_form input[name="id_product"]').length > 0)
						str += '&id_product='+$('#paypal_payment_form input[name="id_product"]').val();
					if($('#paypal_payment_form input[name="quantity"]').length > 0)
						str += '&quantity='+$('#paypal_payment_form input[name="quantity"]').val();
					if($('#paypal_payment_form input[name="id_p_attr"]').length > 0)
						str += '&id_p_attr='+$('#paypal_payment_form input[name="id_p_attr"]').val();

	                $.support.cors = true;
	                $.ajax({
	                    url: "{$base_dir_ssl}modules/paypal/express_checkout/payment.php",
	                    type: "GET",
	                    data: '&ajax=1&onlytoken=1&express_checkout='+$('input[name="express_checkout"]').val()+'&current_shop_url='+$('input[name="current_shop_url"]').val()+'&bn='+$('input[name="bn"]').val()+str,   
	                    async: true,
	                    crossDomain: true,

	                    success: function (token) {
	                        var url = paypal.checkout.urlPrefix +token;
	                        paypal.checkout.startFlow(url);
	                    },
	                    error: function (responseData, textStatus, errorThrown) {
	                        alert("Error in ajax post"+responseData.statusText);
	                        paypal.checkout.closeFlow();
	                    }
	                });
	            },
	            button: ['paypal_process_payment', 'payment_paypal_express_checkout']
	        });
	    }
{/if}
{literal}

function updateFormDatas()
{
	var nb = $('#quantity_wanted').val();
	var id = $('#idCombination').val();

	$('#paypal_payment_form input[name=quantity]').val(nb);
	$('#paypal_payment_form input[name=id_p_attr]').val(id);
}
	
$(document).ready( function() {

	if($('#in_context_checkout_enabled').val() != 1)
	{
		$('#payment_paypal_express_checkout').click(function() {
			$('#paypal_payment_form').submit();
			return false;
		});
	}

	

	$('#paypal_payment_form').live('submit', function() {
		updateFormDatas();
	});

	function displayExpressCheckoutShortcut() {
		var id_product = $('input[name="id_product"]').val();
		var id_product_attribute = $('input[name="id_product_attribute"]').val();
		$.ajax({
			type: "GET",
			url: baseDir+'/modules/paypal/express_checkout/ajax.php',
			data: { get_qty: "1", id_product: id_product, id_product_attribute: id_product_attribute },
			cache: false,
			success: function(result) {
				if (result == '1') {
					$('#container_express_checkout').slideDown();
				} else {
					$('#container_express_checkout').slideUp();
				}
				return true;
			}
		});
	}

	$('select[name^="group_"]').change(function () {
		setTimeout(function(){displayExpressCheckoutShortcut()}, 500);
	});

	$('.color_pick').click(function () {
		setTimeout(function(){displayExpressCheckoutShortcut()}, 500);
	});

	if($('body#product').length > 0)
		setTimeout(function(){displayExpressCheckoutShortcut()}, 500);
	
	{/literal}
	{if isset($paypal_confirmation)}
	{literal}
		
		$('#container_express_checkout').hide();
		
		$('#cgv').live('click', function() {
			if ($('#cgv:checked').length != 0)
				$(location).attr('href', '{/literal}{$paypal_confirmation}{literal}');
		});
		
		$('#cgv').click(function() {
			if ($('#cgv:checked').length != 0)
				$(location).attr('href', '{/literal}{$paypal_confirmation}{literal}');
		});
		
	{/literal}
	{else if isset($paypal_order_opc)}
	{literal}
	
		$('#cgv').live('click', function() {
			if ($('#cgv:checked').length != 0)
				checkOrder();
		});
		
		$('#cgv').click(function() {
			if ($('#cgv:checked').length != 0)
				checkOrder();
		});
		
	{/literal}
	{/if}
	{literal}

	var modulePath = 'modules/paypal';
	var subFolder = '/integral_evolution';
	{/literal}
	{if $ssl_enabled}
		var baseDirPP = baseDir.replace('http:', 'https:');
	{else}
		var baseDirPP = baseDir;
	{/if}
	{literal}
	var fullPath = baseDirPP + modulePath + subFolder;
	var confirmTimer = false;
		
	if ($('form[target="hss_iframe"]').length == 0) {
		if ($('select[name^="group_"]').length > 0)
			displayExpressCheckoutShortcut();
		return false;
	} else {
		checkOrder();
	}

	function checkOrder() {
		if(confirmTimer == false)
			confirmTimer = setInterval(getOrdersCount, 1000);
	}

	{/literal}{if isset($id_cart)}{literal}
	function getOrdersCount() {

		$.get(
			fullPath + '/confirm.php',
			{ id_cart: '{/literal}{$id_cart}{literal}' },
			function (data) {
				if ((typeof(data) != 'undefined') && (data > 0)) {
					clearInterval(confirmTimer);
					window.location.replace(fullPath + '/submit.php?id_cart={/literal}{$id_cart}{literal}');
					$('p.payment_module, p.cart_navigation').hide();
				}
			}
		);
	}
	{/literal}{/if}{literal}
});

{/literal}
