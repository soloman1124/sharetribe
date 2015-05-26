window.ST = window.ST || {};

window.ST.initializeListingShapesOrder = function() {
  var fieldMap = $(".js-listing-shape-row").map(function(id, row) {
    var $row = $(row);
    return {
      id: $row.data("id"),
      element: $row,
      up: $row.find(".js-listing-shape-action-up"),
      down: $row.find(".js-listing-shape-action-down")
    };
  }).get();

  var orderManager = window.ST.orderManager(fieldMap);

  var ajaxRequest = orderManager.order.changes().debounce(800).map(".order")
    .skipDuplicates(_.isEqual)
    .map(function(order) {
    return {
      type: "POST",
      url: ST.utils.relativeUrl("order"),
      data: { order: order }
    };
  });

  var ajaxResponse = ajaxRequest.ajax();
  var ajaxStatus = window.ST.ajaxStatusIndicator(ajaxRequest, ajaxResponse);

  ajaxStatus.loading.onValue(function() {
    $(".js-listing-shape-ajax-saving").show();
    $(".js-listing-shape-ajax-error").hide();
    $(".js-listing-shape-ajax-success").hide();
  });

  ajaxStatus.success.onValue(function() {
    $(".js-listing-shape-ajax-saving").hide();
    $(".js-listing-shape-ajax-success").show();
  });

  ajaxStatus.error.onValue(function() {
    $(".js-listing-shape-ajax-saving").hide();
    $(".js-listing-shape-ajax-error").show();
  });

  ajaxStatus.idle.onValue(function() {
    $(".js-listing-shape-ajax-success").fadeOut();
  });
};

window.ST.initializeListingShapeForm = function(formId) {
  $(formId).validate();

  var priceChanged = function(currentEl) {
    var enabled = currentEl.is(':checked');
    if(enabled) {
      toggleOnlinePaymentEnabled(true);
      toggleUnitsEnabled(true);
    } else {
      toggleOnlinePaymentEnabled(false);
      toggleShippingEnabled(false);
      toggleUnitsEnabled(false);
    }
  };

  var onlinePaymentsChanged = function(currentEl) {
    var enabled = currentEl.is(':checked');
    if(enabled) {
      toggleShippingEnabled(true);
    } else {
      toggleShippingEnabled(false);
    }
  };

  var toggleOnlinePaymentEnabled = function(enabled) {
    toggle($(".js-online-payments"), enabled);
    toggleLabel($(".js-online-payments-label"), enabled);
  };

  var toggleShippingEnabled = function(enabled) {
    toggle($(".js-shipping-enabled"), enabled);
    toggleLabel($(".js-shipping-enabled-label"), enabled);
  };

  var toggleUnitsEnabled = function(enabled) {
    toggle($(".js-unit-checkbox"), enabled);
    toggleLabel($(".js-unit-label"), enabled);
  };

  var customUnitTemplate = _.template($(".js-listing-shape-add-custom-unit-form").html());

  var addCustomUnitForm = function() {
    var uniqueId = _.uniqueId('new_unit-');

    var $form = $(customUnitTemplate({uniqueId: uniqueId}));

    $form.insertBefore($('.js-listing-shape-add-custom-unit-link')).show();
  };

  var toggle = function(el, state) {
    if(state) {
      el.prop('disabled', false);
    } else {
      el.prop('disabled', true);
      el.prop('checked', false);
    }
  };

  var toggleLabel = function(el, state) {
    el.toggleClass("listing-shape-label-disabled", !state);
  };

  $('.js-price-enabled').change(function() {
    priceChanged($(this));
  });
  $('.js-online-payments').change(function() {
    onlinePaymentsChanged($(this));
  });
  $('.js-listing-shape-add-custom-unit-link').click(function() {
    addCustomUnitForm();
  });

  // Run once on init
  priceChanged($('.js-price-enabled'));
  onlinePaymentsChanged($('.js-online-payments'));

};
